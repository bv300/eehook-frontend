import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { FiArrowLeft, FiPlus, FiSave, FiSearch } from "react-icons/fi";
import { createResource, getErrorMessage, getResource, listResource, updateResource } from "../services/adminApi";
import { LoadingState } from "../components/AdminPrimitives";
import "../styles/HeroBannerEditor.css";

const emptyCoupon = { code: "", products: [], discount: "", start_date: "", end_date: "", is_active: true };
const idOf = (row) => row?.id ?? row?.pk ?? row?.uuid;
const labelOf = (row) => row?.name || row?.title || row?.code || `Product ${idOf(row)}`;
const rowsFromPayload = (payload) => Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : [];
const uniqueRows = (rows) => Array.from(new Map(rows.filter((row) => idOf(row) != null).map((row) => [String(idOf(row)), row])).values());
const errorMap = (error) => { const data = error?.response?.data; return data && typeof data === "object" ? Object.fromEntries(Object.entries(data).map(([key, value]) => [key, Array.isArray(value) ? value.join(", ") : String(value)])) : {}; };
const pad = (value) => String(value).padStart(2, "0");
const toLocalDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const toIsoDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

export default function CouponEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const editing = Boolean(id);
    const [values, setValues] = useState(emptyCoupon);
    const [products, setProducts] = useState([]);
    const [productSearch, setProductSearch] = useState("");
    const [debouncedProductSearch, setDebouncedProductSearch] = useState("");
    const [productCache, setProductCache] = useState({});
    const [productsLoading, setProductsLoading] = useState(true);
    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [requestError, setRequestError] = useState("");

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedProductSearch(productSearch.trim()), 300);
        return () => window.clearTimeout(timer);
    }, [productSearch]);

    useEffect(() => {
        let active = true;
        let requestFinished = false;
        const loadingTimer = window.setTimeout(() => { if (active && !requestFinished) setProductsLoading(true); }, 0);
        const params = { page_size: 500 };
        if (debouncedProductSearch) params.search = debouncedProductSearch;
        const request = listResource("products", params).catch((error) => {
            if (!debouncedProductSearch) return Promise.reject(error);
            return listResource("products", { page_size: 500 });
        });
        request.then((response) => {
            if (!active) return;
            const rows = uniqueRows(rowsFromPayload(response.data));
            setProducts(rows);
            setProductCache((current) => ({
                ...current,
                ...Object.fromEntries(rows.map((product) => [String(idOf(product)), product])),
            }));
        }).catch(() => {
            if (active) setProducts([]);
        }).finally(() => { requestFinished = true; if (active) setProductsLoading(false); });
        return () => { active = false; window.clearTimeout(loadingTimer); };
    }, [debouncedProductSearch]);

    useEffect(() => {
        let active = true;
        if (!editing) return () => { active = false; };
        getResource("coupons", id).then((response) => {
            const row = response.data || {};
            const selectedProducts = Array.from(new Set((row.products || []).map((product) => String(idOf(product) ?? product)).filter(Boolean)));
            if (!active) return;
            const embeddedProducts = (row.products || []).filter((product) => product && typeof product === "object" && idOf(product) != null);
            setProductCache((current) => ({
                ...current,
                ...Object.fromEntries(embeddedProducts.map((product) => [String(idOf(product)), product])),
            }));
            setValues({ code: row.code || "", products: selectedProducts, discount: row.discount_percentage ?? row.discount_value ?? "", start_date: toLocalDateTime(row.start_date || row.valid_from), end_date: toLocalDateTime(row.end_date || row.valid_until), is_active: row.is_active !== false });
            const missingProducts = selectedProducts.filter((productId) => !embeddedProducts.some((product) => String(idOf(product)) === productId));
            Promise.all(missingProducts.map((productId) => getResource("products", productId).then((productResponse) => productResponse.data).catch(() => null))).then((fetchedProducts) => {
                if (!active) return;
                const fetchedRows = fetchedProducts.filter(Boolean);
                if (fetchedRows.length) setProductCache((current) => ({
                    ...current,
                    ...Object.fromEntries(fetchedRows.map((product) => [String(idOf(product)), product])),
                }));
            });
        }).catch((error) => { if (active) setRequestError(getErrorMessage(error, "Could not load coupon.")); }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [editing, id]);

    const setValue = (name, value) => setValues((current) => ({ ...current, [name]: value }));
    const addProduct = (productId) => {
        const normalizedId = String(productId);
        setValues((current) => {
            const selectedIds = current.products.map((value) => String(value));
            if (selectedIds.includes(normalizedId)) return current;
            return { ...current, products: [...selectedIds, normalizedId] };
        });
        setProductSearch("");
    };
    const removeProduct = (productId) => setValues((current) => ({
        ...current,
        products: current.products.filter((value) => String(value) !== String(productId)),
    }));
    const selectedProductIds = new Set(values.products.map((value) => String(value)));
    const searchQuery = productSearch.trim().toLowerCase();
    const availableProducts = products
        .filter((product) => !selectedProductIds.has(String(idOf(product))))
        .filter((product) => !searchQuery || [labelOf(product), product.name, product.title, product.code, product.sku, product.product_code].filter(Boolean).join(" ").toLowerCase().includes(searchQuery));
    const validate = () => {
        const next = {};
        if (values.discount === "" || Number(values.discount) < 0 || Number(values.discount) > 100) next.discount = "Enter a percentage between 0 and 100.";
        if (!values.start_date) next.start_date = "Start date is required.";
        if (!values.end_date) next.end_date = "End date is required.";
        if (values.start_date && values.end_date && new Date(values.end_date) <= new Date(values.start_date)) next.end_date = "End date must be after the start date.";
        return next;
    };
    const save = async (mode = "list") => {
        const validation = validate();
        if (Object.keys(validation).length) { setErrors(validation); setRequestError("Please correct the highlighted fields."); return; }
        setSaving(true); setErrors({}); setRequestError("");
        try {
            const payload = { products: values.products, discount_percentage: Number(values.discount), start_date: toIsoDateTime(values.start_date), end_date: toIsoDateTime(values.end_date), is_active: Boolean(values.is_active) };
            if (values.code.trim()) payload.code = values.code.trim();
            const response = editing ? await updateResource("coupons", id, payload) : await createResource("coupons", payload);
            const savedId = id || idOf(response.data);
            toast.success(editing ? "Coupon updated" : "Coupon created");
            if (mode === "another") { setValues(emptyCoupon); navigate("/eehook-dashboard/coupons/new", { replace: true }); }
            else if (mode === "continue") navigate(`/eehook-dashboard/coupons/${savedId}/edit`, { replace: true });
            else navigate("/eehook-dashboard/coupons");
        } catch (error) { setErrors(errorMap(error)); setRequestError(getErrorMessage(error, "Could not save coupon.")); toast.error(getErrorMessage(error, "Could not save coupon.")); }
        finally { setSaving(false); }
    };
    if (loading) return <div className="admin-page"><LoadingState label="Loading coupon..." /></div>;
    return <div className="hero-banner-editor-page">
        <div className="hero-editor-heading"><div><button type="button" className="hero-back-link" onClick={() => navigate("/eehook-dashboard/coupons")}><FiArrowLeft /> Coupons</button><h2>Coupons</h2></div><div className="hero-breadcrumb">Home&nbsp; / &nbsp;Myapp&nbsp; / &nbsp;Coupons&nbsp; / &nbsp;{editing ? "Edit coupon" : "Add coupon"}</div></div>
        <div className="hero-editor-layout"><section className="hero-editor-card"><div className="hero-editor-form">
            <label className="hero-editor-field"><span>Code</span><input type="text" autoFocus value={values.code} onChange={(event) => setValue("code", event.target.value)} /><small className="hero-field-help">Leave blank to auto-generate</small></label>
            <div className="hero-editor-field"><span>Products</span><div className="coupon-products"><div className="coupon-product-picker"><div className="coupon-product-search"><FiSearch aria-hidden="true" /><input type="search" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search products" aria-label="Search products" /></div><select value="" disabled={productsLoading} onChange={(event) => { if (event.target.value) addProduct(event.target.value); }}><option value="">{productsLoading ? "Loading products..." : "Select products"}</option>{availableProducts.map((product) => <option key={idOf(product)} value={idOf(product)}>{labelOf(product)}</option>)}</select><button type="button" className="coupon-add-product" title="Add product" onClick={() => navigate("/eehook-dashboard/products/new")}><FiPlus /></button></div>{searchQuery && <div className="coupon-product-results" role="listbox" aria-label="Product search results">{productsLoading ? <p className="coupon-product-empty">Searching products...</p> : availableProducts.length > 0 ? availableProducts.slice(0, 8).map((product) => <button type="button" className="coupon-product-result" role="option" key={idOf(product)} onClick={() => addProduct(idOf(product))}><span>{labelOf(product)}</span>{(product.sku || product.code || product.product_code) && <small>{product.sku || product.code || product.product_code}</small>}</button>) : <p className="coupon-product-empty">No products found</p>}</div>}{productsLoading && !searchQuery && <small className="hero-field-help" role="status">Loading products...</small>}{!productsLoading && !searchQuery && availableProducts.length === 0 && <small className="hero-field-help" role="status">No products found</small>}{values.products.length > 0 && <div className="coupon-selected-products">{values.products.map((productId) => { const product = productCache[String(productId)] || products.find((item) => String(idOf(item)) === String(productId)); return <button type="button" key={productId} onClick={() => removeProduct(productId)}>{labelOf(product || { id: productId })} ×</button>; })}</div>}<small className="hero-field-help">Search and select specific products. Leave blank to apply to ALL products.</small></div></div>
            <label className={`hero-editor-field ${errors.discount ? "has-error" : ""}`}><span>Discount percentage <em>*</em></span><input type="number" min="0" max="100" step="0.01" value={values.discount} onChange={(event) => setValue("discount", event.target.value)} />{errors.discount && <small>{errors.discount}</small>}</label>
            <label className={`hero-editor-field ${errors.start_date ? "has-error" : ""}`}><span>Start date <em>*</em></span><input type="datetime-local" value={values.start_date} onChange={(event) => setValue("start_date", event.target.value)} />{errors.start_date && <small>{errors.start_date}</small>}</label>
            <label className={`hero-editor-field ${errors.end_date ? "has-error" : ""}`}><span>End date <em>*</em></span><input type="datetime-local" value={values.end_date} onChange={(event) => setValue("end_date", event.target.value)} />{errors.end_date && <small>{errors.end_date}</small>}</label>
            <label className="hero-editor-field"><span>Is active</span><input type="checkbox" checked={Boolean(values.is_active)} onChange={(event) => setValue("is_active", event.target.checked)} /></label>
        </div>{requestError && <p className="hero-editor-error">{requestError}</p>}</section><aside className="hero-editor-actions"><button className="hero-save-button" onClick={() => save("list")} disabled={saving}><FiSave /> Save</button><button className="hero-secondary-button" onClick={() => save("another")} disabled={saving}>Save and add another</button><button className="hero-secondary-button" onClick={() => save("continue")} disabled={saving}>Save and continue editing</button></aside></div>
    </div>;
}
