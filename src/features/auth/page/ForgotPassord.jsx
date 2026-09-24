import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Forgotpassword.css";

function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            await axios.post(`${import.meta.env.VITE_API_URL}/forgot-password/`, {
                email,
            });

            alert("Password reset link has been sent to your email.");

            setEmail("");

        } catch (error) {

            alert(
                error.response?.data?.error ||
                "Something went wrong."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="forgot-container">

            <div className="forgot-box">

                <div className="auth-header">

                    <h1>Forgot Password?</h1>

                    <p>
                        Don't worry! It happens. Enter your registered email
                        address and we'll send you a password reset link.
                    </p>

                </div>

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button type="submit">

                        {loading ? "Sending..." : "Send Reset Link"}

                    </button>

                </form>

                <Link
                    to="/login"
                    className="back-login"
                >
                    Back to Login
                </Link>

            </div>

        </div>

    );

}

export default ForgotPassword;