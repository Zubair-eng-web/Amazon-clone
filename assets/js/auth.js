document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.querySelector('.login-link');
    const signupLink = document.querySelector('.signup-link');

    if (loginLink) {
        loginLink.addEventListener('click', event => {
            event.preventDefault();
            openLogin();
        });
    }

    if (signupLink) {
        signupLink.addEventListener('click', event => {
            event.preventDefault();
            openSignup();
        });
    }
});

function openLogin() {
    showAuthModal('Login', 'Enter your credentials to sign in.', [
        { label: 'Email or Username', type: 'text', name: 'email', placeholder: 'you@example.com' },
        { label: 'Password', type: 'password', name: 'password', placeholder: '••••••••' }
    ], 'Login');
}

function openSignup() {
    showAuthModal('Sign Up', 'Create a new account to checkout faster.', [
        { label: 'Full Name', type: 'text', name: 'name', placeholder: 'Your Name' },
        { label: 'Email', type: 'email', name: 'email', placeholder: 'you@example.com' },
        { label: 'Password', type: 'password', name: 'password', placeholder: '••••••••' }
    ], 'Create Account');
}

function showAuthModal(title, description, fields, actionText) {
    if (document.querySelector('.auth-modal-overlay')) {
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'auth-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'auth-modal';

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'auth-close';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', closeAuthModal);

    const heading = document.createElement('h2');
    heading.textContent = title;

    const copy = document.createElement('p');
    copy.textContent = description;

    const form = document.createElement('form');
    form.className = 'auth-form';
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const data = new FormData(form);
        const submission = Object.fromEntries(data.entries());
        const action = title === 'Login' ? 'login' : 'signup';
        const url = `auth.php?action=${action}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submission)
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                alert(result.message || 'Unable to submit form.');
                return;
            }

            alert(result.message);
            closeAuthModal();
        } catch (error) {
            console.error(error);
            alert('Unable to reach the server. Please try again later.');
        }
    });

    fields.forEach(field => {
        const fieldWrapper = document.createElement('label');
        fieldWrapper.className = 'auth-field';
        fieldWrapper.textContent = field.label;

        const input = document.createElement('input');
        input.type = field.type;
        input.name = field.name;
        input.placeholder = field.placeholder;
        input.required = true;

        fieldWrapper.appendChild(input);
        form.appendChild(fieldWrapper);
    });

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'auth-submit';
    submitButton.textContent = actionText;

    form.appendChild(submitButton);
    modal.append(closeButton, heading, copy, form);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function closeAuthModal() {
    const overlay = document.querySelector('.auth-modal-overlay');
    if (overlay) {
        overlay.remove();
    }
}
