import React from 'react'
import "./../Footer.css";

// import eehook from './../assets/eehook.jpeg'
import visa from './../assets/visa-payment.png'
import master from './../assets/master-payment.png'
import amc from './../assets/american-exp-payment.png'
import footerlogo from './../assets/footer-logo.png'
import apple from './../assets/apple-payment.png'
import { useNavigate } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, } from "react-icons/fa";
function Footer() {
    const navigate = useNavigate();

    const WhatsappOpen = () => {

        const text = "Hello";

        const phone = "971501234567";

        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

        window.open(whatsappUrl, "_blank");
    }


    return (
        <div>

            <footer className="footer">

                <div className="footer-container">

                    <div className="footer-column brand">
                        <img src={footerlogo} alt="Logo" className="footer-logo" />

                        <p>
                            Your ultimate destination for<br />
                            Electronics, Lifestyle & more.
                        </p>

                        <div className="social-icons">
                            <a href="#"> <FaInstagram /> </a>
                            <a href="#"><FaFacebookF /></a>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h3>Quick Links</h3>

                        <ul>
                            <li onClick={() => navigate("/")} >Home</li>
                            <li onClick={() => navigate("/shop")}>Shop</li>
                            <li onClick={() => navigate("/shop")}>Categories</li>
                            <li onClick={() => navigate("/shop?offer=true")} >Offers</li>
                            <li onClick={() => navigate("/about")}>About Us</li>
                            <li onClick={() => navigate("/contact")}>Contact Us</li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h3>Customer Care</h3>

                        <ul>
                            <li onClick={() => navigate("profile")}>My Account</li>
                            <li onClick={() => navigate("myorders")}>Track Order</li>
                            <li onClick={() => navigate("myorders")}>Shipping & Delivery</li>

                        </ul>
                    </div>

                    <div className="footer-column">
                        <h3>Contact Us</h3>

                        <ul className="contact">
                            <li  onClick={WhatsappOpen}  style={{ cursor: "pointer" }} >
                                <FaPhoneAlt />
                                +971 50 123 4567
                            </li>

                            <li>
                                <FaEnvelope />  <a href="mailto:info@eehook.com">info@eehook.com</a>
                            </li>

                            <li>
                                <FaMapMarkerAlt /> Dubai, United Arab Emirates
                            </li>
                        </ul>
                    </div>

                    <div className="footer-column payment">
                        <h3>We Accept</h3>

                        <div className="payment-icons">
                            <img src={visa} alt="payments" />
                            <img src={master} alt="" />
                            <img src={amc} alt="" />
                            <img src={apple} alt="" />
                        </div>
                    </div>

                </div>

            </footer>

            <div className="copyright">
                © 2026 eehook. All Rights Reserved.
            </div>

        </div>
    )
}

export default Footer

