import React from "react";
import "../styles/New_Arrival_Home.css";
import Newarrival_Query from "../../newArrivals/queries/Newarrival_Query";
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUrl";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useEffect, useState } from "react";

import "swiper/css";
import "swiper/css/navigation";

const New_Arrival_Home = ({ products = [] }) => {

    const navigate = useNavigate();

    const {
        data = [],
        isLoading,
        error,
    } = Newarrival_Query();

    const [showLoader, setShowLoader] = useState(true);

useEffect(() => {
    if (!isLoading) {
        const timer = setTimeout(() => {
            setShowLoader(false);
        }, 700); // 700ms loader

        return () => clearTimeout(timer);
    }
}, [isLoading]);

if (isLoading || showLoader) {
    return (
        <div className="loading-container">
            <div className="loader"></div>
        </div>
    );
}

if (error) {
    return <p className="error-text">
            Failed to load products.
        </p>
}
    return (

        <div className="new-arrivals-wrapper">

            <section className="new-arrivals">

                {/* Header */}

                <div className="heading-container">

                    <div className="heading-text">

                        <h2>
                            New Arrivals
                        </h2>

                        <p className="heading-sub">
                            The latest curated collection for the modern woman.
                        </p>

                    </div>

                    <Link
                        to="/shop?sort=new"
                        className="view-all-link"
                    >

                        VIEW ALL

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="arrow-icon"
                        >

                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m8.25 4.5 7.5 7.5-7.5 7.5"
                            />

                        </svg>

                    </Link>

                </div>
                <div className="carousel-container">

                    <Swiper

                        modules={[Navigation, Autoplay]}

                        navigation

                        loop={true}

                        grabCursor={true}

                        spaceBetween={20}

                        autoplay={{

                            delay: 2500,

                            disableOnInteraction: false,

                            pauseOnMouseEnter: true,

                        }}

                        breakpoints={{
                            320: {
                                slidesPerView: 1,
                                centeredSlides: true,
                            },
                            576: {
                                slidesPerView: 2,
                                centeredSlides: false,
                            },
                            768: {
                                slidesPerView: 2.5,
                            },
                            992: {
                                slidesPerView: 3,
                            },
                            1200: {
                                slidesPerView: 4,
                            }
                        }}

                    >

                        {

                            data.map((item) => {

                                const startingPrice =
                                    item.starting_price;

                                const discountedPrice =
                                    item.discounted_price;

                                const hasOffer =
                                    item.has_offer;

                                const discountPercentage =
                                    item.discount_percentage;

                                return (

                                    <SwiperSlide
                                        key={item.id}
                                    >
                                        <div
                                            className="new-product-card"
                                        >

                                            <div
                                                className="image-container"
                                                onClick={() =>
                                                    navigate(`/single/${item.id}`)
                                                }
                                            >

                                                <img
                                                    src={getImageUrl(item.variants[0]?.images[0]?.image)}
                                                    alt={item.name}
                                                    className="product-img"
                                                />

                                                {

                                                    hasOffer && (

                                                        <span className="badge-offer">

                                                            {discountPercentage}% OFF

                                                        </span>

                                                    )

                                                }

                                                {

                                                    item.is_active && (

                                                        <span className="badge-new">

                                                            NEW

                                                        </span>

                                                    )

                                                }

                                                {

                                                    item.hasWishlist && (

                                                        <button className="wishlist-btn">

                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth="1.5"
                                                                stroke="currentColor"
                                                                className="heart-icon"
                                                            >

                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                                                                />

                                                            </svg>

                                                        </button>

                                                    )

                                                }

                                                <button className="quick-add-btn">

                                                    View Product

                                                </button>

                                            </div>
                                        </div>

                                        <div className="product-details">

                                            <span className="product-tag">

                                                {item.name || "EXCLUSIVE"}

                                            </span>

                                            <h3 className="newHome-product-title">

                                                {item.description}

                                            </h3>

                                            <div className="product-meta">

                                                <div className="price-area">

                                                    {

                                                        hasOffer ? (

                                                            <>

                                                                <span className="old-price">

                                                                    NZD $
                                                                    {Number(startingPrice).toFixed(2)}

                                                                </span>

                                                                <span className="product-price">

                                                                    NZD $
                                                                    {Number(discountedPrice).toFixed(2)}

                                                                </span>

                                                            </>

                                                        ) : (

                                                            <span className="product-price">

                                                                NZD $
                                                                {Number(startingPrice).toFixed(2)}

                                                            </span>

                                                        )

                                                    }

                                                </div>

                                            </div>

                                        </div>

                                    </SwiperSlide>

                                );

                            })

                        }

                    </Swiper>

                </div>

            </section>

        </div>

    );

};

export default New_Arrival_Home;