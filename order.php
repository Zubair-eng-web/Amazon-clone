<?php
require_once __DIR__ . '/db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond_json(['success' => false, 'message' => 'Invalid request method.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    respond_json(['success' => false, 'message' => 'Invalid request payload.'], 400);
}

$shipping = $input['shipping'] ?? [];
$payment = $input['payment'] ?? [];
$cart = $input['cart'] ?? [];

if (!is_array($shipping) || !is_array($payment) || !is_array($cart) || empty($cart)) {
    respond_json(['success' => false, 'message' => 'Complete shipping, payment, and cart details are required.'], 400);
}

$requiredFields = ['fullName', 'email', 'address', 'city', 'state', 'postal', 'country'];
foreach ($requiredFields as $field) {
    if (empty(trim($shipping[$field] ?? ''))) {
        respond_json(['success' => false, 'message' => 'Shipping field ' . $field . ' is required.'], 400);
    }
}

$paymentFields = ['cardName', 'cardNumber', 'expiry', 'cvv'];
foreach ($paymentFields as $field) {
    if (empty(trim($payment[$field] ?? ''))) {
        respond_json(['success' => false, 'message' => 'Payment field ' . $field . ' is required.'], 400);
    }
}

$email = filter_var(trim($shipping['email']), FILTER_VALIDATE_EMAIL);
if ($email === false) {
    respond_json(['success' => false, 'message' => 'Please provide a valid email address.'], 400);
}

$cardNumberDigits = preg_replace('/\D+/', '', $payment['cardNumber']);
$cardLast4 = substr($cardNumberDigits, -4);
if (strlen($cardLast4) < 4) {
    respond_json(['success' => false, 'message' => 'Card number must contain at least 4 digits.'], 400);
}

$cartItems = [];
$orderTotal = 0.0;
foreach ($cart as $item) {
    if (empty($item['name']) || empty($item['price']) || empty($item['quantity'])) {
        continue;
    }
    $quantity = (int)$item['quantity'];
    $unitPrice = (float)$item['price'];
    if ($quantity <= 0 || $unitPrice < 0) {
        continue;
    }
    $itemTotal = $unitPrice * $quantity;
    $orderTotal += $itemTotal;
    $cartItems[] = [
        'product_name' => $item['name'],
        'unit_price' => $unitPrice,
        'quantity' => $quantity,
        'total_price' => $itemTotal,
    ];
}

if (empty($cartItems)) {
    respond_json(['success' => false, 'message' => 'The cart contains no valid items.'], 400);
}

$conn = get_db_connection();
$userId = $_SESSION['user']['id'] ?? null;

$stmt = $conn->prepare(
    'INSERT INTO orders (user_id, full_name, email, address, city, state, postal, country, card_name, card_last4, card_expiry, total_amount)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
$fullName = trim($shipping['fullName']);
$address = trim($shipping['address']);
$city = trim($shipping['city']);
$state = trim($shipping['state']);
$postal = trim($shipping['postal']);
$country = trim($shipping['country']);
$cardName = trim($payment['cardName']);
$cardExpiry = trim($payment['expiry']);
$totalAmount = number_format($orderTotal, 2, '.', '');

$stmt->bind_param(
    'issssssssssd',
    $userId,
    $fullName,
    $email,
    $address,
    $city,
    $state,
    $postal,
    $country,
    $cardName,
    $cardLast4,
    $cardExpiry,
    $totalAmount
);

if (!$stmt->execute()) {
    respond_json(['success' => false, 'message' => 'Unable to create order: ' . $stmt->error], 500);
}

$orderId = $conn->insert_id;

$itemStmt = $conn->prepare(
    'INSERT INTO order_items (order_id, product_name, unit_price, quantity, total_price) VALUES (?, ?, ?, ?, ?)'
);

foreach ($cartItems as $item) {
    $itemStmt->bind_param(
        'isdid',
        $orderId,
        $item['product_name'],
        $item['unit_price'],
        $item['quantity'],
        $item['total_price']
    );
    if (!$itemStmt->execute()) {
        respond_json(['success' => false, 'message' => 'Unable to save order items: ' . $itemStmt->error], 500);
    }
}

respond_json([
    'success' => true,
    'message' => 'Order successfully created.',
    'orderId' => $orderId,
]);
