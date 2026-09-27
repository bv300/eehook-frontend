import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../Heropage.css";
import { getImageUrl } from "../../../utils/imageUrl";

import Hero_Query from "../queries/Hero_Query";
import PromoBanners_Query from "../queries/PromoBanners_Query";
import HeroSideBanner_Query from "../queries/HeroSideBanner_Query";

const Heropage = () => {

  const { data: rawHeroSlides } = Hero_Query();
  const heroSlides = Array.isArray(rawHeroSlides) ? rawHeroSlides : [];

  const { data: rawPromoBanners } = PromoBanners_Query();
  const promoBanners = Array.isArray(rawPromoBanners) ? rawPromoBanners : [];

  const { data: heroSideBanner } = HeroSideBanner_Query();

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

  // Top Promo Carousel Logic
  const [currentPromo, setCurrentPromo] = useState(0);

  useEffect(() => {
    if (promoBanners.length === 0) return;

    const promoTimer = setInterval(() => {
      setCurrentPromo((prev) => (prev === promoBanners.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(promoTimer);
  }, [promoBanners.length]);

  const nextPromo = () => setCurrentPromo((prev) => (prev === promoBanners.length - 1 ? 0 : prev + 1));
  const prevPromo = () => setCurrentPromo((prev) => (prev === 0 ? promoBanners.length - 1 : prev - 1));

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  if (heroSlides.length === 0) {
    return null;
  }

  return (
    <div className="hero-page-wrapper">
      
      {/* Top Promo Carousel (Visa Banner Equivalent) */}
      <div className="top-promo-carousel">
        <button className="promo-nav-btn left" onClick={prevPromo}>‹</button>
        
        <div className="promo-slides">
          {promoBanners.map((promo, index) => (
            <div 
              key={promo.id} 
              className={`promo-slide ${currentPromo === index ? "active" : ""}`}
            >
              {promo.link ? (
                <a href={promo.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
                  <img 
                    src={getImageUrl(promo.image)} 
                    alt="Promo Banner" 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                </a>
              ) : (
                <img 
                  src={getImageUrl(promo.image)} 
                  alt="Promo Banner" 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
              )}
            </div>
          ))}
        </div>

        <button className="promo-nav-btn right" onClick={nextPromo}>›</button>
      </div>

      <section className="hero-split-layout">
        
        {/* Main Carousel (Left) */}
        <div className="hero-carousel-section">
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
          
          {/* Navigation Arrows */}
          <button className="carousel-nav-btn prev-btn" onClick={prevSlide}>
            ‹
          </button>
          <button className="carousel-nav-btn next-btn" onClick={nextSlide}>
            ›
          </button>

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
        </div>

        {/* Fixed Side Banner (Right) */}
        <div className="hero-fixed-banner-section">
          <div className="fixed-banner-content">
             {heroSideBanner?.link ? (
               <a href={heroSideBanner.link} target="_blank" rel="noopener noreferrer">
                 <img src={getImageUrl(heroSideBanner.image)} alt="Promotional Banner" className="fixed-banner-image" />
               </a>
             ) : (
               <img src={getImageUrl(heroSideBanner?.image)} alt="Promotional Banner" className="fixed-banner-image" />
             )}
          </div>
        </div>

      </section>
    </div>
  );
};

export default Heropage;
