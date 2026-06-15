<?php
require_once __DIR__ . '/db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_json(['success' => false, 'message' => 'Invalid request method.'], 405);
}

$action = strtolower($_GET['action'] ?? '');
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    respond_json(['success' => false, 'message' => 'Invalid request payload.'], 400);
}

$conn = get_db_connection();

if ($action === 'signup') {
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = trim($input['password'] ?? '');

    if ($name === '' || $email === '' || $password === '') {
        respond_json(['success' => false, 'message' => 'Name, email, and password are required.'], 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond_json(['success' => false, 'message' => 'Please provide a valid email address.'], 400);
    }

    $stmt = $conn->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        respond_json(['success' => false, 'message' => 'An account with that email already exists.'], 409);
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    $stmt->bind_param('sss', $name, $email, $passwordHash);

    if (!$stmt->execute()) {
        respond_json(['success' => false, 'message' => 'Unable to create user account.'], 500);
    }

    $_SESSION['user'] = ['id' => $stmt->insert_id, 'name' => $name, 'email' => $email];
    respond_json(['success' => true, 'message' => 'Account created successfully.', 'user' => $_SESSION['user']]);
}

if ($action === 'login') {
    $email = trim($input['email'] ?? '');
    $password = trim($input['password'] ?? '');

    if ($email === '' || $password === '') {
        respond_json(['success' => false, 'message' => 'Email and password are required.'], 400);
    }

    $stmt = $conn->prepare('SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->bind_result($id, $name, $storedEmail, $hash);

    if (!$stmt->fetch()) {
        respond_json(['success' => false, 'message' => 'Invalid email or password.'], 401);
    }

    if (!password_verify($password, $hash)) {
        respond_json(['success' => false, 'message' => 'Invalid email or password.'], 401);
    }

    $_SESSION['user'] = ['id' => $id, 'name' => $name, 'email' => $storedEmail];
    respond_json(['success' => true, 'message' => 'Login successful.', 'user' => $_SESSION['user']]);
}

respond_json(['success' => false, 'message' => 'Invalid action.'], 400);
