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