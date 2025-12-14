<?php
session_start();
header('Content-Type: application/json');

// Database connection
$conn = mysqli_connect('localhost', 'root', '', 'WalletPlus');

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection error: ' . mysqli_connect_error()]);
    exit;
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
    
    // Validate username length
    if (strlen($username) < 3) {
        echo json_encode(['success' => false, 'message' => 'Username must be at least 3 characters']);
        exit;
    }
    
    // Validate password length
    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
        exit;
    }
    
    // Check if username already exists
    $check_sql = "SELECT `ID` FROM `users` WHERE `Username` = '$username'";
    $result = mysqli_query($conn, $check_sql);
    
    if (mysqli_num_rows($result) > 0) {
        echo json_encode(['success' => false, 'message' => 'Username already exists. Please choose a different username.']);
        exit;
    }
    
    // Check if username starts with "ad" to determine admin status
    $is_admin = (substr(strtolower($username), 0, 2) === 'ad') ? 1 : 0;
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $insert_sql = "INSERT INTO `users` (`Username`, `Password`, `IsAdmin`) VALUES ('$username', '$hashed_password', $is_admin)";
    
    if (mysqli_query($conn, $insert_sql)) {
        $new_user_id = mysqli_insert_id($conn);
        
        // Set session variables (auto-login after registration)
        $_SESSION['user_id'] = $new_user_id;
        $_SESSION['username'] = $username;
        $_SESSION['is_admin'] = $is_admin;
        
        echo json_encode([
            'success' => true, 
            'message' => 'Account created successfully!',
            'user_id' => $new_user_id,
            'is_admin' => $is_admin
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error creating account: ' . mysqli_error($conn)]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

mysqli_close($conn);
?>
