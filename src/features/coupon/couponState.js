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

function readEntries(userKey) {
    if (!userKey) return {};

    try {
        const parsed = JSON.parse(localStorage.getItem(storageKey(userKey)) || "{}");
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function entryKey(productId, couponCode) {
    return `${String(productId)}:${normalizeCouponCode(couponCode)}`;
}

export function getCouponApplication(productId, couponCode) {
    const userKey = getUserKey();
    if (!userKey || !productId || !normalizeCouponCode(couponCode)) return null;
    return readEntries(userKey)[entryKey(productId, couponCode)] || null;
}

export function getMostRecentCouponApplication(productId) {
    const userKey = getUserKey();
    if (!userKey || !productId) return null;

    return Object.values(readEntries(userKey))
        .filter((entry) => String(entry.productId) === String(productId))
        .sort((first, second) => Number(second.updatedAt || 0) - Number(first.updatedAt || 0))[0] || null;
}

export function saveCouponApplication(productId, couponCode, application) {
    const userKey = getUserKey();
    const normalizedCode = normalizeCouponCode(couponCode);
    if (!userKey || !productId || !normalizedCode) return;

    const entries = readEntries(userKey);
    entries[entryKey(productId, normalizedCode)] = {
        ...application,
        code: normalizedCode,
        productId: String(productId),
        updatedAt: Date.now(),
    };

    localStorage.setItem(storageKey(userKey), JSON.stringify(entries));
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
