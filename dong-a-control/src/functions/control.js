const { app } = require('@azure/functions');
const { DefaultAzureCredential } = require('@azure/identity');
const { WebSiteManagementClient } = require('@azure/arm-appservice');

const SUBSCRIPTION_ID = '2f2e9da9-bda0-460e-894f-041943cbd635';
const RESOURCE_GROUP = 'rg-dong-a';
const APP_NAME = 'dong-a-registration';

const ADMIN_ID = process.env.CONTROL_ADMIN_ID || 'admin';
const ADMIN_PW = process.env.CONTROL_ADMIN_PW || 'donga2026!';

function checkAuth(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return false;
  const [id, pw] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  return id === ADMIN_ID && pw === ADMIN_PW;
}

async function getClient() {
  const credential = new DefaultAzureCredential();
  return new WebSiteManagementClient(credential, SUBSCRIPTION_ID);
}

// Serve HTML page
app.http('index', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: '',
  handler: async (req, ctx) => {
    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>동아전람 서버 관리</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .login-wrap { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.1); width: 340px; }
    .login-wrap h1 { font-size: 20px; font-weight: 700; margin-bottom: 24px; text-align: center; color: #1a1a1a; }
    .form-group { margin-bottom: 16px; }
    label { display: block; font-size: 13px; color: #555; margin-bottom: 6px; }
    input { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; }
    input:focus { border-color: #2563eb; }
    .btn { width: 100%; padding: 12px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 8px; }
    .btn:hover { background: #1d4ed8; }
    .error { color: #ef4444; font-size: 13px; margin-top: 12px; text-align: center; }
    .panel { display: none; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.1); width: 400px; }
    .panel h1 { font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #1a1a1a; }
    .panel p { font-size: 13px; color: #888; margin-bottom: 32px; }
    .status-box { background: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
    .status-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .status-dot.running { background: #22c55e; }
    .status-dot.stopped { background: #ef4444; }
    .status-dot.loading { background: #f59e0b; animation: pulse 1s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .status-text { font-size: 15px; font-weight: 600; color: #1a1a1a; }
    .status-sub { font-size: 12px; color: #888; margin-top: 2px; }
    .btn-start { width: 100%; padding: 14px; background: #22c55e; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 10px; }
    .btn-start:hover { background: #16a34a; }
    .btn-stop { width: 100%; padding: 14px; background: #ef4444; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
    .btn-stop:hover { background: #dc2626; }
    .btn:disabled, .btn-start:disabled, .btn-stop:disabled { opacity: 0.5; cursor: not-allowed; }
    .msg { margin-top: 16px; font-size: 13px; text-align: center; color: #555; }
    .logout { margin-top: 24px; text-align: center; font-size: 13px; color: #888; cursor: pointer; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="login-wrap" id="loginWrap">
    <h1>동아전람 서버 관리</h1>
    <div class="form-group">
      <label>아이디</label>
      <input type="text" id="loginId" placeholder="아이디 입력" />
    </div>
    <div class="form-group">
      <label>비밀번호</label>
      <input type="password" id="loginPw" placeholder="비밀번호 입력" onkeydown="if(event.key==='Enter') doLogin()" />
    </div>
    <button class="btn" onclick="doLogin()">로그인</button>
    <div class="error" id="loginError"></div>
  </div>

  <div class="panel" id="panel">
    <h1>서버 제어판</h1>
    <p>동아전람 등록 서버를 켜고 끌 수 있습니다.</p>
    <div class="status-box">
      <div class="status-dot loading" id="statusDot"></div>
      <div>
        <div class="status-text" id="statusText">상태 확인 중...</div>
        <div class="status-sub" id="statusSub"></div>
      </div>
    </div>
    <button class="btn-start" id="btnStart" onclick="controlServer('start')" disabled>서버 켜기</button>
    <button class="btn-stop" id="btnStop" onclick="controlServer('stop')" disabled>서버 끄기</button>
    <div class="msg" id="msg"></div>
    <div class="logout" onclick="logout()">로그아웃</div>
  </div>

  <script>
    let token = '';

    async function doLogin() {
      const id = document.getElementById('loginId').value;
      const pw = document.getElementById('loginPw').value;
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pw })
      });
      const data = await res.json();
      if (data.success) {
        token = data.token;
        document.getElementById('loginWrap').style.display = 'none';
        document.getElementById('panel').style.display = 'block';
        getStatus();
      } else {
        document.getElementById('loginError').textContent = '아이디 또는 비밀번호가 틀렸습니다.';
      }
    }

    async function getStatus() {
      const dot = document.getElementById('statusDot');
      const text = document.getElementById('statusText');
      const sub = document.getElementById('statusSub');
      dot.className = 'status-dot loading';
      text.textContent = '상태 확인 중...';
      const res = await fetch('/api/status', {
        headers: { 'Authorization': 'Basic ' + token }
      });
      const data = await res.json();
      if (data.state === 'Running') {
        dot.className = 'status-dot running';
        text.textContent = '실행 중';
        sub.textContent = '서버가 켜져 있습니다.';
        document.getElementById('btnStart').disabled = true;
        document.getElementById('btnStop').disabled = false;
      } else {
        dot.className = 'status-dot stopped';
        text.textContent = '중지됨';
        sub.textContent = '서버가 꺼져 있습니다.';
        document.getElementById('btnStart').disabled = false;
        document.getElementById('btnStop').disabled = true;
      }
    }

    async function controlServer(action) {
      document.getElementById('btnStart').disabled = true;
      document.getElementById('btnStop').disabled = true;
      document.getElementById('msg').textContent = action === 'start' ? '서버를 켜는 중...' : '서버를 끄는 중...';
      const res = await fetch('/api/' + action, {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + token }
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById('msg').textContent = action === 'start' ? '서버가 켜졌습니다.' : '서버가 꺼졌습니다.';
        setTimeout(getStatus, 3000);
      } else {
        document.getElementById('msg').textContent = '오류가 발생했습니다.';
        getStatus();
      }
    }

    function logout() {
      token = '';
      document.getElementById('panel').style.display = 'none';
      document.getElementById('loginWrap').style.display = 'block';
    }
  </script>
</body>
</html>`;
    return { body: html, headers: { 'Content-Type': 'text/html; charset=utf-8' } };
  }
});

// Login
app.http('login', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'login',
  handler: async (req, ctx) => {
    const { id, pw } = await req.json();
    if (id === ADMIN_ID && pw === ADMIN_PW) {
      const token = Buffer.from(`${id}:${pw}`).toString('base64');
      return { jsonBody: { success: true, token } };
    }
    return { status: 401, jsonBody: { error: '인증 실패' } };
  }
});

// Get status
app.http('status', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'status',
  handler: async (req, ctx) => {
    if (!checkAuth(req)) return { status: 401, jsonBody: { error: '인증 필요' } };
    try {
      const client = await getClient();
      const site = await client.webApps.get(RESOURCE_GROUP, APP_NAME);
      return { jsonBody: { state: site.state } };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

// Start
app.http('start', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'start',
  handler: async (req, ctx) => {
    if (!checkAuth(req)) return { status: 401, jsonBody: { error: '인증 필요' } };
    try {
      const client = await getClient();
      await client.webApps.start(RESOURCE_GROUP, APP_NAME);
      return { jsonBody: { success: true } };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

// Stop
app.http('stop', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'stop',
  handler: async (req, ctx) => {
    if (!checkAuth(req)) return { status: 401, jsonBody: { error: '인증 필요' } };
    try {
      const client = await getClient();
      await client.webApps.stop(RESOURCE_GROUP, APP_NAME);
      return { jsonBody: { success: true } };
    } catch (err) {
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});
