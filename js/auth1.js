// Registration Form Handler
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };
  
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Registration successful! Check your email.');
        window.location.href = 'login.html';
      } else {
        alert('Registration failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during registration');
    }
  });
  
  // Contact Form Handler
  document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value
    };
  
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Message sent! Check your email for confirmation.');
        document.getElementById('contactForm').reset();
      } else {
        alert('Message failed to send: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while sending your message');
    }
  });