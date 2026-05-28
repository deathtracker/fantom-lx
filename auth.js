// ============================================
// FANTOM.LX AUTHENTICATION SYSTEM
// ============================================

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.sessions = this.loadSessions();
        this.failedAttempts = {};
        this.init();
    }

    init() {
        // Check if user is already logged in
        this.checkSession();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Check password strength in real-time
        const regPassword = document.getElementById('reg-password');
        if (regPassword) {
            regPassword.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Forgot password form
        const forgotForm = document.getElementById('forgot-form');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
        }
    }

    // ============================================
    // LOGIN FUNCTIONALITY
    // ============================================
    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // Rate limiting check
        if (this.isRateLimited(email)) {
            this.showError('login-error', 'Too many login attempts. Please wait 5 minutes.');
            return;
        }

        // Find user
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            this.recordFailedAttempt(email);
            this.showError('login-error', 'Invalid email or password.');
            return;
        }

        // Verify password (in production, use bcrypt)
        if (!this.verifyPassword(password, user.password)) {
            this.recordFailedAttempt(email);
            this.showError('login-error', 'Invalid email or password.');
            return;
        }

        // Successful login
        this.createSession(user, rememberMe);
        this.clearFailedAttempts(email);
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }

    // ============================================
    // REGISTRATION FUNCTIONALITY
    // ============================================
    handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;

        // Validation
        if (!this.validateEmail(email)) {
            this.showError('register-error', 'Please enter a valid email address.');
            return;
        }

        if (password.length < 8) {
            this.showError('register-error', 'Password must be at least 8 characters long.');
            return;
        }

        if (password !== confirm) {
            this.showError('register-error', 'Passwords do not match.');
            return;
        }

        // Check if user already exists
        if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showError('register-error', 'An account with this email already exists.');
            return;
        }

        // Create new user
        const newUser = {
            id: this.generateId(),
            name: this.sanitize(name),
            email: email.toLowerCase(),
            password: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            verified: false,
            plan: 'free'
        };

        this.users.push(newUser);
        this.saveUsers();

        // Auto-login after registration
        this.createSession(newUser, true);
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }

    // ============================================
    // PASSWORD RESET
    // ============================================
    handleForgotPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgot-email').value.trim();
        
        // Check if user exists (in production, don't reveal this)
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        // Always show success message for security
        this.showSuccess('forgot-message', 'If an account exists with this email, you will receive a password reset link.');
        
        // In production, send actual email here
        if (user) {
            const resetToken = this.generateResetToken(user);
            console.log('Password reset token:', resetToken);
            // TODO: Send email with reset link
        }
        
        setTimeout(() => {
            showTab('login');
        }, 3000);
    }

    // ============================================
    // SESSION MANAGEMENT
    // ============================================
    createSession(user, rememberMe) {
        const session = {
            userId: user.id,
            token: this.generateToken(),
            createdAt: new Date().toISOString(),
            expiresAt: rememberMe 
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
                : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };

        // Store session
        if (rememberMe) {
            localStorage.setItem('fantom_session', JSON.stringify(session));
        } else {
            sessionStorage.setItem('fantom_session', JSON.stringify(session));
        }

        this.currentUser = user;
    }

    checkSession() {
        const session = JSON.parse(localStorage.getItem('fantom_session') || sessionStorage.getItem('fantom_session') || 'null');
        
        if (!session) return null;

        // Check if session is expired
        if (new Date(session.expiresAt) < new Date()) {
            this.logout();
            return null;
        }

        // Find user
        const user = this.users.find(u => u.id === session.userId);
        if (user) {
            this.currentUser = user;
            return user;
        }

        return null;
    }

    logout() {
        localStorage.removeItem('fantom_session');
        sessionStorage.removeItem('fantom_session');
        this.currentUser = null;
        window.location.href = 'login.html';
    }

    // ============================================
    // SECURITY FEATURES
    // ============================================
    isRateLimited(email) {
        const attempts = this.failedAttempts[email];
        if (!attempts) return false;

        const now = Date.now();
        const recentAttempts = attempts.filter(time => now - time < 5 * 60 * 1000); // 5 minutes

        return recentAttempts.length >= 5;
    }

    recordFailedAttempt(email) {
        if (!this.failedAttempts[email]) {
            this.failedAttempts[email] = [];
        }
        this.failedAttempts[email].push(Date.now());
    }

    clearFailedAttempts(email) {
        delete this.failedAttempts[email];
    }

    // Simple password hashing (use bcrypt in production!)
    hashPassword(password) {
        // This is NOT secure - only for demo purposes
        // In production, use bcrypt or Argon2 on the server
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hash_' + Math.abs(hash).toString(16);
    }

    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    // ============================================
    // VALIDATION & SANITIZATION
    // ============================================
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    sanitize(input) {
        // Remove HTML tags and dangerous characters
        return input.replace(/[<>\"\']/g, '').trim();
    }

    checkPasswordStrength(password) {
        const strengthBar = document.getElementById('password-strength');
        if (!strengthBar) return;

        let strength = 0;
        let color = '#e74c3c';

        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        if (/\d/.test(password)) strength += 15;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

        if (strength >= 75) color = '#27ae60';
        else if (strength >= 50) color = '#f39c12';

        strengthBar.style.setProperty('--strength', strength + '%');
        strengthBar.style.setProperty('--color', color);
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateToken() {
        return Array.from({length: 32}, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    }

    generateResetToken(user) {
        const token = this.generateToken();
        // In production, store this token with expiration in database
        return token;
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            setTimeout(() => errorElement.classList.remove('show'), 5000);
        }
    }

    showSuccess(elementId, message) {
        const successElement = document.getElementById(elementId);
        if (successElement) {
            successElement.textContent = message;
            successElement.classList.add('show');
        }
    }

    // ============================================
    // DATA PERSISTENCE
    // ============================================
    loadUsers() {
        const stored = localStorage.getItem('fantom_users');
        return stored ? JSON.parse(stored) : [
            // Demo account
            {
                id: 'demo_user',
                name: 'Demo User',
                email: 'demo@fantom.lx',
                password: this.hashPassword('demo1234'),
                createdAt: new Date().toISOString(),
                verified: true,
                plan: 'pro'
            }
        ];
    }

    saveUsers() {
        localStorage.setItem('fantom_users', JSON.stringify(this.users));
    }

    loadSessions() {
        const stored = localStorage.getItem('fantom_sessions');
        return stored ? JSON.parse(stored) : {};
    }

    saveSessions() {
        localStorage.setItem('fantom_sessions', JSON.stringify(this.sessions));
    }

    // Get current user data
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// ============================================
// TAB SWITCHING
// ============================================
function showTab(tabName) {
    // Hide all forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });

    // Remove active state from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected form
    if (tabName === 'login') {
        document.getElementById('login-form').classList.add('active');
        document.querySelector('.tab-btn:first-child').classList.add('active');
    } else if (tabName === 'register') {
        document.getElementById('register-form').classList.add('active');
        document.querySelector('.tab-btn:last-child').classList.add('active');
    } else if (tabName === 'forgot') {
        document.getElementById('forgot-form').classList.add('active');
    }
}

function showForgotPassword() {
    showTab('forgot');
    return false;
}

// Initialize auth system when page loads
const auth = new AuthSystem();

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.FantomAuth = auth;
}
