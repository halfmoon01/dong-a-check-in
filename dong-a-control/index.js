const { app } = require('@azure/functions');
const { WebSiteManagementClient } = require('@azure/arm-appservice');
const { DefaultAzureCredential } = require('@azure/identity');
const sql = require('mssql');
const ExcelJS = require('exceljs');

const SUBSCRIPTION_ID = '2f2e9da9-bda0-460e-894f-041943cbd635';
const RESOURCE_GROUP = 'rg-dong-a';
const APP_NAME = 'dong-a-registration';

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME || 'dong-a-db',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: { encrypt: true, trustServerCertificate: false }
};

let pool;
async function getPool() {
  if (!pool || !pool.connected) {
    pool = await sql.connect(dbConfig);
  }
  return pool;
}

function getAzureClient() {
  return new WebSiteManagementClient(new DefaultAzureCredential(), SUBSCRIPTION_ID);
}

async function verifyAdmin(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const parts = authHeader.split(' ');
  if (parts.length < 2) return false;
  const [id, pw] = Buffer.from(parts[1], 'base64').toString().split(':');
  try {
    const p = await getPool();
    const result = await p.request()
      .query("SELECT [key], value FROM settings WHERE [key] IN ('admin_id', 'admin_pw')");
    const s = {};
    result.recordset.forEach(r => { s[r.key] = r.value; });
    return s.admin_id === id && s.admin_pw === pw;
  } catch {
    return false;
  }
}

