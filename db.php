<?php
declare(strict_types=1);

const DB_HOST = 'localhost';
const DB_USER = 'root';
const DB_PASS = '';
const DB_NAME = 'amazon_demo';
const DB_CHARSET = 'utf8mb4';

function respond_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function get_db_connection(): mysqli
{
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS);
    if ($conn->connect_error) {
        respond_json(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error], 500);
    }
    $conn->set_charset(DB_CHARSET);

    if (!$conn->select_db(DB_NAME)) {
        $createDatabaseSql = sprintf(
            "CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET %s COLLATE %s_unicode_ci",
            DB_NAME,
            DB_CHARSET,
            DB_CHARSET
        );

        if (!$conn->query($createDatabaseSql)) {
            respond_json(['success' => false, 'message' => 'Unable to create database: ' . $conn->error], 500);
        }

        if (!$conn->select_db(DB_NAME)) {
            respond_json(['success' => false, 'message' => 'Unable to select database: ' . $conn->error], 500);
        }
    }

    ensure_db_schema($conn);
    return $conn;
}

function ensure_db_schema(mysqli $conn): void
{
    $queries = [
        "CREATE TABLE IF NOT EXISTS users (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS orders (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NULL,
            full_name VARCHAR(120) NOT NULL,
            email VARCHAR(255) NOT NULL,
            address VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            state VARCHAR(100) NOT NULL,
            postal VARCHAR(50) NOT NULL,
            country VARCHAR(100) NOT NULL,
            card_name VARCHAR(120) NOT NULL,
            card_last4 CHAR(4) NOT NULL,
            card_expiry VARCHAR(7) NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",

        "CREATE TABLE IF NOT EXISTS order_items (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            order_id INT UNSIGNED NOT NULL,
            product_name VARCHAR(255) NOT NULL,
            unit_price DECIMAL(10,2) NOT NULL,
            quantity INT UNSIGNED NOT NULL,
            total_price DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    ];

    foreach ($queries as $query) {
        if (!$conn->query($query)) {
            respond_json(['success' => false, 'message' => 'Database schema error: ' . $conn->error], 500);
        }
    }
}
