import { Navigate, useLocation } from "react-router-dom";
import { isSuperAdminUser } from "../../auth/authUtils";

export default function AdminRoute({ children }) {
    const location = useLocation();
    const token = localStorage.getItem("access");
    const isSuperAdmin = isSuperAdminUser({
        is_superuser: localStorage.getItem("is_superuser"),
        role: localStorage.getItem("role"),
    });
    if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
    if (!isSuperAdmin) return <Navigate to="/unauthorized" replace />;
    return children;
}
