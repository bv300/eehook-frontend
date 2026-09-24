import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";
import client from "../../../lib/ApiClient";
import "./Login.css";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const response = await client.post("login/", formData);

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            console.log(localStorage.getItem("access"))
            console.log(localStorage.getItem("refresh"))
            localStorage.setItem("email", response.data.user.email);
            localStorage.setItem("first_name", response.data.user.first_name);
            localStorage.setItem("is_staff", response.data.user.is_staff);

            if (response.data.user.is_staff) {

                navigate("/orderDashboard");
                

            } else {

                navigate("/");

            }

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                error.response?.data?.error ||
                "Invalid Email or Password"
            );

        } finally {

            setLoading(false);

        }

    };

    const handleGoogleSuccess = async (credentialResponse) => {

        try {

            const response = await client.post("google-login/", {
                token: credentialResponse.credential
            });

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);

            localStorage.setItem("email", response.data.user.email);
            localStorage.setItem("first_name", response.data.user.first_name);
            localStorage.setItem("is_staff", response.data.user.is_staff);

            if (response.data.user.is_staff) {

                navigate("/OrderDashboard");

            } else {

                navigate("/");

            }

        } catch (error) {

            alert(
                error.response?.data?.error ||
                "Google Login Failed"
            );

        }

    };

    const handleGoogleError = () => {

        alert("Google Login Failed");

    };

        return (

        <div className="login-container">

            <div className="login-wrapper">

                <div className="login-box">

                    <div className="auth-header">

                        <h1>Welcome Back</h1>

                        <p>Login to your Amora account to continue shopping.</p>

                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="input-group">

                            <label>Email Address</label>

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="input-group">

                            <label>Password</label>

                            <div className="password-group">

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <span
                                    className="password-icon"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >

                                    {showPassword ? (
                                        <FiEyeOff />
                                    ) : (
                                        <FiEye />
                                    )}

                                </span>

                            </div>

                        </div>

                        <div className="login-options">

                            

                            <Link
                                to="/forgot-password"
                                className="forgot-link"
                            >

                                Forgot Password?

                            </Link>

                        </div>

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={loading}
                        >

                            {loading ? "Signing In..." : "Login"}

                        </button>

                        <div className="divider">

                            <span>OR</span>

                        </div>

                        <div className="google-section">

                            <div className="google-btn">

                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    theme="outline"
                                    text="continue_with"
                                    shape="pill"
                                    size="large"
                                    
                                />

                            </div>

                        </div>

                        <div className="signup-link">

                            <span>Don't have an account? </span>

                            <Link to="/signup">

                                Create Account

                            </Link>

                        </div>

                    </form>

                </div>

            </div>

        </div>
                        

    );

}

export default Login;