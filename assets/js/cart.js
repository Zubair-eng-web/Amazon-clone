const cart = {};
const STORAGE_KEY = 'amazonCartDemo';

function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(key => {
            cart[key] = parsed[key];
        });
    } catch {
        localStorage.removeItem(STORAGE_KEY);
    }
}

loadCart();

const priceMap = {
    'Pot 1': 24.99, 'Pot 2': 29.99, 'Pot 3': 22.50, 'Pot 4': 27.99,
    'Sandal Comfort': 19.99, 'Sandal Premium': 24.99, 'Sandal Casual': 18.50, 'Sandal Sport': 23.99,
    'Casual Shirt': 29.99, 'Casual Pants': 34.99, 'Casual Top': 21.99, 'Casual Dress': 39.99,
    'Home Decor': 45.00, 'Bedroom Accent': 32.50, 'Wall Art': 28.99, 'Table Lamp': 39.99,
    'Wireless Earbuds': 59.99, 'Portable Speaker': 49.99, 'Phone Charger': 15.99, 'Smart Watch': 89.99,
    'Gold Necklace': 119.99, 'Gold Bracelet': 99.99, 'Gold Ring': 79.99, 'Gold Earrings': 89.99,
    'Phone Case': 12.99, 'Phone Stand': 14.99, 'Screen Protector': 9.99, 'Phone Mount': 16.99,
    'Digital Watch': 49.99, 'Luxury Watch': 129.99, 'Sports Watch': 59.99, 'Elegant Watch': 79.99
};

const cartCount = document.querySelector('.cart-count');
const cartDrawer = document.getElementById('cartDrawer');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const shopNowBtn = document.querySelector('.shop-now');

function formatPrice(value) {
    return `$${value.toFixed(2)}`;
}

function updateCartCount() {
    const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function renderCart() {
    const items = Object.values(cart);
    cartItemsContainer.innerHTML = '';

    if (!items.length) {
        cartItemsContainer.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
        cartTotal.textContent = '$0.00';
        return;
    }

    let total = 0;
    items.forEach(item => {
        total += item.price * item.quantity;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="item-row">
                <div class="item-name">${item.name}</div>
                <div class="item-price">${formatPrice(item.price)}</div>
            </div>
            <div class="item-row item-row--controls">
                <div class="qty-controls">
                    <button class="qty-button" data-action="decrease" data-item="${item.name}">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-button" data-action="increase" data-item="${item.name}">+</button>
                </div>
                <div class="item-total">${formatPrice(item.price * item.quantity)}</div>
                <button class="remove-button" data-action="remove" data-item="${item.name}">Remove</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    cartTotal.textContent = formatPrice(total);
}

function openCart() {
    cartDrawer.classList.remove('hidden');
    cartDrawer.setAttribute('aria-hidden', 'false');
}

function closeCart() {
    cartDrawer.classList.add('hidden');
    cartDrawer.setAttribute('aria-hidden', 'true');
}

function addToCart(name, price) {
    if (!cart[name]) {
        cart[name] = { name, price, quantity: 0 };
    }
    cart[name].quantity += 1;
    updateCartCount();
    renderCart();
    saveCart();
    openCart();
}

function initProductCards() {
    document.querySelectorAll('.shop-card').forEach(card => {
        const title = card.querySelector('p')?.textContent?.trim() || 'Product';
        const price = priceMap[title] ?? 29.99;

        const priceTag = document.createElement('p');
        priceTag.className = 'product-price';
        priceTag.textContent = formatPrice(price);
        card.appendChild(priceTag);

        const button = document.createElement('button');
        button.className = 'add-to-cart';
        button.textContent = 'Add to Cart';
        button.addEventListener('click', () => addToCart(title, price));
        card.appendChild(button);
    });
}

function handleCartActions(event) {
    const action = event.target.dataset.action;
    const itemName = event.target.dataset.item;
    if (!action) return;

    if (action === 'close') {
        closeCart();
        return;
    }

    if (!itemName) return;
    if (!cart[itemName]) return;

    if (action === 'increase') {
        cart[itemName].quantity += 1;
    } else if (action === 'decrease') {
        cart[itemName].quantity = Math.max(1, cart[itemName].quantity - 1);
    } else if (action === 'remove') {
        delete cart[itemName];
    }

    updateCartCount();
    renderCart();
    saveCart();
}

function initEvents() {
    document.querySelector('.nav-cart').addEventListener('click', openCart);
    cartDrawer.addEventListener('click', handleCartActions);

    checkoutBtn.addEventListener('click', () => {
        const items = Object.values(cart);
        if (items.length === 0) {
            alert('Your cart is empty. Add items before checkout.');
            return;
        }

        saveCart();
        window.location.href = 'checkout/index.html';
    });

    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', () => {
            document.querySelector('.shop-sect')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

initProductCards();
initEvents();
updateCartCount();
renderCart();
