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

$user_id = $_SESSION['user_id'];

$sql = "SELECT `ID` as id, `ExpenseName` as name, `Amount` as amount, `Category` as category, `DateAdded` as date 
        FROM `expenses` 
        WHERE `UserID` = $user_id 
        ORDER BY `DateAdded` ASC";

$result = mysqli_query($conn, $sql);

if ($result) {
    $expenses = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $expenses[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'expenses' => $expenses
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Error fetching expenses: ' . mysqli_error($conn)]);
}

mysqli_close($conn);
?>
