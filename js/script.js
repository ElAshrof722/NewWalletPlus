// ==================== EXPENSE TRACKER WITH DATABASE INTEGRATION ====================

// ==================== GLOBAL STATE ====================
let expenses = [];
let currentUser = null;

// ==================== SESSION MANAGEMENT ====================
async function initSession() {
    try {
        const response = await fetch('get_session.php');
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            updateUserDisplay();
            loadExpenses();
        } else {
            // Redirect to login if not logged in
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Session error:', error);
        showNotification('Error loading session', 'error');
    }
}

function updateUserDisplay() {
    const usernameDisplay = document.getElementById('username-display');
    const roleDisplay = document.getElementById('role-display');
    
    if (currentUser) {
        usernameDisplay.textContent = currentUser.username;
        
        // Check if user is admin
        if (currentUser.is_admin) {
            roleDisplay.textContent = 'Admin View';
            roleDisplay.style.color = '#6213bb';
            roleDisplay.style.fontWeight = 'bold';
        } else {
            roleDisplay.textContent = 'User View';
        }
    }
}

// ==================== LOAD EXPENSES FROM DATABASE ====================
async function loadExpenses() {
    try {
        const response = await fetch('get_expenses.php');
        const data = await response.json();
        
        if (data.success) {
            expenses = data.expenses;
            updateDisplay();
        } else {
            console.error('Error loading expenses:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error loading expenses', 'error');
    }
}

// ==================== CALCULATOR ====================
let calcScreen = null;
let currentValue = '0';
let previousValue = '';
let operation = null;
let shouldResetScreen = false;

function initCalculator() {
    calcScreen = document.getElementById('calc-screen');
    const buttons = document.querySelectorAll('.calc-keys button');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => handleCalcButton(button));
    });
}

function handleCalcButton(button) {
    const value = button.textContent.trim();
    
    if (button.classList.contains('btn-red') && value === 'DEL') {
        clearCalc();
    } else if (button.classList.contains('btn-red') && button.querySelector('i')) {
        backspace();
    } else if (button.classList.contains('btn-green')) {
        calculate();
    } else if (button.classList.contains('btn-op')) {
        setOperation(value);
    } else if (value === '.') {
        appendDecimal();
    } else {
        appendNumber(value);
    }
    
    updateCalcScreen();
}

function appendNumber(num) {
    if (shouldResetScreen) {
        currentValue = num;
        shouldResetScreen = false;
    } else {
        currentValue = currentValue === '0' ? num : currentValue + num;
    }
}

function appendDecimal() {
    if (shouldResetScreen) {
        currentValue = '0.';
        shouldResetScreen = false;
        return;
    }
    if (!currentValue.includes('.')) {
        currentValue += '.';
    }
}

function setOperation(op) {
    if (operation !== null) {
        calculate();
    }
    operation = op;
    previousValue = currentValue;
    shouldResetScreen = true;
}

function calculate() {
    if (operation === null || shouldResetScreen) return;
    
    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);
    
    if (isNaN(prev) || isNaN(current)) return;
    
    let result;
    switch (operation) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '×':
            result = prev * current;
            break;
        case '÷':
            result = current === 0 ? 'Error' : prev / current;
            break;
        default:
            return;
    }
    
    currentValue = result.toString();
    operation = null;
    previousValue = '';
    shouldResetScreen = true;
}

function clearCalc() {
    currentValue = '0';
    previousValue = '';
    operation = null;
    shouldResetScreen = false;
}

function backspace() {
    if (currentValue.length > 1) {
        currentValue = currentValue.slice(0, -1);
    } else {
        currentValue = '0';
    }
}

function updateCalcScreen() {
    const displayValue = currentValue.length > 12 
        ? parseFloat(currentValue).toExponential(6) 
        : currentValue;
    calcScreen.value = displayValue;
}

// ==================== CALCULATOR TOGGLE ====================
function initCalculatorToggle() {
    const calcBox = document.querySelector('.calculator-box');
    const toggleBtn = document.querySelector('.display button');
    let isVisible = false;
    
    // Hide calculator initially
    calcBox.style.display = 'none';
    
    toggleBtn.addEventListener('click', () => {
        isVisible = !isVisible;
        calcBox.style.display = isVisible ? 'block' : 'none';
    });
}

// ==================== EXPENSE MANAGEMENT ====================
function initExpenseForm() {
    const form = document.getElementById('expense-form');
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addExpense(form);
    });
}

async function addExpense(form) {
    const formData = new FormData(form);
    
    try {
        const response = await fetch('add_expense.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Expense added successfully!', 'success');
            form.reset();
            loadExpenses(); // Reload expenses from database
        } else {
            showNotification(data.message || 'Error adding expense', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error adding expense', 'error');
    }
}

async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }
    
    try {
        const response = await fetch('delete_expense.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${id}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Expense deleted!', 'success');
            loadExpenses(); // Reload expenses from database
        } else {
            showNotification(data.message || 'Error deleting expense', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error deleting expense', 'error');
    }
}

