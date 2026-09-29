import React, { useEffect, useState } from "react";
import "../style/Single_product.css";
import {
    NavLink,
    useSearchParams,
    useParams,
    useNavigate
} from "react-router-dom";
import { AiOutlineDoubleRight, AiOutlineEye, AiOutlineCheckCircle, AiOutlineLock, AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { BsBoxSeam } from "react-icons/bs";
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

    const [selectedColor, setSelectedColor] = useState(null);

    const [selectedSize, setSelectedSize] = useState(null);

    const [activeImage, setActiveImage] = useState(null);

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState("");

    const handleApplyCoupon = async () => {
        setCouponError("");
        if (!couponCode) {
            setCouponError("Please enter a coupon code");
            return;
        }
        
        try {
            const token = localStorage.getItem("access");
            const response = await fetch("http://127.0.0.1:8000/validate-coupon/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
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

                const image =
                    variant.images.find(
                        img => img.is_primary
                    ) ||
                    variant.images[0];

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

        const image =
            firstVariant.images.find(
                img => img.is_primary
            ) ||
            firstVariant.images[0];

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
            if (selectedSizeVariant.stock <= 0) {
                showToast.info("Out of stock");
                return;
            }
        } else {
            const singleStock = selectedVariant?.sizes?.[0]?.stock || 0;
            if (singleStock <= 0) {
                showToast.info("Out of stock");
                return;
            }
        }

        const cartPayload = {
            variant: selectedVariant.id,
            variant_size: selectedVariant?.price_type === 'single' ? null : selectedSizeVariant?.id,
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

        if (selectedVariant?.price_type === 'multiple') {
            if (!selectedSizeVariant || !selectedSize) {
                showToast.warning("Please select a size/unit");
                return;
            }
        }

        try {
            const wishlistItem = wishdata.find(
                item =>
                    item.variant === selectedVariant.id &&
                    (selectedVariant?.price_type === 'single' || item.variant_size === selectedSizeVariant?.id)
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
                variant_size: selectedVariant?.price_type === 'single' ? null : selectedSizeVariant?.id
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
                        <div className="main-image">
                            <button className="wishlist-icon" onClick={addToWishlist}>
                                {isWishlisted ? <FaHeart color="#fd0707ff" /> : <FaRegHeart color="#4B636D" />}
                            </button>
                            <img
                                src={
                                    activeImage
                                        ? getImageUrl(activeImage)
                                        : getImageUrl(selectedVariant?.images?.find(
                                            img => img.is_primary
                                        )?.image)
                                }
                                alt={data.name}
                            />
                        </div>
                        <p className="zoom-text">Roll over image to zoom in</p>
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

                    <div className="option-block color-selection-block">
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
                    </div>

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

                    <p className="description">{data.description}</p>

                    {data?.key_features && data.key_features.length > 0 && (
                        <div className="key-features" style={{ margin: "15px 0", color: "#444", fontSize: "14px" }}>
                            <ul style={{ paddingLeft: "20px" }}>
                                {data.key_features.map((feature, idx) => (
                                    <li key={idx} style={{ marginBottom: "6px" }}>{feature}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {data?.promotional_banner_image && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                            {data?.promotional_banner_link ? (
                                <a href={data.promotional_banner_link} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                                    <img 
                                        src={getImageUrl(data.promotional_banner_image)} 
                                        alt="Promotion" 
                                        style={{ width: '100%', maxWidth: '500px', height: 'auto', borderRadius: '8px', objectFit: 'contain' }} 
                                    />
                                </a>
                            ) : (
                                <img 
                                    src={getImageUrl(data.promotional_banner_image)} 
                                    alt="Promotion" 
                                    style={{ width: '100%', maxWidth: '500px', height: 'auto', borderRadius: '8px', objectFit: 'contain' }} 
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT: PURCHASE PANEL */}
                <div className="purchase-panel eehook-purchase-panel">

                    {data.emi_available && (
                        <div className="emi-block-right">
                            <div className="emi-icon-wrapper">
                                <BsBoxSeam size={20} color="#c47a16" />
                            </div>
                            <div className="emi-details-wrapper">
                                <div className="emi-top-row">
                                    <span style={{ fontWeight: 600, color: '#111' }}>Easy Payment Plans</span>
                                    <a href="#" className="details-link">Details &gt;</a>
                                </div>
                                <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                                    Starting from AED {data.emi_starting_price}/month
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="delivery-time-section">
                        <div className="shipping-fee">+ AED {data.shipping_fee || "13.00"} Shipping</div>
                        <div className="delivery-date">Delivery <strong>{data.estimated_delivery_time || "09 Sep - 10 Sep"}</strong></div>
                    </div>

                    <div className="price-right-section" style={{ marginBottom: '15px' }}>
                        <span className="price-value">AED {Number(selectedVariant?.price_type === 'single' ? (selectedVariant?.discounted_price || selectedVariant?.price || 0) : ((selectedSizeVariant || availableSizes?.[0])?.discounted_price || (selectedSizeVariant || availableSizes?.[0])?.price || 0)).toFixed(2)}</span>
                    </div>

                    <div className="stock-status">
                        {selectedVariant?.price_type === 'single' ? (
                            (selectedVariant?.stock <= 0 ? (
                                <span className="stock-out" style={{ fontSize: '14px', color: '#b12704' }}>Out of Stock</span>
                            ) : (
                                <span className="stock" style={{ fontSize: '14px', color: '#007600' }}>In Stock : {selectedVariant?.stock || 0}</span>
                            ))
                        ) : (!selectedSizeVariant ? (
                            <span className="stock" style={{ fontSize: '14px', color: '#555' }}>Please select options to view stock</span>
                        ) : selectedSizeVariant?.stock <= 0 ? (
                            <span className="stock-out" style={{ fontSize: '14px', color: '#b12704' }}>Out of Stock</span>
                        ) : (
                            <span className="stock" style={{ fontSize: '14px', color: '#007600' }}>In Stock : {selectedSizeVariant?.stock}</span>
                        ))}
                    </div>

                    <div className="sigle_product_cart-buy">
                        <button className="add-to-cart-amazon-btn" onClick={addTocart}>ADD TO CART</button>
                    </div>

                    <div className="sold-by">
                        Sold by <a href="#">{data.seller_name || "ALAREESH MPT"}</a>
                    </div>

                    <hr className="divider" />

                    <div className="warranty-section">
                        <AiOutlineCheckCircle size={20} color="#555" />
                        <span>{data.warranty_info || "One Year Warranty"}</span>
                    </div>

                    <hr className="divider" />

                    <div className="secure-transaction">
                        <AiOutlineLock size={20} color="#555" />
                        <span>Secure Transaction</span>
                    </div>
                </div>

            </div>

            {/* PROMOTIONAL BANNER AT BOTTOM */}
            {data.promotional_banner_url && (
                <div className="promotional-banner" style={{ marginTop: "40px", width: "100%", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                    {data.promotional_banner_link ? (
                        <a href={data.promotional_banner_link} target="_blank" rel="noopener noreferrer">
                            <img src={data.promotional_banner_url} alt="Promotion" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                        </a>
                    ) : (
                        <img src={data.promotional_banner_url} alt="Promotion" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                    )}
                </div>
            )}

        </div>
    );
}

export default Single_product;
