const querystring = require('querystring');

exports.handler = async (event) => {
  const { provider } = event.queryStringParameters;
  const redirectUri = `${process.env.URL}/.netlify/functions/auth/callback`;
  const state = JSON.stringify({
    provider,
    redirect: event.queryStringParameters.redirect || '/dashboard.html'
  });

  const authUrl = `https://login.salesforce.com/services/oauth2/authorize?${querystring.stringify({
    response_type: 'code',
    client_id: process.env.SF_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'api refresh_token offline_access',
    state: Buffer.from(state).toString('base64'),
    prompt: 'login'
  })}`;

  return {
    statusCode: 302,
    headers: {
      Location: authUrl
    }
  };
};