function updateDisplay() {
    updateStats();
    updateTransactionsList();
    updatePieChart();
}

function updateStats() {
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    // Update total expenses card
    const totalExpensesElement = document.getElementById('total-expenses');
    if (totalExpensesElement) {
        totalExpensesElement.textContent = `${totalExpenses.toFixed(2)} EGP`;
    }
    
    // Update progress bar (assume max 10000 EGP for visualization)
    const maxAmount = 10000;
    const expensePercentage = Math.min((totalExpenses / maxAmount) * 100, 100);
    
    const expenseBar = document.getElementById('expense-bar');
    if (expenseBar) {
        expenseBar.style.width = `${expensePercentage}%`;
    }
}

function updateTransactionsList() {
    const recent = document.querySelector('.recent');
    
    // Remove old transactions
    const oldTransactions = recent.querySelectorAll('.transaction-row');
    oldTransactions.forEach(t => t.remove());
    
    // Add last 5 expenses
    const lastFive = expenses.slice(-5).reverse();
    
    if (lastFive.length === 0) {
        const row = document.createElement('div');
        row.className = 'transaction-row';
        row.style.gridColumn = '1 / -1';
        row.style.textAlign = 'center';
        row.style.color = '#999';
        row.style.padding = '20px';
        row.textContent = 'No transactions yet';
        recent.appendChild(row);
        return;
    }
    
    lastFive.forEach(expense => {
        const row = document.createElement('div');
        row.className = 'transaction-row';
        row.style.display = 'contents';
        row.innerHTML = `
            <div style="color: #333; font-size: 13px; padding: 5px 0;">${expense.category}</div>
            <div style="color: #f44336; font-weight: bold; font-size: 13px; padding: 5px 0;">${parseFloat(expense.amount).toFixed(2)} EGP</div>
            <div style="color: #26a65b; font-size: 13px; padding: 5px 0; cursor: pointer;" onclick="deleteExpense(${expense.id})" title="Click to delete">
                <i class="fa-solid fa-trash" style="color: #f44336; margin-right: 5px;"></i>Delete
            </div>
        `;
        recent.appendChild(row);
    });
}

function updatePieChart() {
    const categoryTotals = {
        'Food': 0,
        'Transport': 0,
        'Shopping': 0,
        'Others': 0
    };
    
    expenses.forEach(exp => {
        const category = exp.category || 'Others';
        if (categoryTotals.hasOwnProperty(category)) {
            categoryTotals[category] += parseFloat(exp.amount);
        } else {
            categoryTotals['Others'] += parseFloat(exp.amount);
        }
    });
    
    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    
    if (total === 0) {
        // Reset to default chart (equal parts)
        const pieChart = document.getElementById('pie-chart');
        if (pieChart) {
            pieChart.style.background = `conic-gradient(
                var(--red-color) 0deg 90deg,
                var(--blue-color) 90deg 180deg,
                var(--green-color) 180deg 270deg,
                var(--grey-color) 270deg 360deg
            )`;
        }
        return;
    }
    
    // Calculate degrees for each category
    let currentDeg = 0;
    const gradientParts = [];
    const colorMap = {
        'Shopping': '#f44336',
        'Transport': '#2196f3',
        'Food': '#8bc34a',
        'Others': '#b3b3b3'
    };
    
    Object.entries(categoryTotals).forEach(([category, amount]) => {
        const percentage = (amount / total) * 360;
        const color = colorMap[category];
        if (percentage > 0) {
            gradientParts.push(`${color} ${currentDeg}deg ${currentDeg + percentage}deg`);
            currentDeg += percentage;
        }
    });
    
    const pieChart = document.getElementById('pie-chart');
    if (pieChart && gradientParts.length > 0) {
        pieChart.style.background = `conic-gradient(${gradientParts.join(', ')})`;
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#26a65b' : '#f44336';
    
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
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== ACTIVE PAGE HIGHLIGHT ====================
function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.links-nav');
    
    links.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.style.backgroundColor = 'var(--dark-purple)';
            link.style.color = 'white';
            const icon = link.querySelector('i');
            if (icon) icon.style.color = 'white';
        }
    });
}

// ==================== ANIMATIONS ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-20px); }
    }
    
    .fa-trash:hover {
        transform: scale(1.2);
        transition: transform 0.2s ease;
    }
`;
document.head.appendChild(style);

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    initSession(); // Load user session first
    initCalculator();
    initCalculatorToggle();
    initExpenseForm();
    highlightActivePage();
    
    console.log('✅ Expense Tracker Ready!');
});