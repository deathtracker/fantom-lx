// ============================================
// FANTOM.LX AUTHENTICATION SYSTEM
// Complete Version
// ============================================

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.sessions = this.loadSessions();
        this.failedAttempts = this.loadFailedAttempts();
        this.init();
    }

    init() {
        this.checkSession();
        this.setupEventListeners();
        
        const regPassword = document.getElementById('reg-password');
        if (regPassword) {
            regPassword.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        }
    }

    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        const forgotForm = document.getElementById('forgot-form');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
        }
    }

    // ============================================
    // LOGIN
    // ============================================
    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        if (this.isRateLimited(email)) {
            this.showError('login-error', 'Too many login attempts. Please wait 5 minutes.');
            return;
        }

        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user || !this.verifyPassword(password, user.password)) {
            this.recordFailedAttempt(email);
            this.showError('login-error', 'Invalid email or password.');
            return;
        }

        this.createSession(user, rememberMe);
        this.clearFailedAttempts(email);
        window.location.href = 'dashboard.html';
    }

    // ============================================
    // REGISTRATION
    // ============================================
    handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;

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

        if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showError('register-error', 'An account with this email already exists.');
            return;
        }

        const newUser = {
            id: this.generateId(),
            name: this.sanitize(name),
            email: email.toLowerCase(),
            password: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            verified: false,
            role: 'user'
        };

        this.users.push(newUser);
        this.saveUsers();
        this.createSession(newUser, true);
        window.location.href = 'dashboard.html';
    }

    // ============================================
    // PASSWORD RESET
    // ============================================
    handleForgotPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgot-email').value.trim();
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (user) {
            const resetToken = this.generateResetToken();
            user.resetToken = resetToken;
            user.resetExpires = Date.now() + 3600000; // 1 hour
            this.saveUsers();
            
            console.log(`Password reset link: ${window.location.origin}/reset-password.html?token=${resetToken}`);
        }

        this.showSuccess('forgot-message', 'If an account exists, a reset link has been sent to your email.');
    }

    // ============================================
    // SESSION MANAGEMENT
    // ============================================
    createSession(user, rememberMe) {
        const sessionToken = this.generateSessionToken();
        const session = {
            token: sessionToken,
            userId: user.id,
            createdAt: Date.now(),
            expiresAt: rememberMe ? Date.now() + 2592000000 : Date.now() + 86400000, // 30 days or 1 day
            rememberMe: rememberMe
        };

        this.sessions.push(session);
        this.saveSessions();

        if (rememberMe) {
            localStorage.setItem('sessionToken', sessionToken);
        } else {
            sessionStorage.setItem('sessionToken', sessionToken);
        }

        this.currentUser = user;
    }

    checkSession() {
        const token = localStorage.getItem('sessionToken') || sessionStorage.getItem('sessionToken');
        
        if (!token) return false;

        const session = this.sessions.find(s => s.token === token);
        
        if (!session || session.expiresAt < Date.now()) {
            this.logout();
            return false;
        }

        const user = this.users.find(u => u.id === session.userId);
        if (user) {
            this.currentUser = user;
            return true;
        }

        return false;
    }

    logout() {
        localStorage.removeItem('sessionToken');
        sessionStorage.removeItem('sessionToken');
        this.currentUser = null;
        window.location.href = 'login.html';
    }

    // ============================================
    // SECURITY FUNCTIONS
    // ============================================
    hashPassword(password) {
        // Simple hash for demo - USE BCRYPT IN PRODUCTION!
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hash_' + Math.abs(hash).toString(16);
    }

    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    isRateLimited(email) {
        const attempts = this.failedAttempts[email] || { count: 0, lastAttempt: 0 };
        const fiveMinutesAgo = Date.now() - 300000;
        
        if (attempts.lastAttempt < fiveMinutesAgo) {
            return false;
        }
        
        return attempts.count >= 5;
    }

    recordFailedAttempt(email) {
        if (!this.failedAttempts[email]) {
            this.failedAttempts[email] = { count: 0, lastAttempt: 0 };
        }
        this.failedAttempts[email].count++;
        this.failedAttempts[email].lastAttempt = Date.now();
        this.saveFailedAttempts();
    }

    clearFailedAttempts(email) {
        delete this.failedAttempts[email];
        this.saveFailedAttempts();
    }

    sanitize(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    checkPasswordStrength(password) {
        let strength = 0;
        const indicator = document.getElementById('password-strength');
        
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        if (/\d/.test(password)) strength += 15;
        if (/[^a-zA-Z\d]/.test(password)) strength += 10;

        let color = '#e74c3c';
        if (strength > 50) color = '#f39c12';
        if (strength > 75) color = '#27ae60';

        indicator.style.setProperty('--strength', `${strength}%`);
        indicator.style.setProperty('--color', color);
    }

    // ============================================
    // STORAGE
    // ============================================
    loadUsers() {
        const stored = localStorage.getItem('fantom_users');
        return stored ? JSON.parse(stored) : [];
    }

    saveUsers() {
        localStorage.setItem('fantom_users', JSON.stringify(this.users));
    }

    loadSessions() {
        const stored = localStorage.getItem('fantom_sessions');
        return stored ? JSON.parse(stored) : [];
    }

    saveSessions() {
        localStorage.setItem('fantom_sessions', JSON.stringify(this.sessions));
    }

    loadFailedAttempts() {
        const stored = localStorage.getItem('fantom_failed_attempts');
        return stored ? JSON.parse(stored) : {};
    }

    saveFailedAttempts() {
        localStorage.setItem('fantom_failed_attempts', JSON.stringify(this.failedAttempts));
    }

    // ============================================
    // UTILITIES
    // ============================================
    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateSessionToken() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
    }

    generateResetToken() {
        return 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.classList.add('show');
        setTimeout(() => element.classList.remove('show'), 5000);
    }

    showSuccess(elementId, message) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.classList.add('show');
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}

// ============================================
// TAB SWITCHING
// ============================================
function showTab(tabName) {
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => form.classList.remove('active'));

    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));

    if (tabName === 'login') {
        document.getElementById('login-form').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else if (tabName === 'register') {
        document.getElementById('register-form').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }
}

function showForgotPassword() {
    const forms = document.querySelectorAll('.auth-form');
    forms.forEach(form => form.classList.remove('active'));
    document.getElementById('forgot-form').classList.add('active');
}

// Initialize the auth system
const auth = new AuthSystem();
