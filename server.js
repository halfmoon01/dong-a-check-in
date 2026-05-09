const express = require('express');
const sql = require('mssql');
const QRCode = require('qrcode');

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
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('registrations') AND name = 'gender')
    ALTER TABLE registrations ADD gender NVARCHAR(10)
  `);

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('registrations') AND name = 'language')
    ALTER TABLE registrations ADD language NVARCHAR(10)
  `);

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('registrations') AND name = 'country')
    ALTER TABLE registrations ADD country NVARCHAR(50)
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
    ['privacy_text', '□ 개인정보 수집 및 이용 동의 (박람회 현장등록용)\n(주)동아전람은 현장 참관 등록 및 원활한 박람회 입장을 위해 아래와 같이 개인정보를 수집·이용합니다. 본 동의는 박람회 입장을 위한 필수 절차이며, 거부 시 입장이 제한됩니다.\n\n1. 개인정보 수집·이용 항목 및 목적\n(1) 수집항목 및 목적\n회사는 박람회 운영 및 향후 마케팅 활용을 위해 최소한의 정보를 수집합니다.\n□ 필수 항목 - 성명, 주소(광역시, 구까지), 핸드폰번호, 이메일\n□ 이용 목적\n\n박람회 참관 등록 확인 및 입장 관리, 문자초청장(입장권) 발송\n\n동아전람 주관 차기 박람회 개최 정보 안내 및 마케팅 홍보, 뉴스레터 발송\n\n전시산업발전법에 따른 전시회 인증 및 객관적인 통계 분석\n□ 서비스 이용과정 생성 정보 - 서비스 이용기록, 접속로그, 쿠키\n\n(2) 수집방법\n□ 홈페이지 무료관람신청(사전등록), 현장 QR 등록, 고객센터 문의 등\n\n2. 개인정보의 보유 및 이용기간\n회사는 이용자의 개인정보를 약정한 기간 동안 보유하며, 목적 달성 시 지체 없이 파기합니다.\n(1) 관련법령 및 동의에 의한 정보보유\n① 박람회 등록 및 마케팅 활용(문자/카톡/이메일) : 수집일로부터 2년 (2년마다 수신동의를 통해 연장 가능)\n② 계약 또는 청약철회, 대금결제 등에 관한 기록 : 5년\n③ 소비자의 불만 또는 분쟁처리에 관한 기록 : 3년\n④ 웹사이트 방문 기록(로그) : 3개월\n\n(2) 개인정보는 수집 및 이용목적이 달성된 후 지체 없이 파기됩니다. 종이에 출력된 개인정보는 분쇄하거나 소각하고, 전자적 파일형태는 재생할 수 없는 기술적 방법을 사용하여 파기합니다.\n\n3. 개인정보 처리업무의 위탁\n회사는 원활한 서비스 제공을 위하여 다음과 같이 개인정보 처리업무를 외부 전문업체에 위탁하여 운영하고 있습니다.\n□ 수탁업체 : ㈜다우기술(알뜰장문, 엔팩스, 뿌리오) / 스티비\n□ 위탁업무 : 알림톡 및 문자 발송 서비스 제공 / 뉴스레터 발송 서비스 제공\n□ 보유 및 이용기간 : 발송 완료 후 관련 법령에 따른 기간까지\n\n4. 개인정보의 제3자 제공\n수집된 정보는 객관적인 전시회 검증을 위해 한국전시산업진흥회(AKEI)에 제공될 수 있습니다.\n□ 제공받는 자 : (사)한국전시산업진흥회(AKEI)\n□ 제공 목적 : 전시회 인증 및 통계 산출\n□ 제공 항목 : 성명, 연락처 등 전시회 등록 관련 정보\n□ 보유 및 이용기간 : 전시회 검증 완료 시까지\n\n<개인정보관리책임자>\n▶ 성명 : 서 동 휘 / ▶ 전화번호 : 02-780-0366 / ▶ 이메일 : dongaf@naver.com\n\n<권리>\n개인정보 보호법에 의해 개인정보 수집에 동의하지 않으실 수 있습니다. 다만, 동의하지 않으실 경우 동아전람 박람회에 입장이 불가하심을 양지하여 주시기 바랍니다.'],
    ['privacy_text_en', '□ Consent to Collection and Use of Personal Information (For Exhibition On-site Registration)\nDONG-A EXHIBITION CO., LTD. collects and uses personal information as follows for on-site visitor registration and smooth exhibition entry. This consent is a mandatory procedure for entry, and entry will be restricted if you refuse.\n\n1. Items and Purposes of Personal Information Collection and Use\n(1) Items Collected and Purpose\nThe company collects the minimum information necessary for exhibition operation and future marketing.\n□ Required items - Name, address (metropolitan city/district), mobile phone number, email\n□ Purpose of use\n\nConfirmation of exhibition visitor registration, entry management, and sending of SMS invitations (admission tickets)\n\nNotification of upcoming exhibitions hosted by Dong-A Exhibition, marketing promotions, and newsletters\n\nExhibition certification and objective statistical analysis under the Exhibition Industry Development Act\n□ Information generated during service use - Service usage records, access logs, cookies\n\n(2) Collection Method\n□ Free admission application on the website (pre-registration), on-site QR registration, customer center inquiries, etc.\n\n2. Retention and Use Period of Personal Information\nThe company retains the user''s personal information for the agreed period and destroys it without delay upon achieving the purpose.\n(1) Information Retention Based on Relevant Laws and Consent\n① Exhibition registration and marketing use (SMS/KakaoTalk/email): 2 years from the date of collection (renewable every 2 years through consent to receive)\n② Records of contracts, withdrawals, payments, etc.: 5 years\n③ Records of consumer complaints or dispute handling: 3 years\n④ Website visit records (logs): 3 months\n\n(2) Personal information will be destroyed without delay after the purpose of collection and use is achieved. Personal information printed on paper will be shredded or incinerated, and electronic files will be destroyed using technical methods that cannot be recovered.\n\n3. Outsourcing of Personal Information Processing\nThe company outsources personal information processing tasks to external specialized companies as follows for smooth service provision.\n□ Outsourced Companies: Daou Tech Co., Ltd. (AlttulMessage, Nfax, Pulio) / Stibee\n□ Outsourced Tasks: Provision of KakaoTalk notification and SMS sending services / Newsletter sending services\n□ Retention and Use Period: Until the period required by relevant laws after sending is complete\n\n4. Provision of Personal Information to Third Parties\nThe collected information may be provided to the Association of Korea Exhibition Industry (AKEI) for objective exhibition verification.\n□ Recipient: Association of Korea Exhibition Industry (AKEI)\n□ Purpose of Provision: Exhibition certification and statistical calculation\n□ Items Provided: Name, contact information, and other exhibition registration-related information\n□ Retention and Use Period: Until exhibition verification is complete\n\n<Personal Information Manager>\n▶ Name: Seo Dong-Hwi / ▶ Phone: 02-780-0366 / ▶ Email: dongaf@naver.com\n\n<Rights>\nUnder the Personal Information Protection Act, you may refuse to consent to the collection of personal information. However, please note that if you do not consent, you will not be able to enter the Dong-A Exhibition.'],
    ['admin_id', 'admin'],
    ['admin_pw', 'donga2026!'],
    ['exhibition_name', '동아전람 박람회'],
    ['completion_msg1', '입장권을 결제 후 입장해주세요 (1인당 1만원)'],
    ['completion_msg1_color', '#333333'],
    ['completion_msg1_size', '17'],
    ['completion_msg2', '*모바일 초청장/카톡초청장/종이초청장을 소지하신분은 초청장을 제시해주세요'],
    ['completion_msg2_color', '#888888'],
    ['completion_msg2_size', '13'],
    ['completion_msg1_en', 'Please purchase a ticket before entry (₩10,000 per person)'],
    ['completion_msg2_en', '*If you have a mobile/KakaoTalk/paper invitation, please present it.']
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

