import client from "../../lib/ApiClient";

const STORAGE_PREFIX = "eehook:coupon-applications:v1";

export function normalizeCouponCode(code) {
    return String(code || "").trim().toUpperCase();
}

function getUserKey() {
    const userId = localStorage.getItem("user_id");
    if (userId) return `id:${userId}`;

    const email = localStorage.getItem("email");
    if (email) return `email:${email.trim().toLowerCase()}`;

    // A user id is normally saved at login. Decoding the JWT is a fallback for
    // sessions created before that field was introduced.
    const token = localStorage.getItem("access_token") || localStorage.getItem("access");
    if (!token) return null;

    try {
        const base64Payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const paddedPayload = base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, "=");
        const payload = JSON.parse(atob(paddedPayload));
        const identity = payload.user_id || payload.id || payload.sub || payload.email;
        return identity ? `jwt:${identity}` : null;
    } catch {
        return null;
    }
}

function storageKey(userKey) {
    return `${STORAGE_PREFIX}:${userKey}`;
}

function storageAreas() {
    return [window.localStorage, window.sessionStorage];
}

function readEntries(userKey, storage = window.localStorage) {
    if (!userKey) return {};

    try {
        const parsed = JSON.parse(storage.getItem(storageKey(userKey)) || "{}");
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function entryKey(productId, couponCode) {
    return `${String(productId?.id ?? productId)}:${normalizeCouponCode(couponCode)}`;
}

function normalizeProductId(productId) {
    return productId?.id ?? productId;
}

export function getCouponApplication(productId, couponCode) {
    const userKey = getUserKey();
    const normalizedProductId = normalizeProductId(productId);
    if (!userKey || !normalizedProductId || !normalizeCouponCode(couponCode)) return null;
    return storageAreas().map((storage) => readEntries(userKey, storage)[entryKey(normalizedProductId, couponCode)]).find(Boolean) || null;
}

export function getMostRecentCouponApplication(productId) {
    const userKey = getUserKey();
    const normalizedProductId = normalizeProductId(productId);
    if (!userKey || !normalizedProductId) return null;

    return storageAreas().flatMap((storage) => Object.values(readEntries(userKey, storage)))
        .filter((entry) => String(entry.productId) === String(normalizedProductId))
        .sort((first, second) => Number(second.updatedAt || 0) - Number(first.updatedAt || 0))[0] || null;
}

export function saveCouponApplication(productId, couponCode, application) {
    const userKey = getUserKey();
    const normalizedProductId = normalizeProductId(productId);
    const normalizedCode = normalizeCouponCode(couponCode);
    if (!userKey || !normalizedProductId || !normalizedCode) return;

    const entry = {
        ...application,
        code: normalizedCode,
        productId: String(normalizedProductId),
        updatedAt: Date.now(),
    };

    storageAreas().forEach((storage) => {
        const entries = readEntries(userKey, storage);
        entries[entryKey(normalizedProductId, couponCode)] = entry;
        storage.setItem(storageKey(userKey), JSON.stringify(entries));
    });
}

export function clearCouponApplication(productId, couponCode) {
    const userKey = getUserKey();
    const normalizedProductId = normalizeProductId(productId);
    const normalizedCode = normalizeCouponCode(couponCode);
    if (!userKey || !normalizedCode) return;

    storageAreas().forEach((storage) => {
        const entries = readEntries(userKey, storage);
        Object.entries(entries).forEach(([key, entry]) => {
            const matchesCode = normalizeCouponCode(entry?.code) === normalizedCode || key.endsWith(`:${normalizedCode}`);
            const matchesProduct = normalizedProductId == null || String(entry?.productId) === String(normalizedProductId) || key.startsWith(`${String(normalizedProductId)}:`);
            if (matchesCode && matchesProduct) delete entries[key];
        });
        if (Object.keys(entries).length) storage.setItem(storageKey(userKey), JSON.stringify(entries));
        else storage.removeItem(storageKey(userKey));
    });
}

export function clearCouponApplicationsForProduct(productId) {
    const userKey = getUserKey();
    const normalizedProductId = normalizeProductId(productId);
    if (!userKey || normalizedProductId == null) return;

    storageAreas().forEach((storage) => {
        const entries = readEntries(userKey, storage);
        Object.entries(entries).forEach(([key, entry]) => {
            if (String(entry?.productId) === String(normalizedProductId) || key.startsWith(`${String(normalizedProductId)}:`)) delete entries[key];
        });
        if (Object.keys(entries).length) storage.setItem(storageKey(userKey), JSON.stringify(entries));
        else storage.removeItem(storageKey(userKey));
    });
}

export function isInactiveCouponError(errorOrResponse) {
    const data = errorOrResponse?.response?.data || errorOrResponse?.data || errorOrResponse || {};
    return data?.error_code === "COUPON_INACTIVE" || data?.coupon_status === "COUPON_INACTIVE";
}

export function isAuthenticatedForCoupons() {
    return Boolean((localStorage.getItem("access_token") || localStorage.getItem("access")) && getUserKey());
}

export async function validateCoupon(code, productId) {
    return client.post(
        "validate-coupon/",
        { code: String(code).trim(), product_id: productId },
        // Coupon validation should surface an authentication error in the form
        // instead of redirecting away before the user can read it.
        { skipAuthRefresh: true, skipAuthRedirect: true }
    );
}
