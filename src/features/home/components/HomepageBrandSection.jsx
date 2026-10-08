import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUrl";
import defaultImage from "../../../assets/image_not_available.png";

function HomepageBrandSection({ brands }) {
    const navigate = useNavigate();
    const visibleBrands = Array.isArray(brands)
        ? brands.filter((brand) => brand?.id !== null && brand?.id !== undefined)
        : [];

    if (!visibleBrands.length) return null;

    return (
        <div className="new-arrivals-wrapper homepage-brands-wrapper">
            <section className="new-arrivals homepage-brand-arrivals" aria-labelledby="homepage-shop-by-brand">
                <div className="heading-container">
                <div className="heading-text">
                    <h2 id="homepage-shop-by-brand">Shop by brand</h2>
                    <p className="heading-sub">Curated collections</p>
                </div>
                </div>

                <div className="grid-container">
                    <div className="new-arrivals-grid homepage-brand-grid">
                    {visibleBrands.map((brand) => (
                    <button
                        type="button"
                        className="new-product-card homepage-brand-product-card"
                        key={brand.id}
                        onClick={() => navigate(`/products/?brand=${encodeURIComponent(brand.slug || brand.id)}`)}
                    >
                        <div className="image-container homepage-brand-image">
                            <img className="product-img" src={getImageUrl(brand.logo) || defaultImage} alt={brand.name || "Brand"} />
                            <span className="badge-new">BRAND</span>
                            <span className="homepage-brand-explore">EXPLORE</span>
                        </div>
                        <div className="product-details">
                            <span className="product-tag">BRAND COLLECTION</span>
                            <h3 className="newHome-product-title">{brand.name || "Brand"}</h3>
                            <div className="product-meta">
                                <span className="product-price">{brand.product_count !== null && brand.product_count !== undefined ? `${brand.product_count} products` : "Explore collection"}</span>
                            </div>
                        </div>
                    </button>
                ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HomepageBrandSection;

