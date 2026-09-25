import React, { useEffect, useRef } from "react";
import '../styles/About.css';


import teaHavenImg from "../../../assets/tea-haven-poster.jpg";
import background from "../../../assets/about-image-one.jpg";
// import Founder from "../../../assets/founder.jpg";
import imagetwo from "../../../assets/about-image-two.jpg";

import { useNavigate } from "react-router-dom";

const About = () => {
    const navigate = useNavigate()
    const sectionRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("about-visible");
                    }
                });
            },
            { threshold: 0.15 }
        );

        sectionRefs.current.forEach((section) => {
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    const addToRefs = (el) => {
        if (el && !sectionRefs.current.includes(el)) {
            sectionRefs.current.push(el);
        }
    };

    const pillars = [
        {
            title: "Cutting-Edge Technology",
            text: "At eehook, we bring you the latest in electronics, from powerful laptops and smartphones to innovative wearables and gaming gear."
        },
        {
            title: "Premium Lifestyle",
            text: "Elevate your everyday life with our curated selection of cosmetics, perfumes, and lifestyle accessories designed for modern living."
        },
        {
            title: "Unmatched Variety",
            text: "Whether you're looking for the newest Apple products or engaging toys for kids, our diverse catalog has something for everyone."
        },
        {
            title: "Customer First",
            text: "We are committed to providing a seamless shopping experience with top-tier products, secure payments, and excellent customer service."
        }
    ];


    return (
        <div className="about-container">

            <section className="about-hero about-fade" ref={addToRefs}>
                <div className="about-hero-content">
                    <span className="about-tag">ABOUT US</span>
                    <h1 className="about-title">
                        Your Ultimate Destination for Tech & Lifestyle.
                    </h1>
                    <p className="about-description">
                        At eehook, we bridge the gap between innovation and everyday life. From the latest electronics to premium cosmetics, we bring you high-quality products that match your dynamic lifestyle.
                    </p>
                    <div className="about-button-group">
                        <button onClick={() => navigate('/shop')} className="about-primary-btn">Explore Collection</button>
                    </div>
                </div>

                <div className="about-hero-image-wrapper">
                    <img src={background} alt="WhatsApp Channel" className="about-hero-image" />
                    <div className="about-floating-card">
                        <h4>Innovation Meets Style</h4>
                        <p>Delivering top-tier electronics and lifestyle products.</p>
                    </div>
                </div>
            </section>

            <section className="about-story about-fade" ref={addToRefs}>
                <div className="about-story-image">
                    <img src={teaHavenImg} alt="Tea Haven Grand Opening" />
                </div>

                <div className="about-story-content">
                    <span className="about-section-label">OUR VISION</span>
                    <h2>Empowering Your Modern Life</h2>
                    <p>
                        Rooted in a passion for technology and lifestyle, eehook was created to be the one-stop shop for modern consumers. We carefully select every product, from the newest smartwatches to the finest perfumes, ensuring you always get the best.
                    </p>
                    <p>
                        Our goal is to make premium electronics and lifestyle products accessible to everyone, combining quality, variety, and convenience in one platform.
                    </p>
                </div>
            </section>

            <section className="about-pillars-section">

                <div className="about-pillars-sticky">

                    <div className="about-pillars-header">
                        <span className="about-section-label">OUR VALUES</span>
                        <h2>Pillars of eehook</h2>
                        <p>
                            Our philosophy is built upon four enduring principles that guide our product selection and customer service.
                        </p>
                    </div>

                    <div className="about-pillars-grid">
                        {pillars.map((pillar, index) => (
                            <div className="about-pillar-card" key={index}>
                                <div className="about-pillar-number">
                                    0{index + 1}
                                </div>
                                <h3>{pillar.title}</h3>
                                <p>{pillar.text}</p>
                            </div>
                        ))}
                    </div>

                </div>

            </section>

            <section className="about-founder about-fade" ref={addToRefs}>
                <div className="about-founder-image">
                    <img src={imagetwo} alt="Founder" />
                </div>

                <div className="about-founder-content">
                    <span className="about-section-label">FOUNDER'S NOTE</span>

                    <h2>A Commitment to Excellence</h2>

                    <p>
                        What started as a vision to simplify shopping for high-quality electronics and lifestyle goods has evolved into a trusted platform for thousands of customers.
                    </p>

                    <p>
                        We believe that technology and lifestyle go hand in hand. That’s why we continuously strive to offer a catalog that not only meets your needs but exceeds your expectations.
                    </p>

                    <h4>— The eehook Team</h4>
                </div>
            </section>

            <section className="about-quality about-fade" ref={addToRefs}>

                <div className="about-quality-left">
                    <span className="about-section-label">
                        OUR COMMITMENT
                    </span>

                    <h2>
                        Uncompromising Quality In Every Category
                    </h2>
                </div>

                <div className="about-quality-right">

                    <div className="about-quality-item">
                        <h3>Authentic Products</h3>
                        <p>
                            We guarantee the authenticity of every product, sourcing directly from trusted brands and manufacturers.
                        </p>
                    </div>

                    <div className="about-quality-item">
                        <h3>Latest Innovations</h3>
                        <p>
                            Stay ahead of the curve with our frequently updated inventory of the newest gadgets and tech releases.
                        </p>
                    </div>

                    <div className="about-quality-item">
                        <h3>Diverse Selection</h3>
                        <p>
                            From high-end laptops and gaming gear to cosmetics and toys, we offer a wide range of products.
                        </p>
                    </div>

                    <div className="about-quality-item">
                        <h3>Customer Satisfaction</h3>
                        <p>
                            Your shopping experience is our top priority, supported by easy returns and dedicated customer support.
                        </p>
                    </div>

                </div>

            </section>

            <section
                className="about-cta about-fade"
                ref={addToRefs}
                style={{ backgroundImage: `url(${background})` }}
            >

                <div className="about-cta-overlay">

                    <div className="about-cta-card">

                        <span className="about-section-label">
                            BEGIN YOUR JOURNEY
                        </span>

                        <h2>
                            Experience The World Of eehook
                        </h2>

                        <p>
                            Discover our extensive collections created for those who appreciate quality, innovation, and style.
                        </p>

                        <div className="about-button-group">
                            <button
                                onClick={() => navigate('/shop')}
                                className="about-primary-btn">
                                Shop Now
                            </button>
                        </div>

                    </div>

                </div>

            </section>

        </div>
    );
};

export default About;
