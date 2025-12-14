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
    
    // Delete all expenses for the current user
    $sql = "DELETE FROM `expenses` WHERE `UserID` = $user_id";
    
    if (mysqli_query($conn, $sql)) {
        $deleted_count = mysqli_affected_rows($conn);
        
        echo json_encode([
            'success' => true,
            'message' => "Successfully deleted $deleted_count expense(s)",
            'deleted_count' => $deleted_count
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error deleting expenses: ' . mysqli_error($conn)]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

mysqli_close($conn);
?>
