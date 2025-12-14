<?php
session_start();

// Database connection
$conn = mysqli_connect('localhost', 'root', '', 'WalletPlus');

if (!$conn) {
    die(json_encode(['success' => false, 'message' => 'Database connection error: ' . mysqli_connect_error()]));
}

// Set charset to utf8
mysqli_set_charset($conn, "utf8");

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = mysqli_real_escape_string($conn, trim($_POST['username']));
    $password = trim($_POST['password']);
    
    // Validate input
    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Username and password are required']);
        exit;
    }
    
    // Check if username starts with "ad" to determine admin status
    $is_admin = (substr(strtolower($username), 0, 2) === 'ad') ? 1 : 0;
    
    // Check if user exists
    $check_sql = "SELECT * FROM `users` WHERE `Username` = '$username'";
    $result = mysqli_query($conn, $check_sql);
    
    if (mysqli_num_rows($result) > 0) {
        // User exists - verify password
        $user = mysqli_fetch_assoc($result);
        
        if (password_verify($password, $user['Password'])) {
            // Password correct - login successful
            $_SESSION['user_id'] = $user['ID'];
            $_SESSION['username'] = $user['Username'];
            $_SESSION['is_admin'] = $user['IsAdmin'];
            
            echo json_encode([
                'success' => true, 
                'message' => 'Login successful',
                'is_admin' => $user['IsAdmin']
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Incorrect password']);
        }
    } else {
        // User doesn't exist - suggest registration
        echo json_encode(['success' => false, 'message' => 'Account not found. Please register first.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

mysqli_close($conn);
?>