// ── HTML PAGE ────────────────────────────────────────────────────────────────
const HTML_PAGE = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>동아전람 관리자</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:-apple-system,'Malgun Gothic',sans-serif; background:#f0f2f5; color:#333; }
    .login-page { display:flex; align-items:center; justify-content:center; min-height:100vh; }
    .login-card { background:#fff; padding:40px; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.1); width:360px; }
    .login-card h2 { text-align:center; margin-bottom:24px; color:#e53e3e; }
    .login-card input { width:100%; padding:12px; border:1px solid #ddd; border-radius:6px; font-size:15px; margin-bottom:12px; outline:none; }
    .login-card input:focus { border-color:#e53e3e; }
    .login-card button { width:100%; padding:14px; background:#e53e3e; color:#fff; border:none; border-radius:6px; font-size:16px; font-weight:700; cursor:pointer; }
    .login-card button:hover { background:#c53030; }
    .login-error { color:#e53e3e; font-size:13px; text-align:center; margin-top:8px; display:none; }
    .admin-page { display:none; }
    .admin-header { background:#fff; padding:16px 24px; display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #e0e0e0; }
    .admin-header h1 { font-size:20px; color:#e53e3e; }
    .btn-logout { padding:8px 16px; background:#666; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:13px; }
    .admin-content { max-width:1000px; margin:24px auto; padding:0 16px; }
    .card { background:#fff; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.06); padding:24px; margin-bottom:20px; }
    .card h3 { font-size:17px; margin-bottom:16px; padding-bottom:10px; border-bottom:1px solid #eee; }
    .toggle-row { display:flex; align-items:center; gap:16px; }
    .toggle { width:60px; height:32px; background:#ccc; border-radius:16px; position:relative; cursor:pointer; transition:background 0.3s; }
    .toggle.on { background:#48bb78; }
    .toggle::after { content:''; position:absolute; width:26px; height:26px; background:#fff; border-radius:50%; top:3px; left:3px; transition:left 0.3s; }
    .toggle.on::after { left:31px; }
    .toggle-label { font-size:15px; font-weight:600; }
    .admin-input { width:100%; padding:10px 12px; border:1px solid #ddd; border-radius:6px; font-size:14px; outline:none; }
    .admin-input:focus { border-color:#e53e3e; }
    .admin-textarea { width:100%; padding:12px; border:1px solid #ddd; border-radius:6px; font-size:14px; min-height:150px; resize:vertical; outline:none; font-family:inherit; }
    .admin-textarea:focus { border-color:#e53e3e; }
    .btn { padding:10px 20px; border:none; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-primary { background:#e53e3e; color:#fff; }
    .btn-primary:hover { background:#c53030; }
    .btn-secondary { background:#4a5568; color:#fff; }
    .btn-secondary:hover { background:#2d3748; }
    .btn-success { background:#48bb78; color:#fff; }
    .btn-success:hover { background:#38a169; }
    .btn-start { background:#2563eb; color:#fff; }
    .btn-start:hover { background:#1d4ed8; }
    .btn-stop-app { background:#dc2626; color:#fff; }
    .btn-stop-app:hover { background:#b91c1c; }
    .btn-danger { background:#e53e3e; color:#fff; font-size:12px; padding:6px 12px; border:none; border-radius:4px; cursor:pointer; }
    .btn-edit { background:#d97706; color:#fff; font-size:12px; padding:6px 12px; border:none; border-radius:4px; cursor:pointer; }
    .btn-edit:hover { background:#b45309; }
    .form-row { margin-bottom:14px; }
    .form-row label { display:block; font-size:13px; font-weight:600; color:#555; margin-bottom:6px; }
    .stats-row { display:flex; gap:16px; margin-bottom:20px; flex-wrap:wrap; }
    .stat-card { flex:1; min-width:120px; background:#fff; border-radius:10px; padding:20px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
    .stat-number { font-size:32px; font-weight:700; color:#e53e3e; }
    .stat-label { font-size:13px; color:#888; margin-top:4px; }
    .table-wrap { overflow-x:auto; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th { background:#f7f7f7; padding:10px 8px; text-align:left; font-weight:600; border-bottom:2px solid #e0e0e0; white-space:nowrap; }
    td { padding:10px 8px; border-bottom:1px solid #eee; white-space:nowrap; }
    tr:hover td { background:#fafafa; }
    .btn-row { display:flex; gap:8px; margin-top:12px; flex-wrap:wrap; }
    .file-upload { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
    .current-logo { max-height:60px; border:1px solid #eee; border-radius:4px; }
    .msg { padding:8px 12px; border-radius:6px; font-size:13px; margin-top:8px; display:none; }
    .msg-success { background:#f0fff4; color:#38a169; border:1px solid #c6f6d5; }
    .msg-error { background:#fff5f5; color:#e53e3e; border:1px solid #fed7d7; }
    .app-status-badge { display:inline-block; padding:4px 12px; border-radius:12px; font-size:13px; font-weight:600; }
    .app-running { background:#dcfce7; color:#15803d; }
    .app-stopped { background:#fee2e2; color:#b91c1c; }
    .app-unknown { background:#f3f4f6; color:#6b7280; }
  .chart-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  @media(max-width:700px){ .chart-grid { grid-template-columns:1fr; } }
  .chart-box { position:relative; height:260px; }
  </style>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>

<div class="login-page" id="loginPage">
  <div class="login-card">
    <h2>관리자 로그인</h2>
    <input type="text" id="loginId" placeholder="아이디">
    <input type="password" id="loginPw" placeholder="비밀번호" onkeydown="if(event.key==='Enter')doLogin()">
    <button onclick="doLogin()">로그인</button>
    <div class="login-error" id="loginError">아이디 또는 비밀번호가 틀렸습니다.</div>
  </div>
</div>

<div class="admin-page" id="adminPage">
  <div class="admin-header">
    <h1>동아전람 관리자</h1>
    <div style="display:flex; gap:8px;">
      <a href="https://dong-a-registration-gkerh5gxgqhhbmhp.canadacentral-01.azurewebsites.net" target="_blank" style="padding:8px 16px; background:#3182ce; color:#fff; border-radius:6px; font-size:13px; text-decoration:none; font-weight:600;">메인 페이지</a>
      <button class="btn-logout" onclick="doLogout()">로그아웃</button>
    </div>
  </div>

  <div class="admin-content">
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-number" id="statTotal">0</div>
        <div class="stat-label">전체 등록</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" id="statToday">0</div>
        <div class="stat-label">오늘 등록</div>
      </div>
    </div>

    <!-- App Service Control -->
    <div class="card">
      <h3>앱 서버 제어 (Azure App Service)</h3>
      <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
        <div>
          상태:
          <span class="app-status-badge app-unknown" id="appStatusBadge">확인 중...</span>
        </div>
        <button class="btn btn-start" onclick="appControl('appstart')">▶ 서버 시작</button>
        <button class="btn btn-stop-app" onclick="appControl('appstop')">■ 서버 중지</button>
        <button class="btn btn-secondary" style="padding:8px 14px;font-size:13px;" onclick="loadAppStatus()">새로고침</button>
      </div>
      <p style="font-size:12px; color:#888; margin-top:10px;">서버를 중지하면 등록 사이트가 완전히 꺼집니다. 데이터는 유지됩니다.</p>
      <div class="msg msg-success" id="appMsg"></div>
    </div>

    <!-- Registration Toggle -->
    <div class="card">
      <h3>등록 접수 on/off</h3>
      <div class="toggle-row">
        <div class="toggle" id="serverToggle" onclick="toggleServer()"></div>
        <span class="toggle-label" id="serverStatus">등록 열림</span>
      </div>
      <p style="font-size:12px; color:#888; margin-top:8px;">서버는 켜진 상태에서 새 등록만 차단합니다.</p>
    </div>

    <!-- Exhibition Settings -->
    <div class="card">
      <h3>박람회 설정</h3>
      <div class="form-row">
        <label>박람회 이름</label>
        <div style="display:flex; gap:8px;">
          <input class="admin-input" id="exhibitionName" placeholder="예: 제70회 MBC건축박람회">
          <button class="btn btn-primary" onclick="saveExhibitionName()" style="white-space:nowrap; padding:10px 28px;">저장</button>
        </div>
      </div>
      <div class="form-row" style="margin-top:16px;">
        <label>박람회 로고 (JPG/PNG)</label>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <input type="file" id="logoFile" accept="image/*" style="flex:1; min-width:0; padding:8px; border:1px solid #ddd; border-radius:6px; font-size:14px;">
          <button class="btn btn-primary" onclick="uploadLogo()" style="white-space:nowrap; padding:10px 28px;">저장</button>
          <img class="current-logo" id="currentLogo" style="display:none;">
        </div>
      </div>
      <div class="msg msg-success" id="settingsMsg"></div>
    </div>

    <!-- Privacy Text -->
    <div class="card">
      <h3>개인정보 수집·이용 동의 문구</h3>
      <textarea class="admin-textarea" id="privacyText"></textarea>
      <div class="btn-row">
        <button class="btn btn-primary" onclick="savePrivacy()" style="padding:10px 40px;">저장</button>
      </div>
      <div class="msg msg-success" id="privacyMsg"></div>
    </div>

    <!-- Account Change -->
    <div class="card">
      <h3>관리자 계정 변경</h3>
      <div class="form-row">
        <label>새 아이디</label>
        <input class="admin-input" type="text" id="newAdminId" placeholder="새 아이디 입력">
      </div>
      <div class="form-row">
        <label>새 비밀번호</label>
        <input class="admin-input" type="password" id="newPassword" placeholder="새 비밀번호 입력">
      </div>
      <div class="btn-row">
        <button class="btn btn-secondary" onclick="changeAccount()" style="padding:10px 40px;">변경</button>
      </div>
      <div class="msg msg-success" id="pwMsg"></div>
    </div>

    <!-- Charts -->
    <div class="card">
      <h3>등록 통계</h3>
      <div class="chart-grid" style="margin-bottom:20px;">
        <div>
          <div style="font-size:13px;font-weight:600;color:#555;margin-bottom:8px;">날짜별 등록 추이</div>
          <div class="chart-box"><canvas id="chartDaily"></canvas></div>
        </div>
        <div>
          <div style="font-size:13px;font-weight:600;color:#555;margin-bottom:8px;">연령대별</div>
          <div class="chart-box"><canvas id="chartAge"></canvas></div>
        </div>
        <div>
          <div style="font-size:13px;font-weight:600;color:#555;margin-bottom:8px;">지역별 (시/도)</div>
          <div class="chart-box"><canvas id="chartRegion"></canvas></div>
        </div>
        <div>
          <div style="font-size:13px;font-weight:600;color:#555;margin-bottom:8px;">직업군별</div>
          <div class="chart-box"><canvas id="chartJob"></canvas></div>
        </div>
        <div>
          <div style="font-size:13px;font-weight:600;color:#555;margin-bottom:8px;">성별</div>
          <div class="chart-box"><canvas id="chartGender"></canvas></div>
        </div>
      </div>
    </div>

    <!-- Registration List -->
    <div class="card">
      <h3>등록 목록</h3>
      <div class="btn-row" style="margin-bottom:12px;">
        <button class="btn btn-success" onclick="exportExcel()">엑셀 다운로드</button>
        <button class="btn btn-secondary" onclick="loadRegistrations()">새로고침</button>
        <button class="btn" style="background:#94a3b8;color:#fff;font-size:12px;padding:8px 14px;" onclick="seedData()">목데이터 생성</button>
        <button class="btn btn-danger" style="font-size:12px;padding:8px 14px;" onclick="deleteAll()">전체 삭제</button>
      </div>
      <div style="margin-bottom:12px;">
        <input type="text" class="admin-input" id="searchInput" placeholder="이름, 연락처, 등록번호, 소속으로 검색..." oninput="filterTable()" style="max-width:360px;">
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No</th><th>등록번호</th><th>성명</th><th>연락처</th>
              <th>이메일</th><th>소속</th><th>주소</th><th>연령</th>
              <th>직업군</th><th>등록일시</th><th>수정/삭제</th>
            </tr>
          </thead>
          <tbody id="regTableBody"></tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<script>
  let authToken = localStorage.getItem('admin_token') || '';
  if (authToken) showAdmin();

  function headers() {
    return { 'Authorization': 'Basic ' + authToken, 'Content-Type': 'application/json' };
  }

  async function doLogin() {
    const id = document.getElementById('loginId').value;
    const pw = document.getElementById('loginPw').value;
    const errEl = document.getElementById('loginError');
    errEl.style.display = 'none';
    if (!id || !pw) { errEl.textContent = '아이디와 비밀번호를 입력해주세요.'; errEl.style.display = 'block'; return; }
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pw })
      });
      const data = await res.json();
      if (data.success) {
        authToken = data.token;
        localStorage.setItem('admin_token', authToken);
        showAdmin();
      } else if (res.status === 401) {
        alert('아이디 또는 비밀번호가 틀렸습니다.');
      } else {
        alert('서버 오류 ' + res.status + ': ' + (data.error || '알 수 없는 오류'));
      }
    } catch (e) {
      alert('네트워크 오류: ' + e.message);
    }
  }

  function doLogout() {
    authToken = '';
    localStorage.removeItem('admin_token');
    document.getElementById('adminPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
  }

  async function showAdmin() {
    try {
      const res = await fetch('/settings', { headers: headers() });
      if (!res.ok) { doLogout(); return; }
      const settings = await res.json();

      document.getElementById('loginPage').style.display = 'none';
      document.getElementById('adminPage').style.display = 'block';

      const isOpen = settings.server_open === '1';
      document.getElementById('serverToggle').classList.toggle('on', isOpen);
      document.getElementById('serverStatus').textContent = isOpen ? '등록 열림' : '등록 닫힘';
      document.getElementById('privacyText').value = settings.privacy_text || '';
      document.getElementById('exhibitionName').value = settings.exhibition_name || '';

      if (settings.exhibition_logo) {
        document.getElementById('currentLogo').src = settings.exhibition_logo;
        document.getElementById('currentLogo').style.display = 'block';
      }

      loadRegistrations();
      loadAppStatus();
    } catch {
      doLogout();
    }
  }

  async function loadAppStatus() {
    const badge = document.getElementById('appStatusBadge');
    badge.textContent = '확인 중...';
    badge.className = 'app-status-badge app-unknown';
    try {
      const res = await fetch('/appstatus', { headers: headers() });
      const data = await res.json();
      if (data.state === 'Running') {
        badge.textContent = '실행 중';
        badge.className = 'app-status-badge app-running';
      } else if (data.state === 'Stopped') {
        badge.textContent = '중지됨';
        badge.className = 'app-status-badge app-stopped';
      } else {
        badge.textContent = data.state || '알 수 없음';
        badge.className = 'app-status-badge app-unknown';
      }
    } catch {
      badge.textContent = '오류';
      badge.className = 'app-status-badge app-unknown';
    }
  }

  async function appControl(action) {
    const msgEl = document.getElementById('appMsg');
    msgEl.className = 'msg msg-success';
    msgEl.textContent = action === 'appstart' ? '시작 중...' : '중지 중...';
    msgEl.style.display = 'block';
    try {
      const res = await fetch('/' + action, { method: 'POST', headers: headers() });
      const data = await res.json();
      msgEl.textContent = data.message || data.error || '';
      setTimeout(() => { loadAppStatus(); }, 5000);
    } catch (e) {
      msgEl.className = 'msg msg-error';
      msgEl.textContent = '오류가 발생했습니다.';
    }
  }

  async function toggleServer() {
    const toggle = document.getElementById('serverToggle');
    const isOn = toggle.classList.contains('on');
    const newValue = isOn ? '0' : '1';
    await fetch('/settings', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ key: 'server_open', value: newValue })
    });
    toggle.classList.toggle('on');
    document.getElementById('serverStatus').textContent = newValue === '1' ? '등록 열림' : '등록 닫힘';
  }

  async function savePrivacy() {
    const text = document.getElementById('privacyText').value;
    await fetch('/settings', {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ key: 'privacy_text', value: text })
    });
    showMsg('privacyMsg', '저장되었습니다.');
  }

  async function saveExhibitionName() {
    const name = document.getElementById('exhibitionName').value;
    await fetch('/settings', {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ key: 'exhibition_name', value: name })
    });
    showMsg('settingsMsg', '박람회 이름이 저장되었습니다.');
  }

  async function uploadLogo() {
    const file = document.getElementById('logoFile').files[0];
    if (!file) { alert('파일을 선택해주세요.'); return; }
    const reader = new FileReader();
    reader.onload = async function(e) {
      const base64 = e.target.result;
      const res = await fetch('/upload-logo', {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ logo: base64 })
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById('currentLogo').src = base64;
        document.getElementById('currentLogo').style.display = 'block';
        showMsg('settingsMsg', '로고가 업로드되었습니다.');
      }
    };
    reader.readAsDataURL(file);
  }

  async function changeAccount() {
    const newId = document.getElementById('newAdminId').value.trim();
    const newPw = document.getElementById('newPassword').value;
    if (!newId && !newPw) { alert('아이디 또는 비밀번호를 입력해주세요.'); return; }

    const [currentId, currentPw] = atob(authToken).split(':');
    if (newId) {
      await fetch('/settings', { method:'POST', headers: headers(), body: JSON.stringify({ key: 'admin_id', value: newId }) });
    }
    if (newPw) {
      await fetch('/settings', { method:'POST', headers: headers(), body: JSON.stringify({ key: 'admin_pw', value: newPw }) });
    }
    const finalId = newId || currentId;
    const finalPw = newPw || currentPw;
    authToken = btoa(finalId + ':' + finalPw);
    localStorage.setItem('admin_token', authToken);
    const msg = [];
    if (newId) msg.push('아이디');
    if (newPw) msg.push('비밀번호');
    showMsg('pwMsg', msg.join(', ') + '가 변경되었습니다.');
  }

  let allRows = [];
  let chartInstances = {};

  const COLORS = ['#e53e3e','#3182ce','#38a169','#d69e2e','#805ad5','#dd6b20','#319795','#e53e3e','#2b6cb0','#276749'];

  function renderCharts(rows) {
    // 1. 날짜별 추이
    const dayCounts = {};
    rows.forEach(r => {
      if (!r.created_at) return;
      const d = new Date(r.created_at).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit' });
      dayCounts[d] = (dayCounts[d] || 0) + 1;
    });
    const dayLabels = Object.keys(dayCounts).sort();
    const dayData = dayLabels.map(k => dayCounts[k]);

    // 2. 연령대별
    const ageCounts = {};
    rows.forEach(r => { const v = r.age_group||'미입력'; ageCounts[v] = (ageCounts[v]||0)+1; });

    // 3. 지역별
    const regionCounts = {};
    rows.forEach(r => { const v = r.address_sido||'미입력'; regionCounts[v] = (regionCounts[v]||0)+1; });
    const regionSorted = Object.entries(regionCounts).sort((a,b)=>b[1]-a[1]);

    // 4. 직업군별
    const jobCounts = {};
    rows.forEach(r => { const v = r.job_type||'미입력'; jobCounts[v] = (jobCounts[v]||0)+1; });

    function makeChart(id, type, labels, data, opts) {
      if (chartInstances[id]) chartInstances[id].destroy();
      const ctx = document.getElementById(id);
      if (!ctx) return;
      chartInstances[id] = new Chart(ctx, {
        type,
        data: {
          labels,
          datasets: [{ data, backgroundColor: type==='line' ? 'rgba(229,62,62,0.15)' : COLORS, borderColor: type==='line' ? '#e53e3e' : COLORS, borderWidth: type==='line' ? 2 : 1, fill: type==='line', tension: 0.3, pointBackgroundColor: '#e53e3e' }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: type!=='line' && labels.length<=10, position:'right', labels:{font:{size:11}, boxWidth:12} } },
          scales: type==='line' || type==='bar' ? { y: { beginAtZero:true, ticks:{stepSize:1} }, x: { ticks:{font:{size:10}} } } : {},
          ...opts
        }
      });
    }

    // 5. 성별
    const genderCounts = {};
    rows.forEach(r => { const v = r.gender||'미입력'; genderCounts[v] = (genderCounts[v]||0)+1; });

    makeChart('chartDaily', 'line', dayLabels, dayData);
    makeChart('chartAge', 'doughnut', Object.keys(ageCounts), Object.values(ageCounts));
    makeChart('chartRegion', 'bar', regionSorted.map(e=>e[0]), regionSorted.map(e=>e[1]));
    makeChart('chartJob', 'doughnut', Object.keys(jobCounts), Object.values(jobCounts));
    makeChart('chartGender', 'doughnut', Object.keys(genderCounts), Object.values(genderCounts));
  }

  async function loadRegistrations() {
    const res = await fetch('/registrations', { headers: headers() });
    allRows = await res.json();
    document.getElementById('statTotal').textContent = allRows.length;
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('statToday').textContent =
      allRows.filter(r => r.created_at && r.created_at.toString().startsWith(today)).length;
    renderTable(allRows);
    renderCharts(allRows);
  }

  function filterTable() {
    const q = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!q) { renderTable(allRows); return; }
    const filtered = allRows.filter(r =>
      (r.name||'').toLowerCase().includes(q) ||
      (r.phone||'').includes(q) ||
      (r.reg_number||'').toLowerCase().includes(q) ||
      (r.company||'').toLowerCase().includes(q) ||
      (r.email||'').toLowerCase().includes(q)
    );
    renderTable(filtered);
  }

  function renderTable(rows) {
    const tbody = document.getElementById('regTableBody');
    tbody.innerHTML = '';
    rows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.id = 'row-' + row.id;
      const address = [row.address_sido, row.address_sigungu].filter(Boolean).join(' ');
      const dateStr = row.created_at ? new Date(row.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : '';
      tr.innerHTML =
        '<td>' + (idx+1) + '</td>' +
        '<td>' + (row.reg_number||'') + '</td>' +
        '<td id="v-name-' + row.id + '">' + (row.name||'') + '</td>' +
        '<td id="v-phone-' + row.id + '">' + (row.phone||'') + '</td>' +
        '<td id="v-email-' + row.id + '">' + (row.email||'-') + '</td>' +
        '<td id="v-company-' + row.id + '">' + (row.company||'-') + '</td>' +
        '<td id="v-addr-' + row.id + '">' + (address||'-') + '</td>' +
        '<td id="v-age-' + row.id + '">' + (row.age_group||'-') + '</td>' +
        '<td id="v-job-' + row.id + '">' + (row.job_type||'-') + '</td>' +
        '<td>' + dateStr + '</td>' +
        '<td style="white-space:nowrap;">' +
          '<button class="btn-edit" id="btn-edit-' + row.id + '" onclick="startEdit(' + row.id + ')">수정</button> ' +
          '<button class="btn-danger" onclick="deleteReg(' + row.id + ')">삭제</button>' +
        '</td>';
      tbody.appendChild(tr);
    });
  }

  function startEdit(id) {
    const row = allRows.find(r => r.id === id);
    if (!row) return;
    const fields = [
      ['name', row.name||''],
      ['phone', row.phone||''],
      ['email', row.email||''],
      ['company', row.company||''],
      ['age_group', row.age_group||''],
      ['job_type', row.job_type||'']
    ];
    fields.forEach(([field, val]) => {
      const cell = document.getElementById('v-' + field.split('_')[0] + (field==='age_group'?'age':field==='job_type'?'job':field==='company'?'company':field==='email'?'email':field==='phone'?'phone':'name') + '-' + id);
      // map field to cell id
    });
    // Replace cell contents with inputs
    const textFields = { name: 'v-name-', phone: 'v-phone-', email: 'v-email-', company: 'v-company-', job_type: 'v-job-' };
    Object.entries(textFields).forEach(([field, prefix]) => {
      const cell = document.getElementById(prefix + id);
      const val = row[field] || '';
      cell.innerHTML = '<input style="width:100%;padding:2px 4px;border:1px solid #e53e3e;border-radius:3px;font-size:12px;" value="' + val.replace(/"/g,'&quot;') + '" id="inp-' + field + '-' + id + '">';
    });
    // Age group: dropdown
    const ageCell = document.getElementById('v-age-' + id);
    const ageOptions = ['10대','20대','30대','40대','50대','60대 이상'];
    const ageVal = row.age_group || '';
    ageCell.innerHTML = '<select id="inp-age_group-' + id + '" style="padding:2px 4px;border:1px solid #e53e3e;border-radius:3px;font-size:12px;">' +
      ageOptions.map(o => '<option value="' + o + '"' + (o===ageVal?' selected':'') + '>' + o + '</option>').join('') +
      '</select>';
    const btn = document.getElementById('btn-edit-' + id);
    btn.textContent = '저장';
    btn.onclick = function() { saveEdit(id); };
    btn.style.background = '#2563eb';
  }

  async function saveEdit(id) {
    const fields = ['name','phone','email','company','age_group','job_type'];
    const data = { id };
    fields.forEach(f => {
      const inp = document.getElementById('inp-' + f + '-' + id);
      if (inp) data[f] = inp.value;
    });
    const res = await fetch('/registrations/' + id, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      await loadRegistrations();
    } else {
      alert('저장 실패: ' + (result.error||''));
    }
  }

  async function deleteReg(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await fetch('/registrations/' + id, { method: 'DELETE', headers: headers() });
    loadRegistrations();
  }

  async function deleteAll() {
    if (!confirm('전체 등록 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
    if (!confirm('정말로 전체 삭제하시겠습니까?')) return;
    const res = await fetch('/registrations/all', { method: 'DELETE', headers: headers() });
    const data = await res.json();
    if (data.success) { loadRegistrations(); }
    else alert('오류: ' + (data.error||''));
  }

  async function seedData() {
    if (!confirm('목데이터 40명을 생성하시겠습니까?')) return;
    const res = await fetch('/seed', { method: 'POST', headers: headers() });
    const data = await res.json();
    if (data.success) { alert('목데이터 ' + data.count + '명 생성 완료!'); loadRegistrations(); }
    else alert('오류: ' + (data.error||''));
  }

  function exportExcel() {
    fetch('/export', { headers: { 'Authorization': 'Basic ' + authToken } })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'registrations.xlsx';
        a.click(); URL.revokeObjectURL(url);
      });
  }

  function showMsg(id, text) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
  }
</script>
</body>
</html>`;

// ── FUNCTIONS ────────────────────────────────────────────────────────────────

app.http('page', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'panel',
  handler: async () => ({
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: HTML_PAGE
  })
});

app.http('login', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'login',
  handler: async (request) => {
    const { id, pw } = await request.json();
    try {
      const p = await getPool();
      const result = await p.request()
        .query("SELECT [key], value FROM settings WHERE [key] IN ('admin_id', 'admin_pw')");
      const s = {};
      result.recordset.forEach(r => { s[r.key] = r.value; });
      if (s.admin_id === id && s.admin_pw === pw) {
        return { jsonBody: { success: true, token: Buffer.from(`${id}:${pw}`).toString('base64') } };
      }
      return { status: 401, jsonBody: { error: '아이디 또는 비밀번호가 틀렸습니다.' } };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

app.http('getSettings', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'settings',
  handler: async (request) => {
    if (!await verifyAdmin(request)) return { status: 401, jsonBody: { error: '인증 실패' } };
    try {
      const p = await getPool();
      const result = await p.request().query('SELECT [key], value FROM settings');
      const s = {};
      result.recordset.forEach(r => { s[r.key] = r.value; });
      return { jsonBody: s };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

app.http('postSettings', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'settings',
  handler: async (request) => {
    if (!await verifyAdmin(request)) return { status: 401, jsonBody: { error: '인증 실패' } };
    const { key, value } = await request.json();
    const allowed = ['server_open', 'privacy_text', 'exhibition_name', 'admin_id', 'admin_pw', 'exhibition_logo'];
    if (!allowed.includes(key)) return { status: 400, jsonBody: { error: '허용되지 않는 설정입니다.' } };
    try {
      const p = await getPool();
      await p.request()
        .input('key', sql.NVarChar, key)
        .input('value', sql.NVarChar, value)
        .query(`
          MERGE settings AS target
          USING (SELECT @key AS [key]) AS source ON target.[key] = source.[key]
          WHEN MATCHED THEN UPDATE SET value = @value
          WHEN NOT MATCHED THEN INSERT ([key], value) VALUES (@key, @value);
        `);
      return { jsonBody: { success: true } };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

app.http('uploadLogo', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'upload-logo',
  handler: async (request) => {
    if (!await verifyAdmin(request)) return { status: 401, jsonBody: { error: '인증 실패' } };
    const { logo } = await request.json();
    if (!logo) return { status: 400, jsonBody: { error: '로고 데이터가 없습니다.' } };
    try {
      const p = await getPool();
      await p.request()
        .input('key', sql.NVarChar, 'exhibition_logo')
        .input('value', sql.NVarChar, logo)
        .query(`
          MERGE settings AS target
          USING (SELECT @key AS [key]) AS source ON target.[key] = source.[key]
          WHEN MATCHED THEN UPDATE SET value = @value
          WHEN NOT MATCHED THEN INSERT ([key], value) VALUES (@key, @value);
        `);
      return { jsonBody: { success: true } };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

app.http('getRegistrations', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'registrations',
  handler: async (request) => {
    if (!await verifyAdmin(request)) return { status: 401, jsonBody: { error: '인증 실패' } };
    try {
      const p = await getPool();
      const result = await p.request()
        .query('SELECT * FROM registrations ORDER BY created_at DESC');
      return { jsonBody: result.recordset };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

app.http('updateRegistration', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'registrations/{id}',
  handler: async (request) => {
    if (!await verifyAdmin(request)) return { status: 401, jsonBody: { error: '인증 실패' } };
    const id = request.params.id;
    const data = await request.json();
    try {
      const p = await getPool();
      await p.request()
        .input('id', sql.Int, parseInt(id))
        .input('name', sql.NVarChar, data.name || null)
        .input('phone', sql.NVarChar, data.phone || null)
        .input('email', sql.NVarChar, data.email || null)
        .input('company', sql.NVarChar, data.company || null)
        .input('age_group', sql.NVarChar, data.age_group || null)
        .input('job_type', sql.NVarChar, data.job_type || null)
        .query(`
          UPDATE registrations
          SET name=@name, phone=@phone, email=@email,
              company=@company, age_group=@age_group, job_type=@job_type
          WHERE id=@id
        `);
      return { jsonBody: { success: true } };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

app.http('deleteAllRegistrations', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'registrations/all',
  handler: async (request) => {
    if (!await verifyAdmin(request)) return { status: 401, jsonBody: { error: '인증 실패' } };
    try {
      const p = await getPool();
      await p.request().query('DELETE FROM registrations');
      return { jsonBody: { success: true } };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

app.http('deleteRegistration', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'registrations/{id}',
  handler: async (request) => {
    if (!await verifyAdmin(request)) return { status: 401, jsonBody: { error: '인증 실패' } };
    const id = request.params.id;
    try {
      const p = await getPool();
      await p.request()
        .input('id', sql.Int, parseInt(id))
        .query('DELETE FROM registrations WHERE id = @id');
      return { jsonBody: { success: true } };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

app.http('exportExcel', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'export',
  handler: async (request, context) => {
    if (!await verifyAdmin(request)) return { status: 401, jsonBody: { error: '인증 실패' } };
    try {
      const p = await getPool();
      const result = await p.request()
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

      rows.forEach(row => {
        sheet.addRow({
          created_at: row.created_at ? new Date(row.created_at) : null,
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

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        row.getCell(1).numFmt = 'yyyy-mm-dd hh:mm:ss';
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename=registrations.xlsx'
        },
        body: Buffer.from(buffer)
      };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

app.http('appStatus', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'appstatus',
  handler: async (request, context) => {
    if (!await verifyAdmin(request)) return { status: 401, jsonBody: { error: '인증 실패' } };
    try {
      const client = getAzureClient();
      const site = await client.webApps.get(RESOURCE_GROUP, APP_NAME);
      return { jsonBody: { state: site.state } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

app.http('appStart', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'appstart',
  handler: async (request, context) => {
    if (!await verifyAdmin(request)) return { status: 401, jsonBody: { error: '인증 실패' } };
    try {
      const client = getAzureClient();
      await client.webApps.start(RESOURCE_GROUP, APP_NAME);
      return { jsonBody: { message: '서버를 시작했습니다.' } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

app.http('seed', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'seed',
  handler: async (request, context) => {
    if (!await verifyAdmin(request)) return { status: 401, jsonBody: { error: '인증 실패' } };
    const names = ['김민준','이서연','박지훈','최수아','정다은','강민서','윤지우','임하은','조성현','한지민','신동현','오예린','백승호','류지현','고민재','문채원','서준혁','양소연','홍성민','권나영','남궁현','엄지은','천민호','방수진','탁상훈','나혜진','표지훈','변민아','황성준','이채은','김도현','박서현','최민준','정예진','강현우','윤소희','조민석','한아름','신지원','오준혁'];
    const phones = ['010-1234-5678','010-2345-6789','010-3456-7890','010-4567-8901','010-5678-9012','010-6789-0123','010-7890-1234','010-8901-2345','010-9012-3456','010-1111-2222','010-2222-3333','010-3333-4444','010-4444-5555','010-5555-6666','010-6666-7777','010-7777-8888','010-8888-9999','010-9999-0000','010-1357-2468','010-2468-1357','010-1122-3344','010-3344-5566','010-5566-7788','010-7788-9900','010-9900-1122','010-1234-9876','010-9876-5432','010-5432-1098','010-1098-7654','010-7654-3210','010-1010-2020','010-2020-3030','010-3030-4040','010-4040-5050','010-5050-6060','010-6060-7070','010-7070-8080','010-8080-9090','010-9090-1010','010-1212-3434'];
    const sidos = ['서울특별시','경기도','부산광역시','인천광역시','대구광역시','대전광역시','광주광역시','경상남도','경상북도','전라남도','전라북도','충청남도','충청북도','강원도','제주특별자치도'];
    const sigungu = ['강남구','강서구','중구','북구','동구','서구','남구','수원시','성남시','고양시','부천시','안양시','용인시','창원시','청주시','천안시','전주시','포항시','제주시'];
    const ages = ['10대','20대','20대','30대','30대','40대','40대','50대','60대 이상'];
    const jobs = ['관련업계종사자','예비건축주','국내외 바이어','인테리어 수요자','일반관람객','관련업계종사자','인테리어 수요자','일반관람객'];
    const genders = ['남성','남성','남성','여성','여성'];
    const companies = ['(주)한국건설','미래인테리어','블루디자인','삼성건설','현대건축','LG하우시스','KCC건설','롯데건설','GS건설',null,null,null];
    const emails = ['example@naver.com','test@gmail.com','user@kakao.com',null,null,null];
    try {
      const p = await getPool();
      const maxResult = await p.request().query('SELECT MAX(id) as maxId FROM registrations');
      let nextId = (maxResult.recordset[0].maxId || 0) + 1;
      let count = 0;
      for (let i = 0; i < 40; i++) {
        const now = new Date();
        const dayOffset = Math.floor(Math.random() * 5);
        const d = new Date(now.getTime() - dayOffset * 86400000);
        const dateStr = d.getFullYear().toString().slice(2) + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
        const regNumber = dateStr + String(nextId).padStart(5,'0');
        const email = emails[Math.floor(Math.random()*emails.length)];
        await p.request()
          .input('name', sql.NVarChar, names[i])
          .input('phone', sql.NVarChar, phones[i])
          .input('email', sql.NVarChar, email)
          .input('email_consent', sql.Int, email ? 1 : 0)
          .input('company', sql.NVarChar, companies[Math.floor(Math.random()*companies.length)])
          .input('address_sido', sql.NVarChar, sidos[Math.floor(Math.random()*sidos.length)])
          .input('address_sigungu', sql.NVarChar, sigungu[Math.floor(Math.random()*sigungu.length)])
          .input('gender', sql.NVarChar, genders[Math.floor(Math.random()*genders.length)])
          .input('age_group', sql.NVarChar, ages[Math.floor(Math.random()*ages.length)])
          .input('job_type', sql.NVarChar, jobs[Math.floor(Math.random()*jobs.length)])
          .input('reg_number', sql.NVarChar, regNumber)
          .input('created_at', sql.DateTime, d)
          .query(`INSERT INTO registrations (name,phone,sms_consent,email,email_consent,company,address_sido,address_sigungu,gender,age_group,job_type,privacy_consent,reg_number,created_at)
                  VALUES (@name,@phone,1,@email,@email_consent,@company,@address_sido,@address_sigungu,@gender,@age_group,@job_type,1,@reg_number,@created_at)`);
        nextId++; count++;
      }
      return { jsonBody: { success: true, count } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

app.http('appStop', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'appstop',
  handler: async (request, context) => {
    if (!await verifyAdmin(request)) return { status: 401, jsonBody: { error: '인증 실패' } };
    try {
      const client = getAzureClient();
      await client.webApps.stop(RESOURCE_GROUP, APP_NAME);
      return { jsonBody: { message: '서버를 중지했습니다.' } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});
