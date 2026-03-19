// Simple client-side auth (via Firebase mapping)
// Roles: admin (quản trị) / editor (khảo sát) / viewer (chỉ xem)

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

function authSet(username, role) {
    sessionStorage.setItem(AUTH_KEYS.user, username);
    sessionStorage.setItem(AUTH_KEYS.role, role);
    sessionStorage.setItem(AUTH_KEYS.at, String(Date.now()));
    return { ok: true, role: role, user: username };
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

