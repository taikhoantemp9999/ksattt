document.addEventListener('DOMContentLoaded', () => {
    // If already logged in -> go list
    const existing = authGet();
    if (existing) {
        window.location.href = 'list.html';
        return;
    }

    const form = document.getElementById('loginForm');
    const btn = document.getElementById('btnLogin');
    const err = document.getElementById('loginError');
    const username = document.getElementById('username');
    const password = document.getElementById('password');

    const showError = (msg) => {
        if (!err) return;
        err.style.display = 'block';
        err.innerText = msg;
    };

    const clearError = () => {
        if (!err) return;
        err.style.display = 'none';
        err.innerText = '';
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearError();
        btn.disabled = true;

        const res = authLogin(username.value, password.value);
        if (!res.ok) {
            showError(res.message || 'Đăng nhập thất bại.');
            btn.disabled = false;
            return;
        }

        window.location.href = 'list.html';
    });
});