// Register
app.post('/api/register', checkServerOpen, async (req, res) => {
  try {
    const {
      name, phone, sms_consent, email, email_consent,
      company, address_sido, address_sigungu,
      gender, age_group, job_type, privacy_consent, language, country
    } = req.body;

    const isEn = language === 'en';
    const errors = [];
    if (!name || !name.trim()) errors.push(isEn ? 'Please enter your name.' : '성명을 입력해주세요.');
    else if (/[0-9]/.test(name)) errors.push(isEn ? 'Name cannot contain numbers.' : '성명에 숫자를 입력할 수 없습니다.');
    else if (/[ㄱ-ㅎㅏ-ㅣ]/.test(name)) errors.push(isEn ? 'Please enter a valid name.' : '성명을 정확히 입력해주세요.');
    else if (name.replace(/\s/g, '').length < 2) errors.push(isEn ? 'Name must be at least 2 characters.' : '성명을 2자 이상 입력해주세요.');
    if (!phone || phone.replace(/[^0-9]/g, '').length < 7) errors.push(isEn ? 'Please enter a valid phone number.' : '휴대폰 번호를 정확히 입력해주세요.');
    if (isEn && (!email || !email.trim())) errors.push('Email is required.');
    if (email && (email.match(/@/g) || []).length !== 1) errors.push(isEn ? 'Invalid email format.' : '이메일 형식이 올바르지 않습니다.');
    if (!isEn && !address_sido) errors.push('시/도를 선택해주세요.');
    if (!isEn && !address_sigungu) errors.push('시/군/구를 선택해주세요.');
    if (isEn && !country) errors.push('Please select your country.');
    if (isEn && (!company || !company.trim())) errors.push('Please enter your company.');
    if (!sms_consent) errors.push(isEn ? 'Please agree to SMS notifications.' : '문자(SMS), 카카오톡 수신 동의에 체크해주세요.');
    if (email && !email_consent) errors.push(isEn ? 'Please agree to email notifications.' : '이메일 수신 동의에 체크해주세요.');
    if (!age_group) errors.push(isEn ? 'Please select age group.' : '연령대를 선택해주세요.');
    if (!job_type) errors.push(isEn ? 'Please select job type.' : '직업군을 선택해주세요.');
    if (!privacy_consent) errors.push(isEn ? 'Please agree to privacy policy.' : '개인정보 수집·이용에 동의해주세요.');

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
      .input('gender', sql.NVarChar, gender || null)
      .input('age_group', sql.NVarChar, age_group || null)
      .input('job_type', sql.NVarChar, job_type || null)
      .input('privacy_consent', sql.Int, privacy_consent ? 1 : 0)
      .input('reg_number', sql.NVarChar, regNumber)
      .input('language', sql.NVarChar, language || 'ko')
      .input('country', sql.NVarChar, country || null)
      .query(`
        INSERT INTO registrations (name, phone, sms_consent, email, email_consent, company, address_sido, address_sigungu, gender, age_group, job_type, privacy_consent, reg_number, language, country)
        VALUES (@name, @phone, @sms_consent, @email, @email_consent, @company, @address_sido, @address_sigungu, @gender, @age_group, @job_type, @privacy_consent, @reg_number, @language, @country)
      `);

    res.json({ success: true, reg_number: regNumber, name, job_type });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '등록 중 오류가 발생했습니다.' });
  }
});

// Generate QR code
app.get('/api/qrcode/:regNumber', async (req, res) => {
  try {
    const result = await pool.request()
      .input('regNumber', sql.NVarChar, req.params.regNumber)
      .query("SELECT reg_number, name, job_type FROM registrations WHERE reg_number = @regNumber");

    let payload;
    if (result.recordset.length > 0) {
      const r = result.recordset[0];
      payload = JSON.stringify({
        reg: r.reg_number,
        name: r.name,
        job: r.job_type
      });
    } else {
      payload = req.params.regNumber;
    }

    const qrData = await QRCode.toDataURL(payload, {
      width: 250,
      margin: 2
    });
    res.json({ qr: qrData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'QR 생성 실패' });
  }
});

// Start server after DB init
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행중입니다.`);
  });
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});
