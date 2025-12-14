<?php
session_start();
header('Content-Type: application/json');

// Check if user is logged in
if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'is_admin' => isset($_SESSION['is_admin']) ? (bool)$_SESSION['is_admin'] : false
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Not logged in'
    ]);
}
?>
