import { Navigate, useLocation } from "react-router-dom";
import { isSuperAdminUser } from "../../auth/authUtils";

export default function AdminRoute({ children }) {
    const location = useLocation();
    const token = localStorage.getItem("access_token") || localStorage.getItem("access");
    let adminUser;
    try { adminUser = JSON.parse(localStorage.getItem("admin_user") || "{}"); } catch { adminUser = {}; }
    const isSuperAdmin = isSuperAdminUser({
        ...adminUser,
        is_superuser: adminUser.is_superuser ?? localStorage.getItem("is_superuser"),
        role: adminUser.role || localStorage.getItem("role"),
    });
    if (!token) return <Navigate to="/eehook-dashboard/admin-login" state={{ from: location }} replace />;
    if (!isSuperAdmin) return <Navigate to="/eehook-dashboard/admin-login" state={{ from: location, accessDenied: true }} replace />;
    return children;
}
