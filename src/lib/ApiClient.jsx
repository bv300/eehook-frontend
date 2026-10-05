import axios from "axios";
import { clearAuthSession } from "../features/auth/authUtils";
import showToast from "../utils/toast";

const API_URL = import.meta.env.VITE_API_URL;
let refreshPromise = null;

function redirectToLogin() {
    clearAuthSession();
    const normalizedPath = window.location.pathname.toLowerCase();
    const isOrderDashboardPath = normalizedPath.startsWith("/eehook-dashboard") || normalizedPath.startsWith("/order-dashboard") || normalizedPath.startsWith("/orderdashboard");
    const path = isOrderDashboardPath ? "/eehook-dashboard/admin-login" : "/login";
    if (window.location.pathname !== path) window.location.href = path;
}

export function getRetryAfterSeconds(error, fallback = 60) {
    const raw = error?.response?.headers?.["retry-after"] ?? error?.response?.headers?.["Retry-After"];
    const seconds = Number(raw);
    return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : fallback;
}

function isAuthRequest(config = {}) {
    return /(?:^|\/)login\/?$|google-login|token\/refresh|logout/.test(String(config.url || ""));
}

async function refreshAccessToken() {
    const refresh = localStorage.getItem("refresh_token") || localStorage.getItem("refresh");
    if (!refresh) throw new Error("No refresh token available");

    if (!refreshPromise) {
        refreshPromise = axios.post(`${API_URL}/token/refresh/`, { refresh }).then((response) => {
            const access = response.data?.access;
            if (!access) throw new Error("Refresh response did not contain an access token");
            localStorage.setItem("access", access);
            localStorage.setItem("access_token", access);
            return access;
        }).finally(() => { refreshPromise = null; });
    }

    return refreshPromise;
}

const client = axios.create({ baseURL: `${API_URL}/` });

client.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("access");
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config || {};
        const status = error.response?.status;

        if (status === 429) {
            const retryAfter = getRetryAfterSeconds(error);
            window.dispatchEvent(new CustomEvent("api:rate-limited", { detail: { retryAfter } }));
            if (!isAuthRequest(originalRequest)) {
                showToast.warning(`Too many requests. Please try again after ${retryAfter} seconds.`);
            }
            return Promise.reject(error);
        }

        if (status === 401 && !originalRequest._retry && !originalRequest.skipAuthRefresh && !isAuthRequest(originalRequest)) {
            originalRequest._retry = true;
            try {
                const access = await refreshAccessToken();
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return client(originalRequest);
            } catch (refreshError) {
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }

        if (status === 403) window.dispatchEvent(new CustomEvent("api:forbidden"));
        if (status === 401 && !originalRequest.skipAuthRedirect) redirectToLogin();
        return Promise.reject(error);
    }
);

export async function logoutSession() {
    const refresh = localStorage.getItem("refresh_token") || localStorage.getItem("refresh");
    try {
        if (refresh) await client.post("logout/", { refresh }, { skipAuthRefresh: true });
    } catch {
        // Local credentials are cleared even when the server cannot be reached.
    } finally {
        sessionStorage.clear();
        clearAuthSession();
    }
}

export default client;
