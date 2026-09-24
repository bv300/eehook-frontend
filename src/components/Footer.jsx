import React from 'react'
import "./../Footer.css";

import amora from './../assets/footer-logo.png'
import visa from './../assets/visa-payment.png'
import master from './../assets/master-payment.png'
import amc from './../assets/american-exp-payment.png'
import apple from './../assets/apple-payment.png'
import { useNavigate } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, } from "react-icons/fa";
function Footer() {
    const navigate = useNavigate();

    const WhatsappOpen = () => {

        const text = "Hello";

        const phone = "64225493376";

        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

        window.open(whatsappUrl, "_blank");
    }


    return (
        <div>

            <footer className="footer">

                <div className="footer-container">

                    <div className="footer-column brand">
                        <img src={amora} alt="Logo" className="footer-logo" />

                        <p>
                            Rooted in tradition,<br />
                            styled for today
                        </p>

                        <div className="social-icons">
                            <a href="https://www.instagram.com/amorabyanitta?igsh=a21iNWs3YXpxcG05"> <FaInstagram /> </a>
                            <a href=""><FaFacebookF /></a>
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
                                +64 22 549 3376
{/* <a href="tel:+64 22 549 3376">+64 22 549 3376</a> */}
                            </li>

                            <li>
                                <FaEnvelope />  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=amorabyanitta@gmail.com" target="_blank">amorabyanitta@gmail.com</a>
                            </li>

                            <li>
                                <FaMapMarkerAlt /> Wellington, New Zealand
                            </li>

                            <li>& Kerala, India</li>
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
                © 2026 Amora by Anitta. All Rights Reserved.
            </div>

        </div>
    )
}

export default Footer
