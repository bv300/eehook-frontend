import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Forgotpassword.css";

function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);
        setMessage("");
        setErrorMessage("");

        try {

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/forgot-password/`, {
                email,
            });

            setMessage(response.data.message || "If the account exists, a password reset link has been sent to your email.");
            setEmail("");

        } catch (error) {

            setErrorMessage(error.response?.data?.error || error.response?.data?.message || "Unable to send the password reset email. Please try again.");

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

                    {message && <p className="password-reset-success" role="status">{message}</p>}
                    {errorMessage && <p className="password-reset-error" role="alert">{errorMessage}</p>}

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
