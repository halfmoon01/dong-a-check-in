const SUBSCRIPTION_ID = '2f2e9da9-bda0-460e-894f-041943cbd635';
const RESOURCE_GROUP = 'rg-dong-a';
const APP_NAME = 'dong-a-registration';
const ADMIN_ID = process.env.CONTROL_ADMIN_ID || 'admin';
const ADMIN_PW = process.env.CONTROL_ADMIN_PW || 'donga2026!';

function checkAuth(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return false;
  const [id, pw] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  return id === ADMIN_ID && pw === ADMIN_PW;
}

module.exports = { SUBSCRIPTION_ID, RESOURCE_GROUP, APP_NAME, ADMIN_ID, ADMIN_PW, checkAuth };
