// Constants and Utilities
const PLANNER_VERSION = '1.0.0';
const MIN_PASSWORD_LENGTH = 6;

// Data structure templates
const defaultUserData = {
    name: '',
    regNo: '',
    branch: '',
    group: '',
    semester: '5th',
    password: '',
    createdAt: '',
    lastLogin: ''
};

const defaultPlannerData = {
    todos: [],
    links: {
        personal: [],
        quick: [],
        ai: []
    },
    settings: {
        theme: 'light',
        version: PLANNER_VERSION
    }
};

// Utility Functions
function validateRegNo(regNo) {
    // Add your registration number format validation
    return regNo.length >= 5 && /^[A-Za-z0-9]+$/.test(regNo);
}

function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
}

function isValidPassword(password) {
    return password.length >= MIN_PASSWORD_LENGTH;
}

// Form validation setup
function setupFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
}

// Handle password visibility toggle
function setupPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const passwordInput = document.getElementById('userPassword');
            const icon = this.querySelector('i');
            
            if (passwordInput && icon) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    }
}

// Multi-step form handling
let currentStep = 1;

function validateStep1() {
    const name = document.getElementById('userName')?.value;
    const regNo = document.getElementById('userRegNo')?.value;
    const password = document.getElementById('userPassword')?.value;
    
    if (!name || !regNo || !password) {
        showError('Please fill in all fields in Step 1');
        return false;
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedRegNo = sanitizeInput(regNo);
    
    if (sanitizedName.length < 2) {
        showError('Name must be at least 2 characters long');
        return false;
    }
    
    if (!validateRegNo(sanitizedRegNo)) {
        showError('Please enter a valid registration number');
        return false;
    }
    
    if (!isValidPassword(password)) {
        showError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
        return false;
    }
    
    // Check if user already exists
    try {
        if (localStorage.getItem(`user_${sanitizedRegNo}`)) {
            showError('A user with this registration number already exists');
            return false;
        }
    } catch (error) {
        console.error('Error checking existing user:', error);
        showError('An error occurred. Please try again.');
        return false;
    }
    
    return true;
}

function validateStep2() {
    const branch = document.getElementById('userBranch')?.value;
    const group = document.getElementById('userGroup')?.value;
    
    if (!branch || !group) {
        showError('Please fill in all fields in Step 2');
        return false;
    }
    
    return true;
}

function nextStep() {
    if (currentStep === 1 && validateStep1()) {
        try {
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            document.getElementById('step1Label').classList.remove('active');
            document.getElementById('step2Label').classList.add('active');
            document.getElementById('progressBar').style.width = '100%';
            currentStep = 2;
        } catch (error) {
            console.error('Error in nextStep:', error);
            showError('An error occurred. Please try again.');
        }
    }
}

function prevStep() {
    if (currentStep === 2) {
        try {
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step1').classList.add('active');
            document.getElementById('step2Label').classList.remove('active');
            document.getElementById('step1Label').classList.add('active');
            document.getElementById('progressBar').style.width = '50%';
            currentStep = 1;
        } catch (error) {
            console.error('Error in prevStep:', error);
            showError('An error occurred. Please try again.');
        }
    }
}

// Message handling
function showMessage(message, type = 'error') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show mt-3`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'} me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Remove existing messages
    document.querySelectorAll('.alert').forEach(alert => alert.remove());
    
    // Add new message
    const form = document.querySelector('form');
    if (form && form.parentNode) {
        form.parentNode.insertBefore(messageDiv, form);
        
        // Auto dismiss
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => messageDiv.remove(), 150);
        }, 5000);
    }
}

function showError(message) {
    showMessage(message, 'error');
}

function showSuccess(message) {
    showMessage(message, 'success');
}

// Handle signup form submission
document.getElementById('signupForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    try {
        const name = sanitizeInput(document.getElementById('userName').value);
        const regNo = sanitizeInput(document.getElementById('userRegNo').value);
        const password = document.getElementById('userPassword').value;
        const branch = document.getElementById('userBranch').value;
        const group = document.getElementById('userGroup').value;
        
        // Create user data
        const userData = {
            ...defaultUserData,
            name,
            regNo,
            password, // In a real app, this should be hashed
            branch,
            group,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        // Create planner data
        const plannerData = {
            ...defaultPlannerData,
            createdAt: new Date().toISOString()
        };
        
        // Store data
        localStorage.setItem(`user_${regNo}`, JSON.stringify(userData));
        localStorage.setItem(`planner_${regNo}`, JSON.stringify(plannerData));
        
        showSuccess('Account created successfully! Redirecting to login...');
        
        // Redirect after a delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    } catch (error) {
        console.error('Signup error:', error);
        showError('An error occurred during signup. Please try again.');
    }
});

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const regNo = sanitizeInput(document.getElementById('userRegNo').value);
        const password = document.getElementById('userPassword').value;
        
        // Get user data
        const userData = JSON.parse(localStorage.getItem(`user_${regNo}`));
        
        if (!userData) {
            showError('User not found. Please check your registration number.');
            return;
        }
        
        if (userData.password !== password) {
            showError('Incorrect password. Please try again.');
            return;
        }
        
        // Update last login
        userData.lastLogin = new Date().toISOString();
        localStorage.setItem(`user_${regNo}`, JSON.stringify(userData));
        
        // Store current user
        localStorage.setItem('currentUser', regNo);
        
        showSuccess('Login successful! Redirecting...');
        
        // Redirect after a delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred during login. Please try again.');
    }
});

// Check if user is already logged in
function checkAuth() {
    try {
        const currentUser = localStorage.getItem('currentUser');
        const isLoginPage = window.location.pathname.includes('login.html');
        const isSignupPage = window.location.pathname.includes('signup.html');
        
        if (currentUser) {
            // Verify user data exists
            const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
            if (!userData) {
                localStorage.removeItem('currentUser');
                if (!isLoginPage) {
                    window.location.href = 'login.html';
                }
                return;
            }
            
            // Redirect if on auth pages
            if (isLoginPage || isSignupPage) {
                window.location.href = 'index.html';
            }
        } else if (!isLoginPage && !isSignupPage) {
            // Redirect to login if not logged in
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('currentUser');
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    try {
        setupFormValidation();
        setupPasswordToggle();
        checkAuth();
    } catch (error) {
        console.error('Initialization error:', error);
    }
}); 