import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../../lib/ApiClient";
import { isSuperAdminUser, saveAuthSession, clearAuthSession } from "../authUtils";
import "./Login.css";

export default function AdminLogin() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const submit = async (event) => {
        event.preventDefault(); setLoading(true); setError("");
        try {
            const response = await client.post("login/", form);
            const user = saveAuthSession(response.data);
            if (!isSuperAdminUser(user)) { clearAuthSession(); setError("Super Admin access required."); return; }
            navigate("/order-dashboard", { replace: true });
        } catch (requestError) {
            setError(requestError.response?.data?.detail || requestError.response?.data?.error || "Invalid admin email or password.");
        } finally { setLoading(false); }
    };
    return <div className="login-container"><div className="login-wrapper"><div className="login-box"><div className="auth-header"><h1>Super Admin Login</h1><p>Sign in to manage the eehook dashboard.</p></div><form onSubmit={submit}><div className="input-group"><label>Email Address</label><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></div><div className="input-group"><label>Password</label><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></div>{error && <p className="admin-login-error">{error}</p>}<button type="submit" className="login-btn" disabled={loading}>{loading ? "Signing In..." : "Login"}</button></form></div></div></div>;
}
