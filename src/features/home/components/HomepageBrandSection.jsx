import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUrl";
import defaultImage from "../../../assets/image_not_available.png";

function HomepageBrandSection({ brands }) {
    const navigate = useNavigate();
    const visibleBrands = Array.isArray(brands)
        ? brands.filter((brand) => brand?.id !== null && brand?.id !== undefined && brand?.slug)
        : [];

    if (!visibleBrands.length) return null;

    return (
        <section className="homepage-section homepage-brands" aria-labelledby="homepage-shop-by-brand">
            <div className="homepage-section-heading">
                <div>
                    <p className="homepage-section-eyebrow">Curated collections</p>
                    <h2 id="homepage-shop-by-brand">Shop by brand</h2>
                </div>
            </div>

            <div className="homepage-brand-grid">
                {visibleBrands.map((brand) => (
                    <button
                        type="button"
                        className="homepage-brand-card"
                        key={brand.id}
                        onClick={() => navigate(`/products/?brand=${encodeURIComponent(brand.slug)}`)}
                    >
                        <span className="homepage-brand-logo">
                            <img src={getImageUrl(brand.logo) || defaultImage} alt={brand.name || "Brand"} />
                        </span>
                        <span className="homepage-brand-name">{brand.name}</span>
                        {brand.product_count !== null && brand.product_count !== undefined && (
                            <span className="homepage-brand-count">{brand.product_count} products</span>
                        )}
                    </button>
                ))}
            </div>
        </section>
    );
}

export default HomepageBrandSection;

