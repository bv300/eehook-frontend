import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { FiChevronDown, FiEdit3, FiImage, FiLoader, FiPlus, FiSave, FiTrash2, FiX } from "react-icons/fi";
import { ConfirmDialog, EmptyState, LoadingState, StatusPill } from "../components/AdminPrimitives";
import { createResource, deleteResource, getErrorMessage, getResource, listResource, updateResource } from "../services/adminApi";
import "../styles/ProductEditor.css";

const emptyProduct = { name: "", description: "", key_features: "", category: "", subcategory: "", offer: "", seller_name: "", shipping_fee: "0", estimated_delivery_time: "", warranty_info: "", current_viewers_count: "0", promotional_banner_image: null, promotional_banner_link: "", is_active: true, product_type: "single" };
const emptyVariant = (product = "") => ({ product, color: "", price_type: "single", price: "", stock: "", units: [], images: [], deletedUnits: [], deletedImages: [] });
const rows = (payload) => Array.isArray(payload) ? payload : payload?.results || payload?.items || payload?.data || [];
const options = (payload, labelKeys = ["name", "title", "email", "code"]) => rows(payload).map((item) => ({ value: item.id ?? item.pk, label: labelKeys.map((key) => item[key]).find(Boolean) || `#${item.id ?? item.pk}`, category: item.category?.id ?? item.category_id ?? item.category }));
const idOf = (item) => item?.id ?? item?.pk ?? item?.uuid;
const valueOf = (item) => typeof item === "object" && item !== null ? item.id ?? item.pk : item ?? "";

