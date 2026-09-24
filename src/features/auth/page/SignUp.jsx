import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";
import client from "../../../lib/ApiClient";
import "./SignUp.css";

function Signup() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: "",
        email: "",
        password: "",
        confirm_password: ""
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            alert("Passwords do not match");
            return;
        }

        setLoading(true);

        try {

            const response = await client.post("register/", formData);

            alert(
                response.data.message ||
                "Registration Successful"
            );

            navigate("/login");

        } catch (error) {

            if (error.response?.data) {

                alert(JSON.stringify(error.response.data));

            } else {

                alert("Registration Failed");

            }

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
                "Google Signup Failed"
            );

        }

    };

    const handleGoogleError = () => {

        alert("Google Signup Failed");

    };
    return (

        <div className="signup-container">

            <div className="signup-wrapper">

                <div className="signup-box">

                    <div className="auth-header">

                        <h1>Create Account</h1>

                        <p>Create your Amora account and start shopping.</p>

                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="input-group">

                            <label>Full Name</label>

                            <input
                                type="text"
                                name="first_name"
                                placeholder="Enter your full name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />

                        </div>

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
                                    onClick={() => setShowPassword(!showPassword)}
                                >

                                    {showPassword ? <FiEyeOff /> : <FiEye />}

                                </span>

                            </div>

                        </div>

                        <div className="input-group">

                            <label>Confirm Password</label>

                            <div className="password-group">

                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirm_password"
                                    placeholder="Confirm your password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    required
                                />

                                <span
                                    className="password-icon"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >

                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}

                                </span>

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="signup-btn"
                            disabled={loading}
                        >

                            {loading ? "Creating Account..." : "Sign Up"}

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
                                    width="280"
                                />

                            </div>

                        </div>

                    </form>

                    <div className="signup-link">

                        <span>Already have an account? </span>

                        <Link to="/login">

                            Login

                        </Link>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Signup;