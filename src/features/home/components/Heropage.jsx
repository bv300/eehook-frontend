import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../Heropage.css";
import { getImageUrl } from "../../../utils/imageUrl";

import Hero_Query from "../queries/Hero_Query";

const Heropage = () => {

  const { data: rawHeroSlides } = Hero_Query();
  const heroSlides = Array.isArray(rawHeroSlides) ? rawHeroSlides : [];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto Slide
  useEffect(() => {

    if (heroSlides.length === 0) return;

    const timer = setInterval(() => {

      setCurrentSlide((prev) =>
        prev === heroSlides.length - 1 ? 0 : prev + 1
      );

    }, 5000);

    return () => clearInterval(timer);

  }, [heroSlides.length]);

  if (heroSlides.length === 0) {
    return null;
  }

  return (
    <section className="hero">

      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide ${
            currentSlide === index ? "active" : ""
          }`}
        >

          <img
            src={getImageUrl(slide.image)}
            alt={slide.title}
            className="hero-image"
          />

          <div className="hero-overlay"></div>

          <div className="hero-content">

            <span className="hero-subtitle">
              {slide.subtitle}
            </span>

            <h1>
              {slide.title}
            </h1>

            <p>
              {slide.description}
            </p>

            <Link
              to="/shop"
              className="shop-btn-premium"
            >
              {slide.button_text} <span className="arrow">→</span>
            </Link>

          </div>

        </div>
      ))}

      <div className="hero-dots">

        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`modern-dot ${
              currentSlide === index ? "active-modern-dot" : ""
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          >
          </button>
        ))}

      </div>

    </section>
  );
};

export default Heropage;
