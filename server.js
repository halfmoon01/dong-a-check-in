const express = require('express');
const sql = require('mssql');
const multer = require('multer');
const ExcelJS = require('exceljs');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Azure SQL connection config
const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME || 'dong-a-db',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

let pool;

async function initDb() {
  pool = await sql.connect(dbConfig);

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='registrations' AND xtype='U')
    CREATE TABLE registrations (
      id INT IDENTITY(1,1) PRIMARY KEY,
      name NVARCHAR(100) NOT NULL,
      phone NVARCHAR(20) NOT NULL,
      sms_consent INT DEFAULT 0,
      email NVARCHAR(200),
      email_consent INT DEFAULT 0,
      company NVARCHAR(200),
      address_sido NVARCHAR(50),
      address_sigungu NVARCHAR(50),
      age_group NVARCHAR(20),
      job_type NVARCHAR(50),
      privacy_consent INT DEFAULT 0,
      reg_number NVARCHAR(20) UNIQUE,
      created_at DATETIME DEFAULT GETDATE()
    )
  `);

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='settings' AND xtype='U')
    CREATE TABLE settings (
      [key] NVARCHAR(100) PRIMARY KEY,
      value NVARCHAR(MAX)
    )
  `);

  // Initialize default settings
  const defaults = [
    ['server_open', '1'],
    ['privacy_text', '개인정보 수집·이용 동의\n\n1. 수집항목: 성명, 연락처, 이메일, 소속(회사), 주소, 연령대, 직업군\n2. 수집목적: 박람회 현장등록 및 관리, 박람회 관련 정보 제공\n3. 보유기간: 박람회 종료 후 1년\n\n위 개인정보 수집·이용에 동의하십니까?'],
    ['admin_id', 'admin'],
    ['admin_pw', 'donga2026!'],
    ['exhibition_name', '동아전람 박람회']
  ];

  for (const [key, value] of defaults) {
    await pool.request()
      .input('key', sql.NVarChar, key)
      .input('value', sql.NVarChar, value)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM settings WHERE [key] = @key)
        INSERT INTO settings ([key], value) VALUES (@key, @value)
      `);
  }

  console.log('Database initialized');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 캐시 방지
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  next();
});

app.use(express.static('public'));

// Logo upload
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'exhibition_logo' + ext);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

// Middleware: check if server is open
async function checkServerOpen(req, res, next) {
  try {
    const result = await pool.request()
      .input('key', sql.NVarChar, 'server_open')
      .query("SELECT value FROM settings WHERE [key] = @key");
    if (result.recordset.length > 0 && result.recordset[0].value === '0') {
      return res.status(503).json({ error: '현재 등록이 마감되었습니다.' });
    }
    next();
  } catch (err) {
    next(err);
  }
}

// Get settings
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.request().query("SELECT [key], value FROM settings");
    const settings = {};
    result.recordset.forEach(r => { settings[r.key] = r.value; });
    delete settings.admin_id;
    delete settings.admin_pw;
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '설정 조회 실패' });
  }
});

// Get logo info
app.get('/api/logo', (req, res) => {
  const uploadsDir = path.join(__dirname, 'public/uploads');
  const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
  const logo = files.find(f => f.startsWith('exhibition_logo'));
  if (logo) {
    const stat = fs.statSync(path.join(uploadsDir, logo));
    res.json({ logo: `/uploads/${logo}?t=${stat.mtimeMs}` });
  } else {
    res.json({ logo: null });
  }
});

// Register
app.post('/api/register', checkServerOpen, async (req, res) => {
  try {
    const {
      name, phone, sms_consent, email, email_consent,
      company, address_sido, address_sigungu,
      age_group, job_type, privacy_consent
    } = req.body;

    const errors = [];
    if (!name || !name.trim()) errors.push('성명을 입력해주세요.');
    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) errors.push('휴대폰 번호를 정확히 입력해주세요.');
    if (!address_sido) errors.push('시/도를 선택해주세요.');
    if (!address_sigungu) errors.push('시/군/구를 선택해주세요.');
    if (!sms_consent) errors.push('문자(SMS), 카카오톡 수신 동의에 체크해주세요.');
    if (email && !email_consent) errors.push('이메일 수신 동의에 체크해주세요.');
    if (!age_group) errors.push('연령대를 선택해주세요.');
    if (!job_type) errors.push('직업군을 선택해주세요.');
    if (!privacy_consent) errors.push('개인정보 수집·이용에 동의해주세요.');

    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0], errors });
    }

    // Generate registration number
    const now = new Date();
    const dateStr = now.getFullYear().toString().slice(2) +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');

    const maxResult = await pool.request()
      .query("SELECT MAX(id) as maxId FROM registrations");
    const nextId = (maxResult.recordset[0].maxId || 0) + 1;
    const regNumber = dateStr + String(nextId).padStart(5, '0');

    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('phone', sql.NVarChar, phone)
      .input('sms_consent', sql.Int, sms_consent ? 1 : 0)
      .input('email', sql.NVarChar, email || null)
      .input('email_consent', sql.Int, email_consent ? 1 : 0)
      .input('company', sql.NVarChar, company || null)
      .input('address_sido', sql.NVarChar, address_sido || null)
      .input('address_sigungu', sql.NVarChar, address_sigungu || null)
      .input('age_group', sql.NVarChar, age_group || null)
      .input('job_type', sql.NVarChar, job_type || null)
      .input('privacy_consent', sql.Int, privacy_consent ? 1 : 0)
      .input('reg_number', sql.NVarChar, regNumber)
      .query(`
        INSERT INTO registrations (name, phone, sms_consent, email, email_consent, company, address_sido, address_sigungu, age_group, job_type, privacy_consent, reg_number)
        VALUES (@name, @phone, @sms_consent, @email, @email_consent, @company, @address_sido, @address_sigungu, @age_group, @job_type, @privacy_consent, @reg_number)
      `);

    res.json({ success: true, reg_number: regNumber, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '등록 중 오류가 발생했습니다.' });
  }
});

// Generate QR code
app.get('/api/qrcode/:regNumber', async (req, res) => {
  try {
    const qrData = await QRCode.toDataURL(req.params.regNumber, {
      width: 250,
      margin: 2
    });
    res.json({ qr: qrData });
  } catch (err) {
    res.status(500).json({ error: 'QR 생성 실패' });
  }
});

// ===== Admin APIs =====

async function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: '인증이 필요합니다.' });

    const [id, pw] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

    const result = await pool.request()
      .query("SELECT [key], value FROM settings WHERE [key] IN ('admin_id', 'admin_pw')");

    const settings = {};
    result.recordset.forEach(r => { settings[r.key] = r.value; });

    if (settings.admin_id !== id || settings.admin_pw !== pw) {
      return res.status(401).json({ error: '인증 실패' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: '인증 처리 중 오류' });
  }
}

app.post('/api/admin/login', async (req, res) => {
  try {
    const { id, pw } = req.body;
    const result = await pool.request()
      .query("SELECT [key], value FROM settings WHERE [key] IN ('admin_id', 'admin_pw')");

    const settings = {};
    result.recordset.forEach(r => { settings[r.key] = r.value; });

    if (settings.admin_id === id && settings.admin_pw === pw) {
      const token = Buffer.from(`${id}:${pw}`).toString('base64');
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: '아이디 또는 비밀번호가 틀렸습니다.' });
    }
  } catch (err) {
    res.status(500).json({ error: '로그인 처리 중 오류' });
  }
});

app.get('/api/admin/settings', adminAuth, async (req, res) => {
  try {
    const result = await pool.request().query("SELECT [key], value FROM settings");
    const settings = {};
    result.recordset.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: '설정 조회 실패' });
  }
});

app.post('/api/admin/settings', adminAuth, async (req, res) => {
  try {
    const { key, value } = req.body;
    const allowed = ['server_open', 'privacy_text', 'exhibition_name', 'admin_id', 'admin_pw'];
    if (!allowed.includes(key)) return res.status(400).json({ error: '허용되지 않는 설정입니다.' });

    await pool.request()
      .input('key', sql.NVarChar, key)
      .input('value', sql.NVarChar, value)
      .query(`
        MERGE settings AS target
        USING (SELECT @key AS [key]) AS source
        ON target.[key] = source.[key]
        WHEN MATCHED THEN UPDATE SET value = @value
        WHEN NOT MATCHED THEN INSERT ([key], value) VALUES (@key, @value);
      `);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '설정 저장 실패' });
  }
});

app.post('/api/admin/upload-logo', adminAuth, (req, res, next) => {
  const uploadsDir = path.join(__dirname, 'public/uploads');
  if (fs.existsSync(uploadsDir)) {
    fs.readdirSync(uploadsDir).forEach(f => {
      if (f.startsWith('exhibition_logo')) {
        fs.unlinkSync(path.join(uploadsDir, f));
      }
    });
  }
  next();
}, upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '파일 업로드 실패' });
  res.json({ success: true, path: `/uploads/${req.file.filename}` });
});

app.get('/api/admin/registrations', adminAuth, async (req, res) => {
  try {
    const result = await pool.request()
      .query('SELECT * FROM registrations ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: '목록 조회 실패' });
  }
});

app.delete('/api/admin/registrations/:id', adminAuth, async (req, res) => {
  try {
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM registrations WHERE id = @id');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '삭제 실패' });
  }
});

app.get('/api/admin/export', adminAuth, async (req, res) => {
  try {
    const result = await pool.request()
      .query('SELECT * FROM registrations ORDER BY created_at ASC');
    const rows = result.recordset;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('무료관람신청목록');

    sheet.columns = [
      { header: '수신동의일', key: 'created_at', width: 20 },
      { header: '핸드폰번호', key: 'phone', width: 18 },
      { header: '성명', key: 'name', width: 12 },
      { header: '지역(시,도)', key: 'address_sido', width: 15 },
      { header: '지역(시,군,구)', key: 'address_sigungu', width: 15 },
      { header: '이메일', key: 'email', width: 25 },
      { header: '연령', key: 'age_group', width: 10 },
      { header: '직업군유형', key: 'job_type', width: 18 },
      { header: '소속(회사)', key: 'company', width: 20 }
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { horizontal: 'center' };

    rows.forEach((row) => {
      sheet.addRow({
        created_at: row.created_at,
        phone: row.phone,
        name: row.name,
        address_sido: row.address_sido || '',
        address_sigungu: row.address_sigungu || '',
        email: row.email || '',
        age_group: row.age_group || '',
        job_type: row.job_type || '',
        company: row.company || ''
      });
    });

    sheet.eachRow(row => {
      row.eachCell(cell => {
        cell.numFmt = '@';
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '엑셀 생성 실패' });
  }
});

// Start server after DB init
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행중입니다.`);
    console.log(`관리자 페이지: http://localhost:${PORT}/admin.html`);
  });
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});
