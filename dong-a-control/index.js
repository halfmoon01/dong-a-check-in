const { app } = require('@azure/functions');
const { WebSiteManagementClient } = require('@azure/arm-appservice');
const { DefaultAzureCredential } = require('@azure/identity');

const SUBSCRIPTION_ID = '2f2e9da9-bda0-460e-894f-041943cbd635';
const RESOURCE_GROUP = 'rg-dong-a';
const APP_NAME = 'dong-a-registration';

function getClient() {
  const credential = new DefaultAzureCredential();
  return new WebSiteManagementClient(credential, SUBSCRIPTION_ID);
}

const HTML_PAGE = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>동아전람 서버 제어판</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f2f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .container { background: white; border-radius: 12px; padding: 40px; width: 360px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; }
    h1 { font-size: 20px; color: #1a1a2e; margin-bottom: 8px; }
    p.sub { color: #666; font-size: 14px; margin-bottom: 32px; }
    .login-form { display: none; }
    .login-form input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 12px; font-size: 15px; }
    .btn { width: 100%; padding: 12px; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-start { background: #16a34a; color: white; margin-bottom: 12px; }
    .btn-start:hover { background: #15803d; }
    .btn-stop { background: #dc2626; color: white; margin-bottom: 12px; }
    .btn-stop:hover { background: #b91c1c; }
    .btn-refresh { background: #6b7280; color: white; font-size: 13px; padding: 8px; }
    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
    .status-running { background: #dcfce7; color: #15803d; }
    .status-stopped { background: #fee2e2; color: #b91c1c; }
    .status-unknown { background: #f3f4f6; color: #6b7280; }
    .msg { margin-top: 12px; font-size: 13px; color: #6b7280; min-height: 20px; }
    .control-panel { display: none; }
  </style>
</head>
<body>
<div class="container">
  <h1>동아전람 서버 제어판</h1>
  <p class="sub">관리자 전용</p>

  <div class="login-form" id="loginForm">
    <input type="text" id="adminId" placeholder="아이디" autocomplete="off">
    <input type="password" id="adminPw" placeholder="비밀번호">
    <button class="btn btn-primary" onclick="login()">로그인</button>
    <div class="msg" id="loginMsg"></div>
  </div>

  <div class="control-panel" id="controlPanel">
    <div>현재 서버 상태</div>
    <div class="status-badge status-unknown" id="statusBadge">확인 중...</div>
    <br>
    <button class="btn btn-start" onclick="controlApp('start')">▶ 서버 시작</button>
    <button class="btn btn-stop" onclick="controlApp('stop')">■ 서버 중지</button>
    <button class="btn btn-refresh" onclick="checkStatus()">새로고침</button>
    <div class="msg" id="msg"></div>
  </div>
</div>

<script>
  let token = '';

  function login() {
    const id = document.getElementById('adminId').value;
    const pw = document.getElementById('adminPw').value;
    token = btoa(id + ':' + pw);
    fetch('/api/status', { headers: { Authorization: 'Basic ' + token } })
      .then(r => {
        if (r.status === 401) { document.getElementById('loginMsg').textContent = '아이디 또는 비밀번호가 틀렸습니다.'; return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('controlPanel').style.display = 'block';
        updateStatus(data.state);
      });
  }

  function updateStatus(state) {
    const badge = document.getElementById('statusBadge');
    if (state === 'Running') { badge.textContent = '실행 중'; badge.className = 'status-badge status-running'; }
    else if (state === 'Stopped') { badge.textContent = '중지됨'; badge.className = 'status-badge status-stopped'; }
    else { badge.textContent = state || '알 수 없음'; badge.className = 'status-badge status-unknown'; }
  }

  function checkStatus() {
    document.getElementById('msg').textContent = '확인 중...';
    fetch('/api/status', { headers: { Authorization: 'Basic ' + token } })
      .then(r => r.json())
      .then(data => { updateStatus(data.state); document.getElementById('msg').textContent = ''; });
  }

  function controlApp(action) {
    document.getElementById('msg').textContent = action === 'start' ? '시작 중...' : '중지 중...';
    fetch('/api/' + action, { method: 'POST', headers: { Authorization: 'Basic ' + token } })
      .then(r => r.json())
      .then(data => {
        document.getElementById('msg').textContent = data.message || '';
        setTimeout(checkStatus, 3000);
      });
  }

  window.onload = () => { document.getElementById('loginForm').style.display = 'block'; };
</script>
</body>
</html>`;

// Serve control panel page
app.http('page', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: '',
  handler: async (request, context) => {
    return {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: HTML_PAGE
    };
  }
});

// Auth helper
async function verifyAdmin(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const encoded = authHeader.split(' ')[1];
  if (!encoded) return false;
  const [id, pw] = Buffer.from(encoded, 'base64').toString().split(':');
  return id === (process.env.ADMIN_ID || 'admin') && pw === (process.env.ADMIN_PW || 'donga2026!');
}

// Get status
app.http('status', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'status',
  handler: async (request, context) => {
    if (!await verifyAdmin(request)) {
      return { status: 401, jsonBody: { error: '인증 실패' } };
    }
    try {
      const client = getClient();
      const site = await client.webApps.get(RESOURCE_GROUP, APP_NAME);
      return { jsonBody: { state: site.state } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

// Start app
app.http('start', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'start',
  handler: async (request, context) => {
    if (!await verifyAdmin(request)) {
      return { status: 401, jsonBody: { error: '인증 실패' } };
    }
    try {
      const client = getClient();
      await client.webApps.start(RESOURCE_GROUP, APP_NAME);
      return { jsonBody: { message: '서버를 시작했습니다.' } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

// Stop app
app.http('stop', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'stop',
  handler: async (request, context) => {
    if (!await verifyAdmin(request)) {
      return { status: 401, jsonBody: { error: '인증 실패' } };
    }
    try {
      const client = getClient();
      await client.webApps.stop(RESOURCE_GROUP, APP_NAME);
      return { jsonBody: { message: '서버를 중지했습니다.' } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});
