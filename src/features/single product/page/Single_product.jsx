import React, { useEffect, useState } from "react";
import "../style/Single_product.css";
import {
    NavLink,
    useSearchParams,
    useParams,
    useNavigate
} from "react-router-dom";
import { AiOutlineDoubleRight, AiOutlineEye, AiOutlineCheckCircle, AiOutlineLock, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import GetSingle_product_Query from "../queries/GetSingle_product_Query";
import Cart_query from "../../cart/queries/Cart_query";
import { addToCart_Post } from "../api/AddToCart_Api";

import WishlistQuery from "../../wishlist/queries/WishlistQuery";
import {
    Wishlist_post,
    Wishlist_delete
} from "../../wishlist/api/Wishlisht_Api";
import showToast from "../../../utils/toast";
import { getImageUrl } from "../../../utils/imageUrl";
import defaultImage from "../../../assets/image_not_available.png";

function getDescriptionText(value) {
    if (Array.isArray(value)) return value.filter(Boolean).join("\n").trim();
    return value === null || value === undefined ? "" : String(value).trim();
}

function getKeyFeatures(value) {
    if (Array.isArray(value)) {
        return value
            .flatMap((feature) => {
                if (feature && typeof feature === "object") return feature.name || feature.title || feature.description || "";
                return feature;
            })
            .map((feature) => String(feature || "").trim())
            .filter(Boolean);
    }

    if (value === null || value === undefined) return [];

    const text = String(value).trim();
    if (!text) return [];

    try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return getKeyFeatures(parsed);
    } catch {
        // The backend normally returns one feature per line, so plain text is handled below.
    }

    return text
        .split(/\r?\n|[•●▪◦]/)
        .map((feature) => feature.replace(/^\s*[-*]\s*/, "").trim())
        .filter(Boolean);
}

