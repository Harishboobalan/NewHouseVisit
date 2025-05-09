const axios = require('axios');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  try {
    const { code, state } = event.queryStringParameters;
    if (!code) throw new Error('Authorization code missing');

    const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
    const redirectUri = `${process.env.URL}/.netlify/functions/auth/callback`;

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://login.salesforce.com/services/oauth2/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.SF_CLIENT_ID,
        client_secret: process.env.SF_CLIENT_SECRET,
        redirect_uri: redirectUri,
        code
      })
    );

    const { access_token, refresh_token, instance_url } = tokenResponse.data;

    // Get user info
    const userInfo = await axios.get(`${instance_url}/services/oauth2/userinfo`, {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });

    // Create JWT for your app
    const appToken = jwt.sign({
      userId: userInfo.data.user_id,
      email: userInfo.data.email,
      name: userInfo.data.name,
      sfAccessToken: access_token,
      sfRefreshToken: refresh_token,
      sfInstanceUrl: instance_url
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Redirect to frontend with token
    return {
      statusCode: 302,
      headers: {
        Location: `${process.env.URL}?token=${appToken}&redirect=${encodeURIComponent(decodedState.redirect)}`
      }
    };
    
  } catch (error) {
    console.error('Auth callback error:', error);
    return {
      statusCode: 302,
      headers: {
        Location: `${process.env.URL}/login.html?error=${encodeURIComponent(error.message)}`
      }
    };
  }
};