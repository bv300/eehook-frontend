import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import "./ResetPassword.css";

function ResetPassword() {

    const navigate = useNavigate();
    const { uidb64, token } = useParams();

    const [form, setForm] = useState({
        password: "",
        confirm_password: ""
    });

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const response = await axios.post(

                `${import.meta.env.VITE_API_URL}/reset-password/${uidb64}/${token}/`,
                form

            );

            alert(response.data.message);

            navigate("/login");

        } catch (error) {

            alert(

                error.response?.data?.message ||
                error.response?.data?.non_field_errors?.[0] ||
                "Something went wrong"

            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="forgot-container">

            <div className="forgot-box">

                <div className="auth-header">

                    <h1>Reset Password</h1>

                    <p>
                        Create a strong new password to secure your Amora account.
                    </p>

                </div>

                <form onSubmit={handleSubmit}>

                    <div className="password-group">

                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="New Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />

                        <span
                            className="password-icon"
                            id="pa-icon"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                        >
                            {
                                showPassword
                                    ? <FaEyeSlash />
                                    : <FaEye />
                            }
                        </span>

                    </div>

                    <div className="password-group">

                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirm_password"
                            placeholder="Confirm Password"
                            value={form.confirm_password}
                            onChange={handleChange}
                            required
                        />

                        <span
                            className="password-icon"
                            id="pa-icon"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                        >
                            {
                                showConfirmPassword
                                    ? <FaEyeSlash />
                                    : <FaEye />
                            }
                        </span>

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {
                            loading
                                ? "Updating..."
                                : "Reset Password"
                        }
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

export default ResetPassword;