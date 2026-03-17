// Simple client-side auth (no Firebase Auth)
// Roles: editor (khaosat) / viewer (xem)

const AUTH_USERS = {
    khaosat: { password: "Vnpt@2026", role: "editor", displayName: "Khảo sát" },
    xem: { password: "Vnpt!1468", role: "viewer", displayName: "Xem" }
};

const AUTH_KEYS = {
    user: "AUTH_USER",
    role: "AUTH_ROLE",
    at: "AUTH_AT"
};

function authGet() {
    const user = sessionStorage.getItem(AUTH_KEYS.user);
    const role = sessionStorage.getItem(AUTH_KEYS.role);
    const at = sessionStorage.getItem(AUTH_KEYS.at);
    if (!user || !role) return null;
    return { user, role, at };
}

function authLogin(username, password) {
    const u = (username || "").trim();
    const p = password || "";
    const record = AUTH_USERS[u];
    if (!record || record.password !== p) return { ok: false, message: "Sai tài khoản hoặc mật khẩu." };

    sessionStorage.setItem(AUTH_KEYS.user, u);
    sessionStorage.setItem(AUTH_KEYS.role, record.role);
    sessionStorage.setItem(AUTH_KEYS.at, String(Date.now()));
    return { ok: true, role: record.role, user: u };
}

function authLogout() {
    sessionStorage.removeItem(AUTH_KEYS.user);
    sessionStorage.removeItem(AUTH_KEYS.role);
    sessionStorage.removeItem(AUTH_KEYS.at);
    sessionStorage.removeItem("EDIT_PASS_OK"); // legacy
    window.location.href = "login.html";
}

function requireAuth(options = {}) {
    const auth = authGet();
    const { allowRoles = null, redirectTo = "login.html" } = options;

    if (!auth) {
        window.location.href = redirectTo;
        return null;
    }
    if (Array.isArray(allowRoles) && allowRoles.length > 0 && !allowRoles.includes(auth.role)) {
        window.location.href = "list.html";
        return null;
    }
    return auth;
}

