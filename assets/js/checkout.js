const STORAGE_KEY = 'amazonCartDemo';
const summaryList = document.getElementById('summaryList');
const summaryTotal = document.getElementById('summaryTotal');
const summaryItemCount = document.getElementById('summaryItemCount');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const checkoutForm = document.getElementById('checkoutForm');
const paymentForm = document.getElementById('paymentForm');

function formatPrice(value) {
    return `$${value.toFixed(2)}`;
}

function loadCartData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return {};
    try {
        return JSON.parse(data);
    } catch {
        return {};
    }
}

function renderOrderSummary(cart) {
    const items = Object.values(cart);
    summaryList.innerHTML = '';

    if (!items.length) {
        summaryList.innerHTML = '<p class="cart-empty">Your cart is empty. Return to shop to add items.</p>';
        summaryTotal.textContent = '$0.00';
        summaryItemCount.textContent = '0 items';
        placeOrderBtn.disabled = true;
        placeOrderBtn.style.opacity = '0.6';
        return;
    }

    let total = 0;
    let itemCount = 0;

    items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemCount += item.quantity;

        const itemEl = document.createElement('div');
        itemEl.className = 'summary-item';
        itemEl.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <span>${item.quantity} × ${formatPrice(item.price)}</span>
            </div>
            <div>${formatPrice(itemTotal)}</div>
        `;
        summaryList.appendChild(itemEl);
    });

    summaryTotal.textContent = formatPrice(total);
    summaryItemCount.textContent = `${itemCount} item${itemCount === 1 ? '' : 's'}`;
    placeOrderBtn.disabled = false;
    placeOrderBtn.style.opacity = '1';
}

function clearCart() {
    localStorage.removeItem(STORAGE_KEY);
}

async function handleOrderSubmit(event) {
    event.preventDefault();
    const cart = loadCartData();
    if (!Object.keys(cart).length) {
        alert('Your cart is empty. Add items from the shop first.');
        return;
    }

    if (!checkoutForm.reportValidity() || !paymentForm.reportValidity()) {
        return;
    }

    const payload = {
        shipping: {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            address: document.getElementById('address').value.trim(),
            city: document.getElementById('city').value.trim(),
            postal: document.getElementById('postal').value.trim(),
            state: document.getElementById('state').value.trim(),
            country: document.getElementById('country').value.trim()
        },
        payment: {
            cardName: document.getElementById('cardName').value.trim(),
            cardNumber: document.getElementById('cardNumber').value.trim(),
            expiry: document.getElementById('expiry').value.trim(),
            cvv: document.getElementById('cvv').value.trim()
        },
        cart
    };

    try {
        const response = await fetch('../order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
            alert(result.message || 'Unable to place order.');
            return;
        }

        const orderLabel = result.orderId ? ` Order #${result.orderId}` : '';
        alert(`Thank you, ${payload.shipping.fullName}! Your order has been placed successfully.${orderLabel}`);
        clearCart();
        renderOrderSummary({});
    } catch (error) {
        console.error(error);
        alert('Unable to submit order. Please try again later.');
    }
}

function init() {
    const cart = loadCartData();
    renderOrderSummary(cart);
    placeOrderBtn.addEventListener('click', handleOrderSubmit);
}

init();
