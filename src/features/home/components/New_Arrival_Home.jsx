import React from "react";
import "../styles/New_Arrival_Home.css";
import Newarrival_Query from "../../newArrivals/queries/Newarrival_Query";
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUrl";
import Product_Query from "../../sale/queries/Product_Query";

import { useEffect, useState } from "react";

const New_Arrival_Home = ({ products = [] }) => {

    const navigate = useNavigate();

    const {
        data: rawData,
        isLoading: isNewArrivalsLoading,
        error: newArrivalsError,
    } = Newarrival_Query();
    const data = Array.isArray(rawData) ? rawData : [];

    // Fetch shop products to pad the second row
    const { data: rawShopData, isLoading: isShopLoading } = Product_Query({});
    const shopData = Array.isArray(rawShopData) ? rawShopData : (rawShopData?.results || []);

    const isLoading = isNewArrivalsLoading || isShopLoading;
    const error = newArrivalsError;

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
            <div className="new-arrivals-wrapper">
                <section className="new-arrivals">
                    <div className="heading-container">
                        <div className="heading-text">
                            <h2>New Arrivals</h2>
                            <p className="heading-sub">
                                The latest curated collection for the modern lifestyle.
                            </p>
                        </div>
                        <div className="view-all-link skeleton" style={{ width: '80px', height: '24px', padding: 0 }}></div>
                    </div>
                    <div className="grid-container">
                        <div className="new-arrivals-grid">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div key={i} className="new-product-card">
                                    <div className="image-container skeleton"></div>
                                    <div className="product-details" style={{ marginTop: '15px' }}>
                                        <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                                        <div className="skeleton skeleton-text" style={{ width: '80%', height: '18px' }}></div>
                                        <div className="skeleton skeleton-text" style={{ width: '30%', marginTop: '8px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
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
                            The latest curated collection for the modern lifestyle.
                        </p>

                    </div>

                </div>

                <div className="grid-container">
                    <div className="new-arrivals-grid">
                        {
                            (() => {
                                // Filter out any items that are already in the new arrivals
                                const newArrivalIds = data.map(item => item.id);
                                const extraShopItems = shopData.filter(item => !newArrivalIds.includes(item.id));

                                // Merge data and extra items up to 16 total
                                const displayData = [...data, ...extraShopItems].slice(0, 16);

                                return displayData.map((item) => {
                                    const startingPrice = item.starting_price;
                                    const discountedPrice = item.discounted_price;
                                    const hasOffer = item.has_offer;
                                    const discountPercentage = item.discount_percentage;

                                    return (
                                        <div key={item.id} className="new-product-card">
                                            <div className="image-container" onClick={() => navigate(`/single/${item.id}`)}>
                                                <img
                                                    src={getImageUrl(item.variants[0]?.images[0]?.image)}
                                                    alt={item.name}
                                                    className="product-img"
                                                />
                                                {hasOffer && (
                                                    <span className="badge-offer">
                                                        {discountPercentage}% OFF
                                                    </span>
                                                )}
                                                {item.is_active && (
                                                    <span className="badge-new">
                                                        NEW
                                                    </span>
                                                )}
                                                {item.hasWishlist && (
                                                    <button className="wishlist-btn">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="heart-icon">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button className="quick-add-btn">
                                                    View Product
                                                </button>
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
                                                        {hasOffer ? (
                                                            <>
                                                                <span className="old-price">
                                                                    AED{Number(startingPrice).toFixed(2)}
                                                                </span>
                                                                <span className="product-price">
                                                                    AED{Number(discountedPrice).toFixed(2)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="product-price">
                                                                AED{Number(startingPrice).toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                });
                            })()
                        }
                    </div>
                </div>

                <div className="view-all-bottom-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                    <Link to="/shop?sort=new" className="view-all-btn">
                        VIEW ALL
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="view-all-arrow">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                </div>

            </section>

        </div>

    );

};

export default New_Arrival_Home;
