import "../styles/New_Arrival_Home.css";
import Newarrival_Query from "../../newArrivals/queries/Newarrival_Query";
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUrl";
import Product_Query from "../../sale/queries/Product_Query";
import WishlistQuery from "../../wishlist/queries/WishlistQuery";
import { Wishlist_delete, Wishlist_post } from "../../wishlist/api/Wishlisht_Api";
import showToast from "../../../utils/toast";
import { FaHeart, FaRegHeart } from "react-icons/fa";

import { useEffect, useState } from "react";

const New_Arrival_Home = () => {

    const navigate = useNavigate();

    const {
        data: rawData,
        isLoading: isNewArrivalsLoading,
        error: newArrivalsError,
    } = Newarrival_Query();
    const data = rawData?.results || [];

    // Fetch shop products to pad the second row
    const { data: rawShopData, isLoading: isShopLoading } = Product_Query({});
    const shopData = rawShopData?.results || [];

    const isLoading = isNewArrivalsLoading || isShopLoading;
    const error = newArrivalsError;
    const { data: rawWishlist = [], refetch: refetchWishlist } = WishlistQuery();
    const wishlist = Array.isArray(rawWishlist) ? rawWishlist : rawWishlist?.results || [];

    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                setShowLoader(false);
            }, 700); // 700ms loader

            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    const addToWishlist = async (product, event) => {
        event.stopPropagation();

        if (!(localStorage.getItem("access_token") || localStorage.getItem("access"))) {
            showToast.info("Please login to continue");
            navigate("/login");
            return;
        }

        const variant = product.variants?.[0];
        const size = variant?.price_type === "single" ? null : variant?.sizes?.[0] || variant?.units?.[0];
        if (!variant || (variant.price_type !== "single" && !size)) {
            showToast.error("Variant not available");
            return;
        }

        const wishlistItem = wishlist.find((item) =>
            String(item.variant) === String(variant.id) &&
            String(item.variant_size ?? "") === String(size?.id ?? "")
        );

        try {
            if (wishlistItem) {
                await Wishlist_delete(wishlistItem.id);
                showToast.success("Product removed from wishlist");
            } else {
                await Wishlist_post({ variant: variant.id, variant_size: size?.id ?? null });
                showToast.success("Product added to wishlist");
            }
            await refetchWishlist();
        } catch (requestError) {
            showToast.error(requestError?.response?.data?.detail || "Could not update wishlist");
        }
    };

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
                                    const firstVariant = item.variants?.[0];
                                    const firstSize = firstVariant?.price_type === "single" ? null : firstVariant?.sizes?.[0] || firstVariant?.units?.[0];
                                    const isWishlisted = wishlist.some((wishlistItem) =>
                                        String(wishlistItem.variant) === String(firstVariant?.id) &&
                                        String(wishlistItem.variant_size ?? "") === String(firstSize?.id ?? "")
                                    );

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
                                                <button
                                                    type="button"
                                                    className={`wishlist-btn ${isWishlisted ? "is-wishlisted" : ""}`}
                                                    onClick={(event) => addToWishlist(item, event)}
                                                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                                >
                                                    {isWishlisted ? <FaHeart className="heart-icon" /> : <FaRegHeart className="heart-icon" />}
                                                </button>
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
