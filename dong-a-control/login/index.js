const { ADMIN_ID, ADMIN_PW } = require('../shared/config');

module.exports = async function (context, req) {
  const { id, pw } = req.body || {};
  if (id === ADMIN_ID && pw === ADMIN_PW) {
    const token = Buffer.from(`${id}:${pw}`).toString('base64');
    context.res = { status: 200, jsonBody: { success: true, token } };
  } else {
    context.res = { status: 401, jsonBody: { error: '인증 실패' } };
  }
};
