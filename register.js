// ==================== PASSWORD TOGGLE FUNCTIONALITY ====================

const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');

togglePassword.addEventListener('click', function() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
});

toggleConfirmPassword.addEventListener('click', function() {
    const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
    confirmPasswordInput.type = type;
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
});

// ==================== FORM ELEMENTS ====================

const registerForm = document.getElementById('registerForm');
const usernameInput = document.getElementById('username');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const successMessage = document.getElementById('successMessage');
const errorMessageBox = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// ==================== FORM VALIDATION AND SUBMISSION ====================

registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Reset messages
    usernameError.classList.remove('show');
    passwordError.classList.remove('show');
    confirmPasswordError.classList.remove('show');
    errorMessageBox.classList.remove('show');
    
    let isValid = true;

    // Validate Username
    if (usernameInput.value.trim().length < 3) {
        usernameError.classList.add('show');
        isValid = false;
    }

    // Validate Password
    if (passwordInput.value.length < 6) {
        passwordError.classList.add('show');
        isValid = false;
    }

    // Validate Password Match
    if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordError.classList.add('show');
        isValid = false;
    }

    // If validation passes, submit to server
    if (isValid) {
        // Disable submit button
        const submitBtn = registerForm.querySelector('.register-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';
        
        try {
            const formData = new FormData();
            formData.append('username', usernameInput.value.trim());
            formData.append('password', passwordInput.value);
            
            const response = await fetch('register.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Show success message
                successMessage.classList.add('show');
                registerForm.reset();
                
                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                // Show error message
                errorText.textContent = data.message || 'Registration failed. Please try again.';
                errorMessageBox.classList.add('show');
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
            }
        } catch (error) {
            console.error('Registration error:', error);
            errorText.textContent = 'An error occurred. Please try again.';
            errorMessageBox.classList.add('show');
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
        }
    }
});

// ==================== REAL-TIME VALIDATION ====================

usernameInput.addEventListener('input', function() {
    if (this.value.trim().length >= 3) {
        usernameError.classList.remove('show');
    }
});

passwordInput.addEventListener('input', function() {
    if (this.value.length >= 6) {
        passwordError.classList.remove('show');
    }
    if (confirmPasswordInput.value && this.value === confirmPasswordInput.value) {
        confirmPasswordError.classList.remove('show');
    }
});

confirmPasswordInput.addEventListener('input', function() {
    if (this.value === passwordInput.value) {
        confirmPasswordError.classList.remove('show');
    }
});

// ==================== AUTO-HIDE ERROR MESSAGES ====================

// Auto-hide error message box after 5 seconds
setInterval(() => {
    if (errorMessageBox.classList.contains('show')) {
        setTimeout(() => {
            errorMessageBox.classList.remove('show');
        }, 5000);
    }
}, 100);
