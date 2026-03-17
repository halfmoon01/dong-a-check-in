const { checkAuth, SUBSCRIPTION_ID, RESOURCE_GROUP, APP_NAME } = require('../shared/config');
const { DefaultAzureCredential } = require('@azure/identity');
const { WebSiteManagementClient } = require('@azure/arm-appservice');

module.exports = async function (context, req) {
  if (!checkAuth(req)) {
    context.res = { status: 401, jsonBody: { error: '인증 필요' } };
    return;
  }
  try {
    const credential = new DefaultAzureCredential();
    const client = new WebSiteManagementClient(credential, SUBSCRIPTION_ID);
    const site = await client.webApps.get(RESOURCE_GROUP, APP_NAME);
    context.res = { status: 200, jsonBody: { state: site.state } };
  } catch (err) {
    context.res = { status: 500, jsonBody: { error: err.message } };
  }
};
