export function isSuperAdminUser(user = {}) {
    const role = String(user.role || user.user_role || user.user_type || user.role_name || "").trim().toLowerCase().replace(/[_-]/g, " ");
    const explicitFlag = user.is_superuser ?? user.is_super_admin ?? user.isSuperAdmin ?? user.super_admin;
    return role === "super admin" || role === "superadmin" || explicitFlag === true || explicitFlag === 1 || explicitFlag === "1" || String(explicitFlag).toLowerCase() === "true";
}

export function saveAuthUser(user = {}) {
    localStorage.setItem("email", user.email || "");
    localStorage.setItem("first_name", user.first_name || "");
    localStorage.setItem("is_staff", String(Boolean(user.is_staff)));
    localStorage.setItem("is_superuser", String(isSuperAdminUser(user)));
    if (user.role || user.user_role || user.user_type || user.role_name) localStorage.setItem("role", user.role || user.user_role || user.user_type || user.role_name);
}
