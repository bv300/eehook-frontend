export function isSuperAdminUser(user = {}) {
    const role = String(user.role || user.user_role || user.user_type || user.role_name || "").trim().toLowerCase().replace(/[_-]/g, " ");
    return role === "super admin" || role === "superadmin";
}

export function isPrivilegedUser(user = {}) {
    const role = String(user.role || user.user_role || user.user_type || user.role_name || "").trim().toLowerCase().replace(/[_-]/g, " ");
    return isSuperAdminUser(user) || role.includes("admin") || role === "staff" || user.is_staff === true || user.is_superuser === true;
}

export function saveAuthUser(user = {}) {
    localStorage.setItem("email", user.email || "");
    localStorage.setItem("first_name", user.first_name || "");
    localStorage.setItem("is_staff", String(Boolean(user.is_staff)));
    localStorage.setItem("is_superuser", String(isSuperAdminUser(user)));
    if (user.role || user.user_role || user.user_type || user.role_name) localStorage.setItem("role", user.role || user.user_role || user.user_type || user.role_name);
}

export function saveAuthSession(data = {}) {
    const user = data.user || data;
    localStorage.setItem("access", data.access || "");
    localStorage.setItem("refresh", data.refresh || "");
    localStorage.setItem("access_token", data.access || "");
    localStorage.setItem("refresh_token", data.refresh || "");
    localStorage.setItem("admin_user", JSON.stringify(user));
    saveAuthUser(user);
    return user;
}

export function clearAuthSession() {
    ["access", "refresh", "access_token", "refresh_token", "admin_user", "email", "first_name", "is_staff", "is_superuser", "role"].forEach((key) => localStorage.removeItem(key));
}