function Single_product() {

    const navigate = useNavigate();

    const { id } = useParams();

    const [searchParams] = useSearchParams();

    const variantId = Number(
        searchParams.get("variant")
    );

    const sizeId = Number(
        searchParams.get("size")
    );

    const {
        data = {},
        isLoading,
        error
    } = GetSingle_product_Query(id);

    const descriptionText = getDescriptionText(data.description);
    const keyFeatures = getKeyFeatures(data.key_features);

    const [selectedColor, setSelectedColor] = useState(null);

    const [selectedSize, setSelectedSize] = useState(null);

    const [activeImage, setActiveImage] = useState(null);

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [modalImageIndex, setModalImageIndex] = useState(0);

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState("");

    const handleApplyCoupon = async () => {
        setCouponError("");
        if (!couponCode) {
            setCouponError("Please enter a coupon code");
            return;
        }

        const token = localStorage.getItem("access");
        if (!token) {
            showToast.info("Please login to apply a coupon.");
            navigate("/login");
            return;
        }
        
        try {
            const response = await fetch("http://127.0.0.1:8000/validate-coupon/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    code: couponCode,
                    product_id: data.id,
                }),
            });
            const resData = await response.json();
            
            if (response.ok) {
                setAppliedCoupon(resData);
                showToast.success(resData.message || "Coupon applied successfully!");
            } else {
                setCouponError(resData.message || "Failed to apply coupon");
            }
        } catch (err) {
            setCouponError("An error occurred while validating coupon");
        }
    };

    const {
        data: cart = [],
        refetch: refetchCart
    } = Cart_query();

    /*
        GET UNIQUE COLORS
    */

    const colors = [
        ...new Map(
            (data?.variants || [])
                .filter(
                    variant => variant.color
                )
                .map(
                    variant => [
                        variant.color.id,
                        variant.color
                    ]
                )
        ).values()
    ];

    /*
        SELECTED VARIANT
    */

    const selectedVariant =
        data?.variants?.find(
            variant =>
                variant.color?.id === selectedColor?.id
        ) ||
        data?.variants?.[0];

    useEffect(() => {

        if (!data?.variants?.length) return;

        // User came from Cart

        if (variantId) {
            const variant = data.variants.find(
                v => v.id === variantId
            );

            if (variant) {
                setSelectedColor(
                    variant.color
                );

                const size =
                    variant.sizes?.find(
                        s => s.id === sizeId
                    ) ||
                    variant.sizes?.[0];

                setSelectedSize(
                    size ? (size.unit || size.size) : null
                );

                const image = variant.images.find(img => img.is_primary) || variant.images[0];

                setActiveImage(
                    image?.image
                );
                return;
            }
        }

        // Default

        const firstVariant =
            data.variants[0];

        setSelectedColor(
            firstVariant.color
        );

        setSelectedSize(
            null
        );

        const image = firstVariant.images.find(img => img.is_primary) || firstVariant.images[0];

        setActiveImage(
            image?.image || null
        );

    }, [
        data,
        variantId,
        sizeId
    ]);

    const availableSizes =
        selectedVariant?.sizes || [];

    const selectedSizeVariant =
        selectedVariant?.sizes?.find(
            item =>
                (item.unit?.id === selectedSize?.id) || (item.size?.id === selectedSize?.id)
        );

    const displayImages =
        selectedVariant?.images || [];

    const cartItem = cart?.items?.find(item => 
        item.variant === selectedVariant?.id && 
        (selectedVariant?.price_type === 'single' || item.variant_size === selectedSizeVariant?.id)
    );
    const cartQuantity = cartItem ? cartItem.quantity : 0;

    const availableStock = selectedVariant?.price_type === 'single'
        ? (selectedVariant?.stock || 0) - cartQuantity
        : (selectedSizeVariant?.stock || 0) - cartQuantity;

    const addTocart = async () => {

        const token = localStorage.getItem("access");

        if (!token) {
            showToast.info("Please login to continue");
            navigate("/login");
            return;
        }



        if (colors.length > 0 && !selectedColor) {
            showToast.warning("Please select a color");
            return;
        }

        if (selectedVariant?.price_type === 'multiple') {
            if (!selectedSize) {
                showToast.warning("Please select a size/unit");
                return;
            }
            if (!selectedSizeVariant) {
                showToast.warning("This combination is not available");
                return;
            }
            if (availableStock <= 0) {
                showToast.info("Out of stock");
                return;
            }
        } else {
            if (availableStock <= 0) {
                showToast.info("Out of stock");
                return;
            }
        }

        const cartPayload = {
            variant: selectedVariant.id,
            variant_size: selectedVariant?.price_type === 'single' ? (selectedVariant?.sizes?.[0]?.id || null) : selectedSizeVariant?.id,
            quantity: 1
        };

        try {
            await addToCart_Post(
                cartPayload
            );
            await refetchCart();
            showToast.success(
                "Product added to cart"
            );
        } catch (error) {
            console.log(error);
            if (error.response?.status === 401) {
                showToast.info(
                    "Please login to continue"
                );
                navigate("/login");
            }
        }
    };

    /*
        ADD TO WISHLIST
    */

    const {
        data: rawWishdata,
        refetch: refetchWishlist
    } = WishlistQuery();
    const wishdata = Array.isArray(rawWishdata) ? rawWishdata : [];

    const addToWishlist = async () => {

        const token = localStorage.getItem("access");

        if (!token) {
            showToast.info("Please login to continue");
            navigate("/login");
            return;
        }



        if (!selectedVariant) {
            showToast.warning("Please select a variant");
            return;
        }

        if (colors.length > 0 && !selectedColor) {
            showToast.warning("Please select a color");
            return;
        }

        try {
            const wishlistVariantSize = selectedVariant?.price_type === 'multiple' ? selectedSizeVariant?.id ?? null : null;
            const wishlistItem = wishdata.find(
                item =>
                    item.variant === selectedVariant.id &&
                    (item.variant_size ?? null) === wishlistVariantSize
            );

            if (wishlistItem) {
                await Wishlist_delete(
                    wishlistItem.id
                );
                await refetchWishlist();
                showToast.success(
                    "Product removed from wishlist"
                );
                return;
            }

            await Wishlist_post({
                variant: selectedVariant.id,
                variant_size: wishlistVariantSize
            });

            await refetchWishlist();

            showToast.success(
                "Product added to wishlist"
            );
        } catch (error) {
            console.log(error);
            if (error.response?.status === 401) {
                showToast.info(
                    "Please login to continue"
                );
                navigate("/login");
            }
        }
    };

    if (isLoading) return "Loading...";
    if (error) return "Something went wrong";

    const isWishlisted = wishdata.some(
        item =>
            item.variant === selectedVariant?.id &&
            (selectedVariant?.price_type === 'single' || item.variant_size === selectedSizeVariant?.id)
    );

    return (
        <div className="single-product-main">
            <div className="single-product-toshop">
                <div className="toshop">
                    <NavLink to="/shop">Shop</NavLink>
                    <AiOutlineDoubleRight />
                </div>
            </div>

            <div className="single-product">

                {/* LEFT: IMAGE GALLERY */}
                <div className="gallery-section">
                    <div className="main-image-wrapper">
                        <div className="main-image" style={{ cursor: 'pointer' }}>
                            <button className="wishlist-icon" onClick={(e) => { e.stopPropagation(); addToWishlist(); }}>
                                {isWishlisted ? <FaHeart color="#fd0707ff" /> : <FaRegHeart color="#4B636D" />}
                            </button>
                            <img
                                onClick={() => {
                                    const index = displayImages.findIndex(img => img.image === activeImage);
                                    setModalImageIndex(index >= 0 ? index : 0);
                                    setIsImageModalOpen(true);
                                }}
                                src={
                                    activeImage
                                        ? getImageUrl(activeImage)
                                        : (selectedVariant?.images?.find(img => img.is_primary)?.image || selectedVariant?.images?.[0]?.image)
                                            ? getImageUrl(selectedVariant.images.find(img => img.is_primary)?.image || selectedVariant.images[0].image)
                                            : defaultImage
                                }
                                alt={data.name}
                            />
                        </div>
                        <p className="zoom-text">Click image to view in full screen</p>
                    </div>

                    {data.current_viewers_count != null && (
                        <div className="viewers-count-badge">
                            <div className="eye-wrapper">
                                <AiOutlineEye size={18} color="#007185" />
                                <span><strong style={{ color: "#007185" }}>{data.current_viewers_count} person{data.current_viewers_count > 1 ? "s" : ""}</strong> is watching this product now.</span>
                            </div>
                            <span className="close-badge-btn">×</span>
                        </div>
                    )}

                    <div className="thumbs-carousel-wrapper">
                        <button className="thumb-arrow left-arrow"><AiOutlineLeft size={16} /></button>
                        <div className="thumbs">
                            {displayImages.map((img) => (
                                <img
                                    key={img.id}
                                    src={getImageUrl(img.image)}
                                    alt={data.name}
                                    className={
                                        activeImage === img.image
                                            ? "active-thumb"
                                            : ""
                                    }
                                    onClick={() => setActiveImage(img.image)}
                                />
                            ))}
                        </div>
                        <button className="thumb-arrow right-arrow"><AiOutlineRight size={16} /></button>

                    </div>
                </div>

                {/* CENTER: PRODUCT INFORMATION */}
                <div className="info-section">
                    <h1>{data.name}</h1>

                    {colors.length > 0 && <div className="option-block color-selection-block">
                        <h4>Color: <span className="selected-option-label" style={{ fontWeight: 'bold', color: '#111' }}>{selectedColor?.name || "Select color"}</span></h4>
                        <div className="colors image-colors">
                            {colors.map((color) => {
                                const variant = data.variants.find(item => item.color?.id === color.id);
                                const img = variant?.images?.find(i => i.is_primary)?.image || variant?.images?.[0]?.image;

                                return (
                                    <button
                                        key={color.id}
                                        className={selectedColor?.id === color.id ? "color-img-btn active-color-img" : "color-img-btn"}
                                        title={color.name}
                                        onClick={() => {
                                            const variant = data.variants.find(item => item.color?.id === color.id);
                                            setSelectedColor(color);
                                            setSelectedSize(null);
                                            const image = variant?.images?.find(img => img.is_primary) || variant?.images?.[0];
                                            setActiveImage(image?.image || null);
                                        }}
                                    >
                                        {img ? <img src={getImageUrl(img)} alt={color.name} /> : <div className="fallback-color" style={{ background: color.code }} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>}

                    {selectedVariant?.price_type === 'multiple' && availableSizes?.some(item => item.unit || item.size) && (
                        <div className="option-block">
                            <h4>{availableSizes?.[0]?.unit_type?.name || availableSizes?.[0]?.size?.unit_type || selectedSize?.unit_type || "Variant Option"}: <span className="selected-option-label">{selectedSize?.name}</span></h4>
                            <div className="sizes">
                                {availableSizes.map((item) => {
                                    const unitObj = item.unit || item.size;
                                    return unitObj && (
                                        <button
                                            key={item.id}
                                            className={selectedSize?.id === unitObj.id ? "size-btn active-size" : "size-btn"}
                                            onClick={() => setSelectedSize(unitObj)}
                                        >
                                            {unitObj.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="product-price-section" style={{ margin: '20px 0', padding: '15px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>Price:</div>
                        {(() => {
                            let itemPriceInfo = selectedVariant?.price_type === 'single'
                                ? selectedVariant
                                : (selectedSizeVariant || availableSizes?.[0]);

                            if (!itemPriceInfo) return null;

                            let currentPrice = Number(itemPriceInfo.discounted_price || itemPriceInfo.price || 0);
                            let originalPrice = Number(itemPriceInfo.price || 0);
                            let finalPrice = currentPrice;

                            if (appliedCoupon) {
                                finalPrice = currentPrice * (1 - appliedCoupon.discount_percentage / 100);
                            }

                            return (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '28px', fontWeight: '800', color: '#B12704' }}>
                                            AED {finalPrice.toFixed(2)}
                                        </span>
                                        {originalPrice > finalPrice && (
                                            <>
                                                <span style={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '16px', color: '#565959', textDecoration: 'line-through' }}>
                                                    AED {originalPrice.toFixed(2)}
                                                </span>
                                                <span style={{ background: '#CC0C39', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                                    Save AED {(originalPrice - finalPrice).toFixed(2)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    {appliedCoupon && (
                                        <div style={{ color: 'green', fontSize: '14px', marginTop: '5px', fontWeight: 'bold' }}>
                                            Coupon applied: {appliedCoupon.discount_percentage}% OFF!
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    <div className="coupon-section" style={{ margin: '10px 0 20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Apply Discount Coupon:</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                value={couponCode} 
                                onChange={(e) => setCouponCode(e.target.value)} 
                                placeholder="Enter Coupon Code" 
                                style={{ flex: 1, padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }} 
                            />
                            <button 
                                onClick={handleApplyCoupon} 
                                style={{ padding: '8px 16px', backgroundColor: '#4B636D', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Apply Coupon
                            </button>
                        </div>
                        {couponError && <div style={{ color: 'red', fontSize: '13px', marginTop: '8px' }}>{couponError}</div>}
                    </div>

                    {(descriptionText || keyFeatures.length > 0) && (
                        <div className="product-content-details" aria-label="Product details">
                            {descriptionText && (
                                <section className="product-content-section" aria-labelledby="product-description-heading">
                                    <h2 id="product-description-heading">Description</h2>
                                    <p className="description">{descriptionText}</p>
                                </section>
                            )}

                            {keyFeatures.length > 0 && (
                                <section className="product-content-section key-features" aria-labelledby="product-features-heading">
                                    <h2 id="product-features-heading">Key features</h2>
                                    <ul className="key-features-list">
                                        {keyFeatures.map((feature, idx) => <li key={`${feature}-${idx}`}>{feature}</li>)}
                                    </ul>
                                </section>
                            )}
                        </div>
                    )}

                    {data?.promotional_banner_image && (
                        <div className="product-description-banner">
                            {data?.promotional_banner_link ? (
                                <a href={data.promotional_banner_link} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                                    <img 
                                        src={getImageUrl(data.promotional_banner_image)} 
                                        alt="Promotion" 
                                    />
                                </a>
                            ) : (
                                <img 
                                    src={getImageUrl(data.promotional_banner_image)} 
                                    alt="Promotion" 
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT: PURCHASE PANEL */}
                <div className="purchase-panel eehook-purchase-panel">

                    <div className="delivery-time-section">
                        <div className="shipping-fee">+ AED {data.shipping_fee || "13.00"} Shipping</div>
                        <div className="delivery-date">Delivery <strong>{data.estimated_delivery_time || "09 Sep - 10 Sep"}</strong></div>
                    </div>

                    <div className="price-right-section" style={{ marginBottom: '15px' }}>
                        <span className="price-value">AED {Number(selectedVariant?.price_type === 'single' ? (selectedVariant?.discounted_price || selectedVariant?.price || 0) : ((selectedSizeVariant || availableSizes?.[0])?.discounted_price || (selectedSizeVariant || availableSizes?.[0])?.price || 0)).toFixed(2)}</span>
                    </div>

                    <div className="stock-status">
                        {selectedVariant?.price_type === 'single' ? (
                            (availableStock <= 0 ? (
                                <span className="stock-out" style={{ fontSize: '14px', color: '#b12704' }}>Out of Stock</span>
                            ) : (
                                <span className="stock" style={{ fontSize: '14px', color: '#007600' }}>In Stock : {availableStock}</span>
                            ))
                        ) : (!selectedSizeVariant ? (
                            <span className="stock" style={{ fontSize: '14px', color: '#555' }}>Please select options to view stock</span>
                        ) : availableStock <= 0 ? (
                            <span className="stock-out" style={{ fontSize: '14px', color: '#b12704' }}>Out of Stock</span>
                        ) : (
                            <span className="stock" style={{ fontSize: '14px', color: '#007600' }}>In Stock : {availableStock}</span>
                        ))}
                    </div>

                    <div className="sigle_product_cart-buy">
                        <button className="add-to-cart-amazon-btn" onClick={addTocart}>ADD TO CART</button>
                    </div>

                    <div className="sold-by">
                        Sold by <a href="#">{data.seller_name || "ALAREESH MPT"}</a>
                    </div>

                    {data.warranty_info && (
                        <>
                            <hr className="divider" />
                            <div className="warranty-section">
                                <AiOutlineCheckCircle size={20} color="#555" />
                                <span>{data.warranty_info}</span>
                            </div>
                            <hr className="divider" />
                        </>
                    )}

                    <div className="secure-transaction">
                        <AiOutlineLock size={20} color="#555" />
                        <span>Secure Transaction</span>
                    </div>
                </div>

            </div>

            {/* PROMOTIONAL BANNER AT BOTTOM */}
            {data.promotional_banner_url && (
                <div className="promotional-banner">
                    {data.promotional_banner_link ? (
                        <a className="promotional-banner-link" href={data.promotional_banner_link} target="_blank" rel="noopener noreferrer">
                            <img src={data.promotional_banner_url} alt="Promotion" />
                        </a>
                    ) : (
                        <img src={data.promotional_banner_url} alt="Promotion" />
                    )}
                </div>
            )}

            {isImageModalOpen && (
                <div className="image-popup-modal" role="dialog" aria-modal="true">
                    <button type="button" className="image-popup-close" onClick={() => setIsImageModalOpen(false)} aria-label="Close image preview">&times;</button>
                    <div className="image-popup-stage">
                    
                    {displayImages.length > 1 && (
                        <button type="button" className="image-popup-arrow image-popup-arrow-left" onClick={() => setModalImageIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1))} aria-label="Previous image">&#10094;</button>
                    )}

                    <img src={getImageUrl(displayImages[modalImageIndex]?.image)} alt="Product preview" />

                    {displayImages.length > 1 && (
                        <button type="button" className="image-popup-arrow image-popup-arrow-right" onClick={() => setModalImageIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0))} aria-label="Next image">&#10095;</button>
                    )}
                    </div>
                </div>
            )}

        </div>
    );
}

export default Single_product;
