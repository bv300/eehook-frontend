import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { FiArrowLeft, FiPlus, FiSave } from "react-icons/fi";
import { createResource, getErrorMessage, getResource, listResource, updateResource } from "../services/adminApi";
import { LoadingState } from "../components/AdminPrimitives";
import "../styles/HeroBannerEditor.css";

const emptyCoupon = { code: "", products: [], discount: "", start_date: "", end_date: "", is_active: true };
const idOf = (row) => row?.id ?? row?.pk ?? row?.uuid;
const labelOf = (row) => row?.name || row?.title || row?.code || `Product ${idOf(row)}`;
const errorMap = (error) => { const data = error?.response?.data; return data && typeof data === "object" ? Object.fromEntries(Object.entries(data).map(([key, value]) => [key, Array.isArray(value) ? value.join(", ") : String(value)])) : {}; };
const toLocalDateTime = (value) => value ? String(value).slice(0, 16) : "";

export default function CouponEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const editing = Boolean(id);
    const [values, setValues] = useState(emptyCoupon);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(editing);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [requestError, setRequestError] = useState("");

    useEffect(() => {
        let active = true;
        listResource("products", { page_size: 500 }).then((response) => { if (active) setProducts(response.data?.results || response.data || []); }).catch(() => {});
        if (!editing) return () => { active = false; };
        getResource("coupons", id).then((response) => {
            const row = response.data || {};
            setValues({ code: row.code || "", products: (row.products || []).map((product) => String(idOf(product) ?? product)), discount: row.discount_percentage ?? row.discount_value ?? "", start_date: toLocalDateTime(row.start_date || row.valid_from), end_date: toLocalDateTime(row.end_date || row.valid_until), is_active: row.is_active !== false });
        }).catch((error) => setRequestError(getErrorMessage(error, "Could not load coupon."))).finally(() => setLoading(false));
        return () => { active = false; };
    }, [editing, id]);

    const setValue = (name, value) => setValues((current) => ({ ...current, [name]: value }));
    const toggleProduct = (productId) => setValues((current) => ({ ...current, products: current.products.includes(productId) ? current.products.filter((value) => value !== productId) : [...current.products, productId] }));
    const validate = () => {
        const next = {};
        if (values.discount === "" || Number(values.discount) < 0 || Number(values.discount) > 100) next.discount = "Enter a percentage between 0 and 100.";
        if (!values.start_date) next.start_date = "Start date is required.";
        if (!values.end_date) next.end_date = "End date is required.";
        return next;
    };
    const save = async (mode = "list") => {
        const validation = validate();
        if (Object.keys(validation).length) { setErrors(validation); setRequestError("Please correct the highlighted fields."); return; }
        setSaving(true); setErrors({}); setRequestError("");
        try {
            const payload = { products: values.products, discount_percentage: Number(values.discount), start_date: values.start_date, end_date: values.end_date, is_active: Boolean(values.is_active) };
            if (values.code.trim()) payload.code = values.code.trim();
            const response = editing ? await updateResource("coupons", id, payload) : await createResource("coupons", payload);
            const savedId = id || idOf(response.data);
            toast.success(editing ? "Coupon updated" : "Coupon created");
            if (mode === "another") { setValues(emptyCoupon); navigate("/order-dashboard/coupons/new", { replace: true }); }
            else if (mode === "continue") navigate(`/order-dashboard/coupons/${savedId}/edit`, { replace: true });
            else navigate("/order-dashboard/coupons");
        } catch (error) { setErrors(errorMap(error)); setRequestError(getErrorMessage(error, "Could not save coupon.")); toast.error(getErrorMessage(error, "Could not save coupon.")); }
        finally { setSaving(false); }
    };
    if (loading) return <div className="admin-page"><LoadingState label="Loading coupon..." /></div>;
    return <div className="hero-banner-editor-page">
        <div className="hero-editor-heading"><div><button type="button" className="hero-back-link" onClick={() => navigate("/order-dashboard/coupons")}><FiArrowLeft /> Coupons</button><h2>Coupons</h2></div><div className="hero-breadcrumb">Home&nbsp; / &nbsp;Myapp&nbsp; / &nbsp;Coupons&nbsp; / &nbsp;{editing ? "Edit coupon" : "Add coupon"}</div></div>
        <div className="hero-editor-layout"><section className="hero-editor-card"><div className="hero-editor-form">
            <label className="hero-editor-field"><span>Code</span><input type="text" autoFocus value={values.code} onChange={(event) => setValue("code", event.target.value)} /><small className="hero-field-help">Leave blank to auto-generate</small></label>
            <div className="hero-editor-field"><span>Products</span><div className="coupon-products"><div className="coupon-product-picker"><select value="" onChange={(event) => { if (event.target.value && !values.products.includes(event.target.value)) setValue("products", [...values.products, event.target.value]); }}><option value="">Select products</option>{products.filter((product) => !values.products.includes(String(idOf(product)))).map((product) => <option key={idOf(product)} value={idOf(product)}>{labelOf(product)}</option>)}</select><button type="button" className="coupon-add-product" title="Add product" onClick={() => navigate("/order-dashboard/products/new")}><FiPlus /></button></div>{values.products.length > 0 && <div className="coupon-selected-products">{values.products.map((productId) => { const product = products.find((item) => String(idOf(item)) === String(productId)); return <button type="button" key={productId} onClick={() => setValue("products", values.products.filter((value) => value !== productId))}>{labelOf(product || { id: productId })} ×</button>; })}</div>}<small className="hero-field-help">Select specific products. Leave blank to apply to ALL products.</small></div></div>
            <label className={`hero-editor-field ${errors.discount ? "has-error" : ""}`}><span>Discount percentage <em>*</em></span><input type="number" min="0" max="100" step="0.01" value={values.discount} onChange={(event) => setValue("discount", event.target.value)} />{errors.discount && <small>{errors.discount}</small>}</label>
            <label className={`hero-editor-field ${errors.start_date ? "has-error" : ""}`}><span>Start date <em>*</em></span><input type="datetime-local" value={values.start_date} onChange={(event) => setValue("start_date", event.target.value)} />{errors.start_date && <small>{errors.start_date}</small>}</label>
            <label className={`hero-editor-field ${errors.end_date ? "has-error" : ""}`}><span>End date <em>*</em></span><input type="datetime-local" value={values.end_date} onChange={(event) => setValue("end_date", event.target.value)} />{errors.end_date && <small>{errors.end_date}</small>}</label>
            <label className="hero-editor-field"><span>Is active</span><input type="checkbox" checked={Boolean(values.is_active)} onChange={(event) => setValue("is_active", event.target.checked)} /></label>
        </div>{requestError && <p className="hero-editor-error">{requestError}</p>}</section><aside className="hero-editor-actions"><button className="hero-save-button" onClick={() => save("list")} disabled={saving}><FiSave /> Save</button><button className="hero-secondary-button" onClick={() => save("another")} disabled={saving}>Save and add another</button><button className="hero-secondary-button" onClick={() => save("continue")} disabled={saving}>Save and continue editing</button></aside></div>
    </div>;
}
