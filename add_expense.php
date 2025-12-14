<?php
session_start();
header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

// Database connection
$conn = mysqli_connect('localhost', 'root', '', 'WalletPlus');

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection error']);
    exit;
}

mysqli_set_charset($conn, "utf8");

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_id = $_SESSION['user_id'];
    $expense_name = mysqli_real_escape_string($conn, trim($_POST['expense_name']));
    $amount = floatval($_POST['amount']);
    $category = mysqli_real_escape_string($conn, trim($_POST['category']));
    
    // Validate input
    if (empty($expense_name) || $amount <= 0 || empty($category)) {
        echo json_encode(['success' => false, 'message' => 'Invalid input data']);
        exit;
    }
    
    // Validate category (only allow specific categories)
    $allowed_categories = ['Food', 'Transport', 'Shopping', 'Others'];
    if (!in_array($category, $allowed_categories)) {
        $category = 'Others';
    }
    
    $date_added = date('Y-m-d H:i:s');
    
    $sql = "INSERT INTO `expenses` (`UserID`, `ExpenseName`, `Amount`, `Category`, `DateAdded`) 
            VALUES ($user_id, '$expense_name', $amount, '$category', '$date_added')";
    
    if (mysqli_query($conn, $sql)) {
        echo json_encode([
            'success' => true, 
            'message' => 'Expense added successfully',
            'expense_id' => mysqli_insert_id($conn)
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error adding expense: ' . mysqli_error($conn)]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

mysqli_close($conn);
?>
