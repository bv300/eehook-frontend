import React, { useEffect, useRef } from "react";
import '../styles/About.css';


import heroImg from "../../../assets/heroimage-21.jpeg";
import background from "../../../assets/background.png"
import Founder from "../../../assets/founder.jpg";
import nano from "../../../assets/nanoGoogle.jpg"

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
        title: "Curated Elegance",
        text: "At Amora, we thoughtfully select each piece from trusted sellers, bringing together timeless designs, refined details, and modern elegance to create a distinctive boutique experience."
    },
    {
        title: "Authenticity",
        text: "We bring you carefully selected collections from trusted sellers, celebrating unique styles, quality materials, and the stories behind every piece."
    },
    {
        title: "Timeless Style",
        text: "Beyond passing trends, Amora curates pieces that reflect effortless elegance and lasting beauty for every occasion."
    },
    {
        title: "Thoughtful Selection",
        text: "We are committed to offering meaningful choices by partnering with sellers who value quality, responsible practices, and exceptional design."
    }
];


    return (
        <div className="about-container">

            <section className="about-hero about-fade" ref={addToRefs}>
                <div className="about-hero-content">
                    <span className="about-tag">ABOUT US</span>
                    <h1 className="about-title">
                        Crafting Timeless Luxury,
                        Inspired by Heritage.
                    </h1>
                    <p className="about-description">
                        At Amora, every creation tells a story of artistry, tradition and refined elegance. Our commitment to exceptional craftsmanship transforms the finest materials into timeless pieces designed to be treasured for generations.
                    </p>
                    <div className="about-button-group">
                        <button  onClick={()=>navigate('/shop')}  className="about-primary-btn">Explore Collection</button>
                        {/* <button className="about-secondary-btn">Our Story</button> */}
                    </div>
                </div>

                <div className="about-hero-image-wrapper">
                    <img src={heroImg} alt="Amora Heritage" className="about-hero-image" />
                    <div className="about-floating-card">
                        <h4>Timeless Elegance Since 2024</h4>
                        <p>Crafting premium ethnic wear with modern sophistication.</p>
                    </div>
                </div>
            </section>

            <section className="about-story about-fade" ref={addToRefs}>
                <div className="about-story-image">
                    <img src={nano} alt="Heritage" />
                </div>

                <div className="about-story-content">
                    <span className="about-section-label">OUR HERITAGE</span>
                    <h2>Tradition Woven Into Every Detail</h2>
                    <p>
                        Rooted in tradition and refined through generations, Amora represents timeless craftsmanship where every creation carries a story of elegance and dedication.

                        From handcrafted details to exceptional fabrics, every Amora creation celebrates individuality and elegance.                    </p>

                    {/* <div className="about-stats">
                        <div className="about-stat-card">
                            <h3>50+</h3>
                            <p>Years of Heritage</p>
                        </div>

                        <div className="about-stat-card">
                            <h3>120+</h3>
                            <p>Master Artisans</p>
                        </div>

                        <div className="about-stat-card">
                            <h3>10K+</h3>
                            <p>Happy Clients</p>
                        </div>

                        <div className="about-stat-card">
                            <h3>30+</h3>
                            <p>Countries Served</p>
                        </div>
                    </div> */}
                </div>
            </section>

            <section className="about-pillars-section">

                <div className="about-pillars-sticky">

                    <div className="about-pillars-header">
                        <span className="about-section-label">OUR VALUES</span>
                        <h2>Pillars of Amora</h2>
                        <p>
                            Our philosophy is built upon four enduring principles that define every collection we create.
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
                    <img src={Founder} alt="Founder" />
                </div>

                <div className="about-founder-content">
                    <span className="about-section-label">FOUNDER'S NOTE</span>

                    <h2>A Legacy Built With Passion</h2>

                    <p>
                        What began as a small family vision has evolved into a brand admired for timeless elegance and uncompromising quality. Every collection continues to reflect our dedication to exceptional craftsmanship.
                    </p>

                    <p>
                        Luxury is not created overnight—it is shaped through patience, precision and passion. That belief remains at the heart of everything we do.
                    </p>

                    <h4>— Anitta, Amora</h4>
                </div>
            </section>

            <section className="about-quality about-fade" ref={addToRefs}>

                <div className="about-quality-left">
                    <span className="about-section-label">
                        OUR COMMITMENT
                    </span>

                    <h2>
                        Uncompromising Quality In Every Creation
                    </h2>
                </div>

                <div className="about-quality-right">

                    <div className="about-quality-item">
                        <h3>Premium Materials</h3>
                        <p>
                            Only carefully selected fabrics and materials become part of every Amora masterpiece.
                        </p>
                    </div>

                    <div className="about-quality-item">
                        <h3>Master Craftsmanship</h3>
                        <p>
                            Every product is handcrafted by experienced artisans with remarkable attention to detail.
                        </p>
                    </div>

                    <div className="about-quality-item">
                        <h3>Timeless Design</h3>
                        <p>
                            Our collections transcend seasonal trends to remain elegant for years to come.
                        </p>
                    </div>

                    <div className="about-quality-item">
                        <h3>Responsible Luxury</h3>
                        <p>
                            We embrace ethical sourcing and sustainable practices while preserving traditional craftsmanship.
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
                            Experience The World Of Amora
                        </h2>

                        <p>
                            Discover timeless collections created for those who appreciate authentic craftsmanship and refined luxury.
                        </p>

                        <div className="about-button-group">
                            <button
                            onClick={()=>navigate('/shop')} 
                            className="about-primary-btn">
                                Shop Collection
                            </button>


                        </div>

                    </div>

                </div>

            </section>

        </div>
    );
};

export default About;