export default function ProductEditor({ readOnly = false }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const editing = Boolean(id);
    const [product, setProduct] = useState(emptyProduct);
    const [productType, setProductType] = useState("single");
    const [variants, setVariants] = useState([]);
    const [dropdowns, setDropdowns] = useState({ categories: [], subcategories: [], offers: [], colors: [], unitTypes: [], units: [] });
    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null);
    const initialSnapshot = useRef("");
    const [openSections, setOpenSections] = useState({ information: true, category: true, offer: true, sales: true, promotional: true, status: true, variants: true });

    useEffect(() => {
        let active = true;
        Promise.all([listResource("categories", { page_size: 200 }), listResource("subcategories", { page_size: 500 }), listResource("offers", { page_size: 200 }), listResource("colors", { page_size: 200 }), listResource("unit-types", { page_size: 200 }), listResource("units", { page_size: 500 })]).then(([categories, subcategories, offers, colors, unitTypes, units]) => {
            if (!active) return;
            setDropdowns({ categories: options(categories.data), subcategories: options(subcategories.data), offers: options(offers.data), colors: options(colors.data), unitTypes: options(unitTypes.data), units: options(units.data) });
        }).catch((requestError) => setError(getErrorMessage(requestError, "Could not load product dropdown options.")));
        if (!editing) return () => { active = false; };
        getResource("products", id).then(async (productResponse) => {
            if (!active) return;
            const productData = productResponse.data;
            setProduct(normalizeProduct(productData));
            setProductType(productData.product_type || (productData.has_variants ? "multiple" : "single"));
            const variantResponse = await listResource("product-variants", { product: id, page_size: 500 });
            const variantRows = rows(variantResponse.data);
            const loaded = await Promise.all(variantRows.map(async (variant) => {
                const [unitResponse, imageResponse] = await Promise.all([
                    listResource("product-variant-units", { variant: idOf(variant), page_size: 500 }),
                    listResource("product-images", { variant: idOf(variant), page_size: 500 }),
                ]);
                return { ...variant, product: valueOf(variant.product) || id, color: valueOf(variant.color), price_type: variant.price_type || "single", price: variant.price ?? "", stock: variant.stock ?? "", units: rows(unitResponse.data).map(normalizeUnit), images: rows(imageResponse.data).map((image) => ({ ...image, file: null })), deletedUnits: [], deletedImages: [] };
            }));
            if (active) setVariants(loaded);
        }).catch((requestError) => { if (active) setError(getErrorMessage(requestError, "Could not load product.")); }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [editing, id]);

    const filteredSubcategories = useMemo(() => dropdowns.subcategories.filter((item) => !product.category || String(item.category) === String(product.category)), [dropdowns.subcategories, product.category]);
    const currentSnapshot = JSON.stringify({ product, variants });
    const hasUnsavedChanges = Boolean(initialSnapshot.current && initialSnapshot.current !== currentSnapshot);
    useEffect(() => { if (!loading && !initialSnapshot.current) initialSnapshot.current = currentSnapshot; }, [loading, currentSnapshot]);
    useEffect(() => { const warn = (event) => { if (!hasUnsavedChanges) return; event.preventDefault(); event.returnValue = ""; }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [hasUnsavedChanges]);
    const leaveEditor = () => { if (!hasUnsavedChanges || window.confirm("You have unsaved changes. Leave without saving?")) navigate("/order-dashboard/products"); };
    const updateProduct = (name, value) => setProduct((current) => ({ ...current, [name]: value }));
    const toggle = (section) => setOpenSections((current) => ({ ...current, [section]: !current[section] }));
    const addVariant = () => setVariants((current) => [...current, emptyVariant(id || "")]);
    const updateVariant = (index, name, value) => setVariants((current) => current.map((variant, variantIndex) => variantIndex === index ? { ...variant, [name]: value } : variant));
    const removeVariant = (index) => { const variant = variants[index]; setDeleteTarget({ type: "variant", index, id: idOf(variant) }); };
    const confirmDelete = async () => { const target = deleteTarget; setDeleteTarget(null); if (!target) return; if (target.type === "variant") { if (target.id) { try { await deleteResource("product-variants", target.id); toast.success("Variant deleted"); } catch (requestError) { toast.error(getErrorMessage(requestError, "Could not delete variant")); return; } } setVariants((current) => current.filter((_, index) => index !== target.index)); } };

    const validate = () => {
        const errors = {};
        if (!String(product.name || "").trim()) errors.name = "Product name is required.";
        if (!String(product.description || "").trim()) errors.description = "Description is required.";
        if (!product.category) errors.category = "Category is required.";
        if (!product.subcategory) errors.subcategory = "Subcategory is required.";
        const matchingSubcategory = dropdowns.subcategories.find((item) => String(item.value) === String(product.subcategory));
        if (matchingSubcategory && String(matchingSubcategory.category) !== String(product.category)) errors.subcategory = "Subcategory must belong to the selected category.";
        const usedColors = new Set();
        variants.forEach((variant, index) => {
            if (variant.color && usedColors.has(String(variant.color))) errors[`variant_${index}_color`] = "Color cannot be duplicated in this product.";
            if (variant.color) usedColors.add(String(variant.color));
            if (variant.price_type === "single") {
                if (variant.price === "" || Number(variant.price) < 0) errors[`variant_${index}_price`] = "Price is required and cannot be negative.";
                if (variant.stock === "" || Number(variant.stock) < 0) errors[`variant_${index}_stock`] = "Stock is required and cannot be negative.";
            } else {
                if (!variant.units.length) errors[`variant_${index}_units`] = "Multiple Price requires at least one unit row.";
                variant.units.forEach((unit, unitIndex) => { if (!unit.unit_type || !unit.unit || unit.price === "" || unit.stock === "" || Number(unit.price) < 0 || Number(unit.stock) < 0) errors[`variant_${index}_unit_${unitIndex}`] = "Unit type, unit, price, and non-negative stock are required."; });
            }
        });
        return errors;
    };

    const save = async (event) => {
        event.preventDefault();
        if (readOnly) return;
        const validation = validate();
        if (Object.keys(validation).length) { setFieldErrors(validation); setError(Object.values(validation).join(" ")); return; }
        if (!window.confirm(editing ? "Save changes to this product?" : "Create this product?")) return;
        setSaving(true); setError(""); setFieldErrors({});
        try {
            const productPayload = makeProductPayload({ ...product, product_type: productType, has_variants: productType === "multiple" });
            const productResponse = editing ? await updateResource("products", id, productPayload, productPayload instanceof FormData) : await createResource("products", productPayload, productPayload instanceof FormData);
            const productId = id || idOf(productResponse.data);
            for (const variant of variants) {
                const variantPayload = { product: productId, color: variant.color || null, price_type: variant.price_type, price: variant.price_type === "single" ? Number(variant.price) : null, stock: variant.price_type === "single" ? Number(variant.stock) : 0 };
                const variantResponse = idOf(variant) ? await updateResource("product-variants", idOf(variant), variantPayload) : await createResource("product-variants", variantPayload);
                const variantId = idOf(variant) || idOf(variantResponse.data);
                if (variant.price_type === "single") {
                    for (const unitId of [...variant.deletedUnits, ...variant.units.map(idOf).filter(Boolean)]) await deleteResource("product-variant-units", unitId);
                } else {
                    for (const unitId of variant.deletedUnits) await deleteResource("product-variant-units", unitId);
                    for (const unit of variant.units) {
                        const unitPayload = { variant: variantId, unit_type: unit.unit_type, unit: unit.unit, price: Number(unit.price), stock: Number(unit.stock) };
                        if (idOf(unit)) await updateResource("product-variant-units", idOf(unit), unitPayload); else await createResource("product-variant-units", unitPayload);
                    }
                }
                for (const imageId of variant.deletedImages) await deleteResource("product-images", imageId);
                for (const image of variant.images.filter((item) => idOf(item))) await updateResource("product-images", idOf(image), { is_primary: Boolean(image.is_primary) });
                for (const image of variant.images.filter((item) => item.file)) { const form = new FormData(); form.append("variant", variantId); form.append("image", image.file); if (image.alt_text) form.append("alt_text", image.alt_text); form.append("is_primary", String(Boolean(image.is_primary))); await createResource("product-images", form, true); }
            }
            toast.success(editing ? "Product updated successfully" : "Product created successfully");
            navigate(`/order-dashboard/products/${productId}`, { replace: true });
        } catch (requestError) { const backendErrors = requestError?.response?.data; setFieldErrors(typeof backendErrors === "object" ? flattenErrors(backendErrors) : {}); setError(getErrorMessage(requestError, "Could not save product.")); toast.error(getErrorMessage(requestError, "Could not save product.")); } finally { setSaving(false); }
    };

    if (loading) return <div className="admin-page"><LoadingState label="Loading product editor…" /></div>;
    return <div className="admin-page product-editor-page"><button className="admin-back-link" onClick={leaveEditor}>Back to Products</button><div className="admin-page-header"><div><p className="admin-eyebrow">PRODUCT MANAGEMENT</p><h2>{editing ? "Edit Product" : "Create Product"}</h2><p>Manage product details, variants, units, and images on one page.</p></div><button className="admin-button primary" onClick={save} disabled={saving}><FiSave /> {saving ? "Saving…" : "Save Product"}</button></div>{error && <div className="admin-form-error product-editor-error">{error}</div>}<form onSubmit={save}><EditorSection title="Product Information" open={openSections.information} onToggle={() => toggle("information")}><div className="product-form-grid"><TextField label="Product name" required value={product.name} onChange={(value) => updateProduct("name", value)} error={fieldErrors.name} /><TextAreaField label="Description" required value={product.description} onChange={(value) => updateProduct("description", value)} error={fieldErrors.description} /><TextAreaField label="Key features" hint="Enter one feature per line" value={product.key_features} onChange={(value) => updateProduct("key_features", value)} /></div></EditorSection><EditorSection title="Category Details" open={openSections.category} onToggle={() => toggle("category")}><div className="product-form-grid two"><SelectField label="Category" required value={product.category} options={dropdowns.categories} onChange={(value) => { updateProduct("category", value); if (product.subcategory && !dropdowns.subcategories.some((item) => String(item.value) === String(product.subcategory) && String(item.category) === String(value))) updateProduct("subcategory", ""); }} error={fieldErrors.category} /><SelectField label="Subcategory" required value={product.subcategory} options={filteredSubcategories} onChange={(value) => updateProduct("subcategory", value)} error={fieldErrors.subcategory} /></div></EditorSection><EditorSection title="Offer Details" open={openSections.offer} onToggle={() => toggle("offer")}><div className="product-form-grid two"><SelectField label="Offer" value={product.offer} options={dropdowns.offers} emptyLabel="No offer" onChange={(value) => updateProduct("offer", value)} /></div></EditorSection><EditorSection title="Sales & Delivery" open={openSections.sales} onToggle={() => toggle("sales")}><div className="product-form-grid two"><TextField label="Seller name" value={product.seller_name} onChange={(value) => updateProduct("seller_name", value)} /><NumberField label="Shipping fee" min="0" step="0.01" value={product.shipping_fee} onChange={(value) => updateProduct("shipping_fee", value)} /><TextField label="Estimated delivery time" value={product.estimated_delivery_time} onChange={(value) => updateProduct("estimated_delivery_time", value)} /><TextField label="Warranty information" value={product.warranty_info} onChange={(value) => updateProduct("warranty_info", value)} /></div></EditorSection><EditorSection title="Promotional & Social" open={openSections.promotional} onToggle={() => toggle("promotional")}><div className="product-form-grid two"><NumberField label="Current viewers count" min="0" step="1" value={product.current_viewers_count} onChange={(value) => updateProduct("current_viewers_count", value)} /><FileField label="Promotional banner image" value={product.promotional_banner_image} onChange={(value) => updateProduct("promotional_banner_image", value)} /><TextField label="Promotional banner link" value={product.promotional_banner_link} onChange={(value) => updateProduct("promotional_banner_link", value)} /></div></EditorSection><EditorSection title="Status" open={openSections.status} onToggle={() => toggle("status")}><label className="product-toggle"><input type="checkbox" checked={Boolean(product.is_active)} onChange={(event) => updateProduct("is_active", event.target.checked)} /> Active</label></EditorSection><EditorSection title="Product Variants & Images" open={openSections.variants} onToggle={() => toggle("variants")}><div className="variant-section-heading"><div><strong>Variants</strong><span>Colors, Single Price, Multiple Price, sizes, units, and variant images.</span></div><button type="button" className="admin-button secondary" onClick={addVariant}><FiPlus /> Add Variant</button></div>{variants.length ? variants.map((variant, index) => <VariantCard key={idOf(variant) || `new-${index}`} variant={variant} index={index} colors={dropdowns.colors} unitTypes={dropdowns.unitTypes} units={dropdowns.units} fieldErrors={fieldErrors} onChange={updateVariant} onDelete={removeVariant} onConfirmTypeChange={(nextType) => changeVariantType(variants, setVariants, index, nextType)} onAddUnit={() => addUnit(setVariants, index)} onRemoveUnit={(unitIndex) => removeUnit(setVariants, index, unitIndex)} onAddImage={(file) => addImage(setVariants, index, file)} onRemoveImage={(imageIndex) => removeImage(setVariants, index, imageIndex)} />) : <EmptyState title="No variants yet" description="Add a variant to configure color, pricing, stock, and images." />}</EditorSection><div className="product-editor-footer"><button type="button" className="admin-button secondary" onClick={leaveEditor}>Cancel</button><button className="admin-button primary" disabled={saving}><FiSave /> {saving ? "Saving…" : "Save Product"}</button></div></form>{deleteTarget && <ConfirmDialog title="Delete variant" message="Delete this variant and its linked units and images?" onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />}</div>;
}

function normalizeProduct(data) { return { ...emptyProduct, ...data, category: valueOf(data.category), subcategory: valueOf(data.subcategory), offer: valueOf(data.offer), key_features: Array.isArray(data.key_features) ? data.key_features.join("\n") : data.key_features || "", promotional_banner_image: data.promotional_banner_image || null }; }
function makeProductPayload(product) {
    const productFields = { ...product };
    delete productFields.emi_available;
    delete productFields.emi_starting_price;
    const values = { ...productFields, key_features: Array.isArray(product.key_features) ? product.key_features.join("\n") : String(product.key_features || ""), category: product.category || null, subcategory: product.subcategory || null, offer: product.offer || null, shipping_fee: product.shipping_fee === "" ? 0 : Number(product.shipping_fee), current_viewers_count: product.current_viewers_count === "" ? 0 : Number(product.current_viewers_count), emi_available: false, emi_starting_price: null };
    const file = values.promotional_banner_image instanceof File ? values.promotional_banner_image : null;
    if (!file) { delete values.promotional_banner_image; return values; }
    const form = new FormData(); Object.entries(values).forEach(([key, value]) => { if (key === "promotional_banner_image") form.append(key, file); else if (value !== null && value !== undefined) form.append(key, value); else form.append(key, "null"); }); return form;
}
function normalizeUnit(unit) { return { ...unit, unit_type: valueOf(unit.unit_type), unit: valueOf(unit.unit) }; }
function flattenErrors(data) { return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, Array.isArray(value) ? value.join(", ") : String(value)])); }

