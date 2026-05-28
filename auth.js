// Tab switching
function showTab(tabName) {
    // Hide all forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Remove active from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected form
    if (tabName === 'login') {
        document.getElementById('login-form').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        clearMessages();
    } else if (tabName === 'signup') {
        document.getElementById('signup-form').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        clearMessages();
    }
}

// Show forgot password form
function showForgotPassword() {
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById('forgot-form').classList.add('active');
    clearMessages();
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = `
            <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    } else {
        input.type = 'password';
        button.innerHTML = `
            <svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}

// Clear all messages
function clearMessages() {
    document.querySelectorAll('.error-message, .success-message').forEach(msg => {
        msg.textContent = '';
        msg.style.display = 'none';
    });
}

// Show error message
function showError(formId, message) {
    const errorDiv = document.getElementById(`${formId}-error`);
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(formId, message) {
    const successDiv = document.getElementById(`${formId}-success`);
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}

// Validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    const strengthBar = document.getElementById('password-strength');
    
    if (!strengthBar) return;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    strengthBar.innerHTML = '';
    strengthBar.className = 'password-strength';
    
    if (password.length === 0) {
        return;
    }
    
    if (strength <= 2) {
        strengthBar.innerHTML = '<span class="weak">Weak</span>';
        strengthBar.classList.add('weak');
    } else if (strength <= 3) {
        strengthBar.innerHTML = '<span class="medium">Medium</span>';
        strengthBar.classList.add('medium');
    } else {
        strengthBar.innerHTML = '<span class="strong">Strong</span>';
        strengthBar.classList.add('strong');
    }
}

// Password validation
function isValidPassword(password) {
    // Minimum 8 characters, at least one uppercase, one lowercase, and one number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
}

// Set loading state
function setLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        button.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

// Initialize - Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Password strength checker on signup
    const signupPassword = document.getElementById('signup-password');
    if (signupPassword) {
        signupPassword.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearMessages();
            
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            const submitBtn = this.querySelector('.btn-primary');
            
            // Validation
            if (!email || !password) {
                showError('login', 'Please fill in all fields');
                return;
            }
            
            if (!isValidEmail(email)) {
                showError('login', 'Please enter a valid email address');
                return;
            }
            
            setLoading(submitBtn, true);
            
            // Simulate API call - REPLACE THIS WITH YOUR ACTUAL API
            setTimeout(() => {
                // Demo credentials for testing
                if (email === 'demo@fantom.lx' && password === 'Demo123!') {
                    // Store auth token (in production, use httpOnly cookies)
                    if (rememberMe) {
                        localStorage.setItem('authToken', 'demo-token-12345');
                        localStorage.setItem('userEmail', email);
                    } else {
                        sessionStorage.setItem('authToken', 'demo-token-12345');
                        sessionStorage.setItem('userEmail', email);
                    }
                    
                    showSuccess('login', 'Login successful! Redirecting...');
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    setLoading(submitBtn, false);
                    showError('login', 'Invalid email or password. Try demo@fantom.lx / Demo123!');
                }
            }, 1500);
            
            /* PRODUCTION CODE - Replace the above with:
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password, rememberMe })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Store token securely
                    if (rememberMe) {
                        localStorage.setItem('authToken', data.token);
                        localStorage.setItem('userEmail', email);
                    } else {
                        sessionStorage.setItem('authToken', data.token);
                        sessionStorage.setItem('userEmail', email);
                    }
                    
                    showSuccess('login', 'Login successful! Redirecting...');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    showError('login', data.message || 'Login failed. Please try again.');
                }
            } catch (error) {
                showError('login', 'Network error. Please check your connection.');
            } finally {
                setLoading(submitBtn, false);
            }
            */
        });
    }
    
    // Signup form submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearMessages();
            
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm').value;
            const termsAgree = document.getElementById('terms-agree').checked;
            const submitBtn = this.querySelector('.btn-primary');
            
            // Validation
            if (!name || !email || !password || !confirmPassword) {
                showError('signup', 'Please fill in all fields');
                return;
            }
            
            if (!isValidEmail(email)) {
                showError('signup', 'Please enter a valid email address');
                return;
            }
            
            if (!isValidPassword(password)) {
                showError('signup', 'Password must be at least 8 characters with uppercase, lowercase, and number');
                return;
            }
            
            if (password !== confirmPassword) {
                showError('signup', 'Passwords do not match');
                return;
            }
            
            if (!termsAgree) {
                showError('signup', 'Please accept the Terms of Service and Privacy Policy');
                return;
            }
            
            setLoading(submitBtn, true);
            
            // Simulate API call - REPLACE THIS WITH YOUR ACTUAL API
            setTimeout(() => {
                showSuccess('signup', 'Account created successfully! Redirecting to login...');
                setTimeout(() => {
                    showTab('login');
                    document.getElementById('login-email').value = email;
                    signupForm.reset();
                }, 2000);
                setLoading(submitBtn, false);
            }, 1500);
            
            /* PRODUCTION CODE - Replace the above with:
            
            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showSuccess('signup', 'Account created successfully! Please check your email to verify.');
                    setTimeout(() => {
                        showTab('login');
                        document.getElementById('login-email').value = email;
                        signupForm.reset();
                    }, 2000);
                } else {
                    showError('signup', data.message || 'Signup failed. Please try again.');
                }
            } catch (error) {
                showError('signup', 'Network error. Please check your connection.');
            } finally {
                setLoading(submitBtn, false);
            }
            */
        });
    }
    
    // Forgot password form submission
    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearMessages();
            
            const email = document.getElementById('forgot-email').value.trim();
            const submitBtn = this.querySelector('.btn-primary');
            
            if (!email) {
                showError('forgot', 'Please enter your email address');
                return;
            }
            
            if (!isValidEmail(email)) {
                showError('forgot', 'Please enter a valid email address');
                return;
            }
            
            setLoading(submitBtn, true);
            
            // Simulate API call
            setTimeout(() => {
                showSuccess('forgot', 'Password reset link sent! Check your email.');
                setTimeout(() => {
                    forgotForm.reset();
                }, 3000);
                setLoading(submitBtn, false);
            }, 1500);
            
            /* PRODUCTION CODE:
            
            try {
                const response = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showSuccess('forgot', 'Password reset link sent! Check your email.');
                    setTimeout(() => {
                        forgotForm.reset();
                    }, 3000);
                } else {
                    showError('forgot', data.message || 'Failed to send reset link.');
                }
            } catch (error) {
                showError('forgot', 'Network error. Please try again.');
            } finally {
                setLoading(submitBtn, false);
            }
            */
        });
    }
});

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
    }
}

// Run auth check on page load
checkAuth();
