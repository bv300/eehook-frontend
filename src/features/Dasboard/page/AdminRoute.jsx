import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {

    const token = localStorage.getItem("access");
    const isStaff = localStorage.getItem("is_staff");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (isStaff !== "true") {
        return <Navigate to="/" replace />;
    }

    return children;
}
   
export default AdminRoute;