function EditorSection({ title, open, onToggle, children }) { return <section className="product-editor-section"><button type="button" className="product-section-heading" onClick={onToggle}><strong>{title}</strong><FiChevronDown className={open ? "section-open" : ""} /></button>{open && <div className="product-section-content">{children}</div>}</section>; }
function TextField({ label, value, onChange, error, required }) { return <label className="product-field"><span>{label}{required && " *"}</span><input value={value || ""} onChange={(event) => onChange(event.target.value)} />{error && <small>{error}</small>}</label>; }
function NumberField({ label, value, onChange, min, step = "0.01", error }) { return <label className="product-field"><span>{label}</span><input type="number" min={min} step={step} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />{error && <small>{error}</small>}</label>; }
function TextAreaField({ label, value, onChange, error, required, hint }) { return <label className="product-field full"><span>{label}{required && " *"}</span><textarea rows="5" value={value || ""} onChange={(event) => onChange(event.target.value)} />{hint && <small className="field-hint">{hint}</small>}{error && <small>{error}</small>}</label>; }
function SelectField({ label, value, options: optionRows, onChange, error, required, emptyLabel = "Select" }) { return <label className="product-field"><span>{label}{required && " *"}</span><select value={value || ""} onChange={(event) => onChange(event.target.value)}><option value="">{emptyLabel}</option>{optionRows.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{error && <small>{error}</small>}</label>; }
function FileField({ label, value, onChange }) { const preview = value instanceof File ? URL.createObjectURL(value) : value; return <label className="product-field"><span>{label}</span><input type="file" accept="image/*" onChange={(event) => onChange(event.target.files?.[0] || null)} />{preview && <img className="editor-image-preview" src={preview} alt="Preview" />}</label>; }

function VariantCard({ variant, index, colors, unitTypes, units, fieldErrors, onChange, onDelete, onConfirmTypeChange, onAddUnit, onRemoveUnit, onAddImage, onRemoveImage }) { return <article className="variant-card"><div className="variant-card-heading"><div><strong>Variant {index + 1}</strong>{variant.price_type === "multiple" ? <StatusPill value="Multiple Price" /> : <StatusPill value="Single Price" />}</div><button type="button" className="table-icon danger" onClick={() => onDelete(index)}><FiTrash2 /></button></div><div className="product-form-grid two"><SelectField label="Color" value={variant.color} options={colors} onChange={(value) => onChange(index, "color", value)} /><fieldset className="price-type-field"><legend>Price Type</legend><label><input type="radio" checked={variant.price_type === "single"} onChange={() => onConfirmTypeChange("single")} /> Single Price</label><label><input type="radio" checked={variant.price_type === "multiple"} onChange={() => onConfirmTypeChange("multiple")} /> Multiple Price</label></fieldset></div>{variant.price_type === "single" ? <div className="product-form-grid two"><NumberField label="Price" min="0" value={variant.price} onChange={(value) => onChange(index, "price", value)} error={fieldErrors[`variant_${index}_price`]} /><NumberField label="Stock" min="0" value={variant.stock} onChange={(value) => onChange(index, "stock", value)} error={fieldErrors[`variant_${index}_stock`]} /></div> : <UnitTable units={variant.units} unitTypes={unitTypes} unitOptions={units} error={fieldErrors[`variant_${index}_units`]} onAdd={onAddUnit} onRemove={onRemoveUnit} onChange={(unitIndex, key, value) => onChange(index, "units", variant.units.map((unit, current) => current === unitIndex ? { ...unit, [key]: value } : unit))} /> }<div className="variant-images"><div className="variant-subheading"><strong>Product images</strong><label className="admin-button secondary"><FiImage /> Add Image<input hidden type="file" accept="image/*" onChange={(event) => { if (event.target.files?.[0]) onAddImage(event.target.files[0]); event.target.value = ""; }} /></label></div><div className="variant-image-grid">{variant.images.map((image, imageIndex) => <div className="variant-image-item" key={idOf(image) || imageIndex}><img src={image.file ? URL.createObjectURL(image.file) : image.image} alt="Product" /><label className="primary-image-check"><input type="checkbox" checked={Boolean(image.is_primary)} onChange={() => onChange(index, "images", variant.images.map((item, current) => current === imageIndex ? { ...item, is_primary: true } : { ...item, is_primary: false }))} /> Is primary</label><button type="button" onClick={() => onRemoveImage(imageIndex)}><FiX /></button></div>)}</div></div></article>; }
function UnitTable({ units, unitTypes, unitOptions, error, onAdd, onRemove, onChange }) { return <div className="unit-table"><div className="variant-subheading"><div><strong>Sizes / Units</strong>{error && <small className="product-error">{error}</small>}</div><button type="button" className="admin-button secondary" onClick={onAdd}><FiPlus /> Add Size/Unit</button></div>{units.map((unit, index) => <div className="editor-unit-row" key={idOf(unit) || index}><select value={unit.unit_type || ""} onChange={(event) => onChange(index, "unit_type", event.target.value)}><option value="">Unit Type</option>{unitTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><select value={unit.unit || ""} onChange={(event) => onChange(index, "unit", event.target.value)}><option value="">Unit</option>{unitOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><input type="number" min="0" step="0.01" placeholder="Price" value={unit.price ?? ""} onChange={(event) => onChange(index, "price", event.target.value)} /><input type="number" min="0" step="1" placeholder="Stock" value={unit.stock ?? ""} onChange={(event) => onChange(index, "stock", event.target.value)} /><button type="button" className="table-icon danger" onClick={() => onRemove(index)}><FiTrash2 /></button></div>)}</div>; }

function changeVariantType(variants, setVariants, index, nextType) { const variant = variants[index]; if (variant.price_type === nextType) return; if (!window.confirm(`Switch this variant to ${nextType === "single" ? "Single Price" : "Multiple Price"}?`)) return; if (nextType === "single" && variant.units.length && !window.confirm("Switching to Single Price will clear all size/unit rows. Continue?")) return; setVariants((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, price_type: nextType, units: nextType === "single" ? [] : item.units, deletedUnits: nextType === "single" ? [...item.deletedUnits, ...item.units.map(idOf).filter(Boolean)] : item.deletedUnits, price: nextType === "multiple" ? "" : item.price, stock: nextType === "multiple" ? 0 : item.stock } : item)); }
function addUnit(setVariants, index) { setVariants((current) => current.map((variant, variantIndex) => variantIndex === index ? { ...variant, units: [...variant.units, { unit_type: "", unit: "", price: "", stock: "" }] } : variant)); }
function removeUnit(setVariants, index, unitIndex) { if (!window.confirm("Delete this size/unit?")) return; setVariants((current) => current.map((variant, variantIndex) => { if (variantIndex !== index) return variant; const unit = variant.units[unitIndex]; return { ...variant, units: variant.units.filter((_, currentIndex) => currentIndex !== unitIndex), deletedUnits: idOf(unit) ? [...variant.deletedUnits, idOf(unit)] : variant.deletedUnits }; })); }
function addImage(setVariants, index, file) { setVariants((current) => current.map((variant, variantIndex) => variantIndex === index ? { ...variant, images: [...variant.images, { file, image: "", is_primary: false }] } : variant)); }
function removeImage(setVariants, index, imageIndex) { if (!window.confirm("Delete this product image?")) return; setVariants((current) => current.map((variant, variantIndex) => { if (variantIndex !== index) return variant; const image = variant.images[imageIndex]; return { ...variant, images: variant.images.filter((_, currentIndex) => currentIndex !== imageIndex), deletedImages: idOf(image) ? [...variant.deletedImages, idOf(image)] : variant.deletedImages }; })); }
