module.exports = async function (context, req) {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>동아전람 서버 관리</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Apple SD Gothic Neo', sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .wrap { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.1); width: 360px; }
    h1 { font-size: 20px; font-weight: 700; margin-bottom: 24px; text-align: center; color: #1a1a1a; }
    .form-group { margin-bottom: 16px; }
    label { display: block; font-size: 13px; color: #555; margin-bottom: 6px; }
    input { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; }
    input:focus { border-color: #2563eb; }
    .btn { width: 100%; padding: 12px; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
    .btn-login { background: #2563eb; color: white; margin-top: 8px; }
    .btn-login:hover { background: #1d4ed8; }
    .btn-start { background: #22c55e; color: white; margin-bottom: 10px; }
    .btn-start:hover { background: #16a34a; }
    .btn-stop { background: #ef4444; color: white; }
    .btn-stop:hover { background: #dc2626; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { color: #ef4444; font-size: 13px; margin-top: 12px; text-align: center; }
    .panel { display: none; }
    .status-box { background: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .dot.running { background: #22c55e; }
    .dot.stopped { background: #ef4444; }
    .dot.loading { background: #f59e0b; animation: pulse 1s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .status-label { font-size: 15px; font-weight: 600; }
    .status-sub { font-size: 12px; color: #888; margin-top: 2px; }
    .msg { margin-top: 16px; font-size: 13px; text-align: center; color: #555; min-height: 20px; }
    .logout { margin-top: 20px; text-align: center; font-size: 13px; color: #888; cursor: pointer; text-decoration: underline; }
    p.desc { font-size: 13px; color: #888; margin-bottom: 28px; text-align: center; }
  </style>
</head>
<body>
  <div class="wrap">
    <div id="loginView">
      <h1>동아전람 서버 관리</h1>
      <div class="form-group">
        <label>아이디</label>
        <input type="text" id="loginId" placeholder="아이디 입력" />
      </div>
      <div class="form-group">
        <label>비밀번호</label>
        <input type="password" id="loginPw" placeholder="비밀번호 입력" onkeydown="if(event.key==='Enter')doLogin()" />
      </div>
      <button class="btn btn-login" onclick="doLogin()">로그인</button>
      <div class="error" id="loginError"></div>
    </div>
    <div class="panel" id="panelView">
      <h1>서버 제어판</h1>
      <p class="desc">동아전람 등록 서버를 켜고 끌 수 있습니다.</p>
      <div class="status-box">
        <div class="dot loading" id="dot"></div>
        <div>
          <div class="status-label" id="statusLabel">상태 확인 중...</div>
          <div class="status-sub" id="statusSub"></div>
        </div>
      </div>
      <button class="btn btn-start" id="btnStart" onclick="control('start')" disabled>서버 켜기</button>
      <button class="btn btn-stop" id="btnStop" onclick="control('stop')" disabled>서버 끄기</button>
      <div class="msg" id="msg"></div>
      <div class="logout" onclick="logout()">로그아웃</div>
    </div>
  </div>
  <script>
    const BASE = '/api';
    let token = '';

    async function doLogin() {
      const id = document.getElementById('loginId').value;
      const pw = document.getElementById('loginPw').value;
      const res = await fetch(BASE + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pw })
      });
      const data = await res.json();
      if (data.success) {
        token = data.token;
        document.getElementById('loginView').style.display = 'none';
        document.getElementById('panelView').style.display = 'block';
        getStatus();
      } else {
        document.getElementById('loginError').textContent = '아이디 또는 비밀번호가 틀렸습니다.';
      }
    }

    async function getStatus() {
      document.getElementById('dot').className = 'dot loading';
      document.getElementById('statusLabel').textContent = '상태 확인 중...';
      const res = await fetch(BASE + '/status', {
        headers: { 'Authorization': 'Basic ' + token }
      });
      const data = await res.json();
      if (data.state === 'Running') {
        document.getElementById('dot').className = 'dot running';
        document.getElementById('statusLabel').textContent = '실행 중';
        document.getElementById('statusSub').textContent = '서버가 켜져 있습니다.';
        document.getElementById('btnStart').disabled = true;
        document.getElementById('btnStop').disabled = false;
      } else {
        document.getElementById('dot').className = 'dot stopped';
        document.getElementById('statusLabel').textContent = '중지됨';
        document.getElementById('statusSub').textContent = '서버가 꺼져 있습니다.';
        document.getElementById('btnStart').disabled = false;
        document.getElementById('btnStop').disabled = true;
      }
    }

    async function control(action) {
      document.getElementById('btnStart').disabled = true;
      document.getElementById('btnStop').disabled = true;
      document.getElementById('msg').textContent = action === 'start' ? '서버를 켜는 중...' : '서버를 끄는 중...';
      const res = await fetch(BASE + '/' + action, {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + token }
      });
      const data = await res.json();
      document.getElementById('msg').textContent = data.success
        ? (action === 'start' ? '서버가 켜졌습니다.' : '서버가 꺼졌습니다.')
        : '오류가 발생했습니다.';
      setTimeout(getStatus, 3000);
    }

    function logout() {
      token = '';
      document.getElementById('panelView').style.display = 'none';
      document.getElementById('loginView').style.display = 'block';
    }
  </script>
</body>
</html>`;

  context.res = {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html
  };
};
