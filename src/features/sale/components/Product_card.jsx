import { useEffect } from "react";
import "./../styles/ProductCard.css";
import { FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Wishlist_post, Wishlist_delete } from "../../wishlist/api/Wishlisht_Api";
import WishlistQuery from "../../wishlist/queries/WishlistQuery";
import { getImageUrl } from "../../../utils/imageUrl";
import showToast from "../../../utils/toast";
import defaultImage from "../../../assets/image_not_available.png";

function ProductCard({ products = [], isLoading, error, page = 1, pageSize = 14, count = 0, onPageChange }) {
    const navigate = useNavigate();
    const { data: rawWishlist = [], refetch } = WishlistQuery();
    const wishdata = Array.isArray(rawWishlist) ? rawWishlist : rawWishlist?.results || [];
    const totalPages = Math.max(1, Math.ceil(Number(count || products.length) / pageSize));

    useEffect(() => { window.scrollTo(0, 0); }, [page]);

    const addToWishlist = async (product, event) => {
        event.stopPropagation();
        const firstVariant = product.variants?.[0];
        const firstUnit = firstVariant?.price_type === "single" ? null : firstVariant?.sizes?.[0] || firstVariant?.units?.[0];
        if (!firstVariant || (firstVariant.price_type !== "single" && !firstUnit)) { showToast.error("Variant not available"); return; }
        const wishlistItem = wishdata.find((item) => item.variant === firstVariant.id && item.variant_size === (firstUnit ? firstUnit.id : null));
        try {
            if (wishlistItem) { await Wishlist_delete(wishlistItem.id); showToast.success("Product removed from wishlist"); }
            else { await Wishlist_post({ variant: firstVariant.id, variant_size: firstUnit ? firstUnit.id : null }); showToast.success("Product added to wishlist"); }
            await refetch();
        } catch (requestError) { showToast.error(requestError?.response?.data?.detail || "Could not update wishlist"); }
    };

    if (isLoading) return <div className="catalog-container"><section className="products shop-many-products">{Array.from({ length: 8 }).map((_, index) => <div className="product_card skeleton-card" key={index}><div className="product_img skeleton"></div><div className="product_info"><div className="skeleton skeleton-text category-skeleton"></div><div className="skeleton skeleton-text title-skeleton"></div><div className="skeleton skeleton-text price-skeleton"></div></div></div>)}</section></div>;
    if (error) return <h2 className="error-state">Unable to load products. Please try again.</h2>;
    if (!products.length) return <h2 className="error-state">No Products Found.</h2>;

    return <div className="catalog-container"><section className={`products ${products.length <= 3 ? "shop-few-products" : "shop-many-products"}`}>{products.map((product) => {
        const firstVariant = product.variants?.[0];
        const firstUnit = firstVariant?.price_type === "single" ? null : firstVariant?.sizes?.[0] || firstVariant?.units?.[0];
        const isWishlisted = !!wishdata.find((item) => item.variant === firstVariant?.id && item.variant_size === (firstUnit ? firstUnit.id : null));
        const image = firstVariant?.images?.find((item) => item.is_primary)?.image || firstVariant?.images?.[0]?.image;
        const startingPrice = product.starting_price;
        return <div className="product_card" key={product.id} onClick={() => navigate(`/single/${product.id}`)}><div className="product_img"><button className={`favorite_btn ${isWishlisted ? "active" : ""}`} onClick={(event) => addToWishlist(product, event)} aria-label="Wishlist"><FaHeart /></button>{product.has_offer && <div className="offer-badge">{product.discount_percentage}% OFF</div>}<img src={image ? getImageUrl(image) : defaultImage} alt={product.name} /><button type="button" className="quick-add-bar">VIEW PRODUCT</button></div><div className="product_info"><span className="product-category">{product.category?.name || "Premium Wear"}</span><h3 className="product-title">{product.name}</h3><div className="product-footer">{product.has_offer ? <div className="price-box"><span className="old-price">AED{Number(startingPrice).toFixed(2)}</span><span className="new-price">AED{Number(product.discounted_price).toFixed(2)}</span></div> : <span className="price">{startingPrice !== null && startingPrice !== undefined ? `AED${Number(startingPrice).toFixed(2)}` : "Price unavailable"}</span>}</div></div></div>;
    })}</section>{totalPages > 1 && <div className="pagination-wrapper" aria-label="Product pages"><div className="numbers"><button type="button" className="page-num pagination-arrow" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>‹</button>{Array.from({ length: totalPages }, (_, index) => index + 1).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2)).map((number) => <button type="button" key={number} className={`page-num ${page === number ? "active" : ""}`} onClick={() => onPageChange?.(number)}>{number}</button>)}<button type="button" className="page-num pagination-arrow" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>›</button></div></div>}</div>;
}

export default ProductCard;
