document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
    
    // Password strength indicator (for register page)
    const passwordInput = document.getElementById('registerPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strengthBars = document.querySelectorAll('.strength-bar');
            const strengthText = document.getElementById('strengthText');
            
            // Reset all bars
            strengthBars.forEach(bar => {
                bar.style.backgroundColor = '#e9ecef';
            });
            
            // Calculate strength
            let strength = 0;
            
            // Length check
            if (password.length >= 8) strength++;
            if (password.length >= 12) strength++;
            
            // Complexity checks
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            // Update UI
            if (strength === 0) {
                strengthText.textContent = 'Weak';
                strengthText.style.color = '#dc3545';
            } else if (strength <= 2) {
                strengthText.textContent = 'Fair';
                strengthText.style.color = '#fd7e14';
                strengthBars[0].style.backgroundColor = '#fd7e14';
            } else if (strength <= 4) {
                strengthText.textContent = 'Good';
                strengthText.style.color = '#ffc107';
                strengthBars[0].style.backgroundColor = '#ffc107';
                strengthBars[1].style.backgroundColor = '#ffc107';
            } else {
                strengthText.textContent = 'Strong';
                strengthText.style.color = '#28a745';
                strengthBars.forEach(bar => {
                    bar.style.backgroundColor = '#28a745';
                });
            }
        });
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            if (!email || !password) {
                showAlert('Please fill in all fields', 'error');
                return;
            }
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Store user data in localStorage/sessionStorage
                    if (rememberMe) {
                        localStorage.setItem('user', JSON.stringify(data.user));
                    } else {
                        sessionStorage.setItem('user', JSON.stringify(data.user));
                    }
                    
                    showAlert('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    showAlert(data.error || 'Login failed', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showAlert('An error occurred during login', 'error');
            }
        });
    }
    
    // Registration Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validation
            if (!firstName || !lastName || !email || !password || !confirmPassword) {
                showAlert('Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showAlert('Passwords do not match', 'error');
                return;
            }
            
            if (!document.getElementById('agreeTerms').checked) {
                showAlert('You must agree to the terms and conditions', 'error');
                return;
            }
            
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ firstName, lastName, email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert('Registration successful! Welcome to Dream House Explorer.', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    showAlert(data.error || 'Registration failed', 'error');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showAlert('An error occurred during registration', 'error');
            }
        });
    }
    
    // Helper function to show alerts
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        const forms = document.querySelectorAll('.auth-form');
        if (forms.length > 0) {
            forms[0].prepend(alertDiv);
            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        } else {
            alert(message);
        }
    }
    
    
    // Social login buttons
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('btn-google') ? 'Google' : 'Facebook';
            alert(`${provider} login would be implemented here`);
        });
    });
});