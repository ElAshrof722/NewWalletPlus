// ==================== SETTINGS PAGE JAVASCRIPT ====================

// ==================== LOAD USER SESSION ====================
async function loadUserSession() {
    try {
        const response = await fetch('get_session.php');
        const data = await response.json();
        
        if (data.success) {
            // Update all username displays
            document.getElementById('username-display').textContent = data.user.username;
            document.getElementById('settings-username').textContent = data.user.username;
            document.getElementById('display-username').textContent = data.user.username;
            
            // Update role displays
            const roleText = data.user.is_admin ? 'Admin' : 'User';
            document.getElementById('role-display').textContent = data.user.is_admin ? 'Admin View' : 'User View';
            document.getElementById('settings-role').textContent = roleText;
            document.getElementById('display-role').textContent = roleText;
            
            // Change role badge color for admin
            if (data.user.is_admin) {
                document.getElementById('settings-role').style.background = 'linear-gradient(135deg, #d32f2f, #f44336)';
            }
        } else {
            // Not logged in - redirect to login
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Session error:', error);
        showNotification('Error loading session', 'error');
    }
}

// ==================== LOGOUT FUNCTIONALITY ====================
document.getElementById('logout-btn').addEventListener('click', function() {
    // Confirm logout
    if (confirm('Are you sure you want to logout?')) {
        // Redirect to logout.php
        window.location.href = 'logout.php';
    }
});

// ==================== DELETE ALL EXPENSES ====================
document.getElementById('delete-all-btn').addEventListener('click', async function() {
    // Confirm deletion
    const confirmation = confirm('⚠️ WARNING: This will permanently delete ALL your expenses!\n\nAre you sure you want to continue?');
    
    if (!confirmation) return;
    
    // Double confirmation for safety
    const doubleCheck = confirm('This action cannot be undone!\n\nClick OK to confirm deletion.');
    
    if (!doubleCheck) return;
    
    try {
        const response = await fetch('delete_all_expenses.php', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('All expenses deleted successfully!', 'success');
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showNotification(data.message || 'Error deleting expenses', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showNotification('Error deleting expenses', 'error');
    }
});

// ==================== PASSWORD UPDATE FORM ====================
document.getElementById('password-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('New password must be at least 6 characters', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    if (currentPassword === newPassword) {
        showNotification('New password must be different from current password', 'error');
        return;
    }
    
    // Disable submit button
    const submitBtn = this.querySelector('.btn-update');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';
    
    try {
        const formData = new FormData();
        formData.append('current_password', currentPassword);
        formData.append('new_password', newPassword);
        
        const response = await fetch('update_password.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Password updated successfully!', 'success');
            this.reset();
        } else {
            showNotification(data.message || 'Error updating password', 'error');
        }
    } catch (error) {
        console.error('Password update error:', error);
        showNotification('Error updating password', 'error');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Update Password';
    }
});

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#26a65b' : '#f44336';
    const icon = type === 'success' ? '✓' : '✕';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${bgColor};
        color: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        font-weight: 600;
    `;
    
    notification.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check' : 'xmark'}-circle"></i> ${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== HIGHLIGHT ACTIVE PAGE ====================
function highlightActivePage() {
    const links = document.querySelectorAll('.links-nav');
    
    links.forEach(link => {
        if (link.getAttribute('href') === 'setting.html') {
            link.classList.add('active');
        }
    });
}

// ==================== ANIMATIONS ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes slideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
`;
document.head.appendChild(style);

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    loadUserSession();
    highlightActivePage();
    
    console.log('✅ Settings Page Ready!');
});