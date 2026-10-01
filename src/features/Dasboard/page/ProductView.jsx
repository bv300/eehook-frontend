import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { getErrorMessage, getResource, listResource } from "../services/adminApi";
import { EmptyState, LoadingState } from "../components/AdminPrimitives";
import { getImageUrl } from "../../../utils/imageUrl";
import defaultImage from "../../../assets/image_not_available.png";

const rows = (payload) => Array.isArray(payload) ? payload : payload?.results || payload?.items || payload?.data || [];
const idOf = (value) => value?.id ?? value?.pk ?? value;
const labelOf = (value) => typeof value === "object" ? value?.name || value?.title || `#${idOf(value)}` : value || "—";

export default function ProductView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        async function load() {
            try {
                const productResponse = await getResource("products", id);
                const variantResponse = await listResource("product-variants", { product: id, page_size: 500 });
                const variantRows = rows(variantResponse.data);
                const details = await Promise.all(variantRows.map(async (variant) => {
                    const [units, images] = await Promise.all([
                        listResource("product-variant-units", { variant: idOf(variant), page_size: 500 }),
                        listResource("product-images", { variant: idOf(variant), page_size: 500 }),
                    ]);
                    return { ...variant, units: rows(units.data), images: rows(images.data) };
                }));
                if (active) { setProduct(productResponse.data); setVariants(details); }
            } catch (requestError) { if (active) setError(getErrorMessage(requestError, "Could not load product.")); }
            finally { if (active) setLoading(false); }
        }
        load();
        return () => { active = false; };
    }, [id]);

    if (loading) return <div className="admin-page"><LoadingState label="Loading product…" /></div>;
    if (error) return <div className="admin-page"><div className="admin-form-error product-editor-error">{error}</div><button className="admin-button secondary" onClick={() => navigate("/order-dashboard/products")}><FiArrowLeft /> Back to Products</button></div>;
    if (!product) return <div className="admin-page"><EmptyState title="Product not found" /></div>;

    return <div className="admin-page product-view-page">
        <div className="product-view-toolbar"><button className="admin-button secondary" onClick={() => navigate("/order-dashboard/products")}><FiArrowLeft /> Back to Products</button></div>
        <div className="admin-page-header"><div><p className="admin-eyebrow">PRODUCT VIEW</p><h2>{product.name}</h2><p>Read-only product details and variant information.</p></div></div>
        <section className="product-view-card"><h3>Product Information</h3><div className="product-view-grid"><div><small>Description</small><p>{product.description || "—"}</p></div><div><small>Category</small><p>{labelOf(product.category)}</p></div><div><small>Subcategory</small><p>{labelOf(product.subcategory)}</p></div><div><small>Offer</small><p>{labelOf(product.offer)}</p></div><div><small>Seller</small><p>{product.seller_name || "—"}</p></div><div><small>Status</small><p>{product.is_active ? "Active" : "Inactive"}</p></div></div>{product.key_features && <div><small>Key features</small><p className="features-text">{Array.isArray(product.key_features) ? product.key_features.join(" • ") : product.key_features}</p></div>}</section>
        <section className="product-view-card"><h3>Variants</h3>{variants.length ? variants.map((variant, index) => { const primary = variant.images.find((image) => image.is_primary); return <article className="product-view-variant" key={idOf(variant) || index}><div className="product-view-variant-head"><div><strong>{labelOf(variant.color) || `Variant ${index + 1}`}</strong><span>{variant.price_type === "multiple" ? "Multiple Price" : `Single Price · ${variant.price ?? "—"} · Stock ${variant.stock ?? 0}`}</span></div>{primary?.image && <img src={getImageUrl(primary.image)} alt={labelOf(variant.color)} />}</div>{variant.price_type === "multiple" && <div className="product-view-units">{variant.units.map((unit, unitIndex) => <div key={idOf(unit) || unitIndex}><span>{labelOf(unit.unit_type)} / {labelOf(unit.unit)}</span><strong>{unit.price} · Stock {unit.stock}</strong></div>)}</div>}<div className="product-view-images">{variant.images.length ? variant.images.map((image, imageIndex) => <img key={idOf(image) || imageIndex} src={getImageUrl(image.image)} alt="Product" />) : <img src={defaultImage} alt="Default product" />}</div></article>; }) : <EmptyState title="No variants" description="This product has no variants yet." />}</section>
    </div>;
}
