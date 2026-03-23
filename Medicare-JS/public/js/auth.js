document.addEventListener('DOMContentLoaded', () => {
    // Check if session exists
    fetch('/api/session')
        .then(res => res.json())
        .then(data => {
            if (data.true || data.success) {
                window.location.href = 'dashboard.html';
            }
        });

    const loginCard = document.getElementById('loginCard');
    const registerCard = document.getElementById('registerCard');

    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.style.display = 'none';
        registerCard.style.display = 'block';
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        registerCard.style.display = 'none';
        loginCard.style.display = 'block';
    });

    // Login logic
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUser').value;
        const password = document.getElementById('loginPass').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await res.json();
            if (result.success) {
                window.location.href = 'dashboard.html';
            } else {
                alert(result.message || 'Login failed');
            }
        } catch(err) {
            console.error(err);
            alert('Server error.');
        }
    });

    // Register logic
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUser').value;
        const password = document.getElementById('regPass').value;

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await res.json();
            if (result.success) {
                alert('Registration successful! Please login.');
                document.getElementById('showLogin').click();
            } else {
                alert(result.message || 'Registration failed');
            }
        } catch(err) {
            console.error(err);
            alert('Server error.');
        }
    });
});
