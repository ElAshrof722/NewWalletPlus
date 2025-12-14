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
    $expense_id = intval($_POST['id']);
    
    // Validate input
    if ($expense_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid expense ID']);
        exit;
    }
    
    // Delete only if the expense belongs to the current user
    $sql = "DELETE FROM `expenses` WHERE `ID` = $expense_id AND `UserID` = $user_id";
    
    if (mysqli_query($conn, $sql)) {
        if (mysqli_affected_rows($conn) > 0) {
            echo json_encode(['success' => true, 'message' => 'Expense deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Expense not found or unauthorized']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Error deleting expense: ' . mysqli_error($conn)]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

mysqli_close($conn);
?>
