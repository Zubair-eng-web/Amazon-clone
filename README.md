# Amazon Clone

A simple Amazon-style e-commerce demo built with PHP, HTML, CSS, and JavaScript.

## Features

- Home page with Amazon-style navigation and hero slider
- Product category cards for home, fashion, electronics, and more
- User authentication using PHP sessions for sign up and login
- Checkout flow with shipping and payment details
- Order storage in MySQL using `orders` and `order_items` tables
- Responsive layout and polished UI design

## Project Structure

- `index.html` — main storefront page
- `style.css` — main styles
- `assets/css/buying-process.css` — checkout and buying flow styles
- `auth.php` — login and signup backend
- `order.php` — order submission backend
- `db.php` — database connection and schema setup
- `checkout/` — checkout page and assets

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Zubair-eng-web/Amazon-clone.git
   cd Amazon-clone
   ```

2. Install a local PHP environment with MySQL (XAMPP, WAMP, MAMP, or similar).

3. Place the project folder in your web server document root (e.g. `htdocs`).

4. Configure MySQL credentials in `db.php` if needed:
   ```php
   const DB_HOST = 'localhost';
   const DB_USER = 'root';
   const DB_PASS = '';
   const DB_NAME = 'amazon_demo';
   ```

5. Open the site in your browser:
   ```text
   http://localhost/Amazon-clone/index.html
   ```

6. Use the app to browse products and submit a checkout order.

## Notes

- The database is automatically created by `db.php` if it does not already exist.
- User passwords are securely hashed with `password_hash()`.
- Order data is saved in the MySQL database using `orders` and `order_items` tables.

## License

This project is a demo and can be used as a learning example for building a PHP-based e-commerce site.
