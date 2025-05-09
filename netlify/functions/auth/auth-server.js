// Salesforce Authentication Flow
const SF_AUTH_ENDPOINT = 'http://localhost:5000/auth/salesforce';

// Initialize auth flows
document.addEventListener('DOMContentLoaded', function() {
  // Login form handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Register form handler
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Social login buttons
  document.querySelectorAll('.btn-google, .btn-facebook').forEach(btn => {
    btn.addEventListener('click', handleSocialLogin);
  });

  // Check for OAuth callback in URL
  checkAuthCallback();
});

// Handle regular login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  try {
    // First authenticate with your backend
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe })
    });

    if (!response.ok) throw new Error('Login failed');

    const data = await response.json();
    
    // Store tokens securely
    if (rememberMe) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
    } else {
      sessionStorage.setItem('authToken', data.token);
    }
    
    // Redirect to dashboard or home page
    window.location.href = 'dashboard.html';
    
  } catch (error) {
    showAuthError(error.message);
  }
}

// Handle registration
async function handleRegister(e) {
  e.preventDefault();
  
  const formData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('registerEmail').value,
    password: document.getElementById('registerPassword').value
  };

  try {
    // Create user in your backend
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    // Also create as Lead in Salesforce
    const sfResponse = await fetch('/api/salesforce/lead', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        FirstName: formData.firstName,
        LastName: formData.lastName,
        Email: formData.email,
        Company: 'Dream House Explorer',
        LeadSource: 'Website Registration'
      })
    });

    if (!sfResponse.ok) {
      console.error('Salesforce lead creation failed, but user was registered');
    }

    // Automatically log the user in
    const loginResponse = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: formData.email, 
        password: formData.password 
      })
    });

    const { token } = await loginResponse.json();
    sessionStorage.setItem('authToken', token);
    window.location.href = 'dashboard.html';
    
  } catch (error) {
    showAuthError(error.message);
  }
}

// Handle Salesforce OAuth login
function initiateSalesforceAuth() {
  window.location.href = SF_AUTH_ENDPOINT;
}

// Handle social login buttons
function handleSocialLogin(e) {
  e.preventDefault();
  const provider = e.target.classList.contains('btn-google') ? 'google' : 'facebook';
  
  // For demo, we'll use Salesforce auth for all social logins
  initiateSalesforceAuth();
}

// Check for OAuth callback in URL
function checkAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const error = urlParams.get('error');
  
  if (token) {
    // Store the token and redirect
    sessionStorage.setItem('authToken', token);
    window.location.href = 'dashboard.html';
  } else if (error) {
    showAuthError(decodeURIComponent(error));
  }
}

// Utility functions
function getAuthToken() {
  return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
}

function showAuthError(message) {
  // Implement your error display logic
  alert(`Authentication Error: ${message}`);
}

// In your auth-server.js or separate API file
app.post('/api/salesforce/lead', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error('Authorization header missing');

    const leadData = req.body;
    
    // Verify JWT first
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Create lead in Salesforce
    const response = await axios.post(
      `${decoded.sfInstanceUrl}/services/data/v56.0/sobjects/Lead`,
      leadData,
      { headers: { 'Authorization': `Bearer ${decoded.sfAccessToken}` } }
    );

    res.json({ success: true, id: response.data.id });
    
  } catch (error) {
    console.error('Lead creation error:', error);
    res.status(500).json({ error: error.message });
  }
});


const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Salesforce OAuth Config
const SF_CLIENT_ID = process.env.SF_CLIENT_ID;
const SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
const SF_REDIRECT_URI = process.env.SF_REDIRECT_URI || 'http://localhost:3000/auth/callback';
const SF_LOGIN_URL = process.env.SF_LOGIN_URL || 'https://login.salesforce.com';

// JWT Secret for your app's sessions
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Salesforce OAuth endpoints
const SF_AUTH_URL = `${SF_LOGIN_URL}/services/oauth2/authorize`;
const SF_TOKEN_URL = `${SF_LOGIN_URL}/services/oauth2/token`;

// Initiate Salesforce OAuth flow
app.get('/auth/salesforce', (req, res) => {
  const authUrl = `${SF_AUTH_URL}?response_type=code&client_id=${SF_CLIENT_ID}&redirect_uri=${encodeURIComponent(SF_REDIRECT_URI)}&scope=api refresh_token offline_access`;
  res.redirect(authUrl);
});

// Handle Salesforce callback
app.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) throw new Error('Authorization code missing');

    // Exchange auth code for tokens
    const tokenResponse = await axios.post(SF_TOKEN_URL, new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: SF_CLIENT_ID,
      client_secret: SF_CLIENT_SECRET,
      redirect_uri: SF_REDIRECT_URI,
      code
    }));

    const { access_token, refresh_token, instance_url } = tokenResponse.data;

    // Get user info from Salesforce
    const userInfo = await axios.get(`${instance_url}/services/oauth2/userinfo`, {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });

    // Create JWT for your app
    const appToken = jwt.sign({
      userId: userInfo.data.user_id,
      email: userInfo.data.email,
      sfAccessToken: access_token,
      sfInstanceUrl: instance_url
    }, JWT_SECRET, { expiresIn: '1h' });

    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/auth-success?token=${appToken}`);
    
  } catch (error) {
    console.error('Auth callback error:', error);
    res.redirect(`http://localhost:3000/auth-error?message=${encodeURIComponent(error.message)}`);
  }
});

// Token refresh endpoint
app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new Error('Refresh token missing');

    const tokenResponse = await axios.post(SF_TOKEN_URL, new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: SF_CLIENT_ID,
      client_secret: SF_CLIENT_SECRET,
      refresh_token: refreshToken
    }));

    res.json({
      accessToken: tokenResponse.data.access_token,
      expiresIn: tokenResponse.data.expires_in
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Auth server running on port ${PORT}`));