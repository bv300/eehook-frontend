import axios from "axios";
import { clearAuthSession } from "../features/auth/authUtils";

const API_URL = import.meta.env.VITE_API_URL;

const client = axios.create({
    baseURL: `${API_URL}/`,
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("access");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

client.interceptors.response.use(
    (response) => response,

    async (error) => {

        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            localStorage.getItem("refresh_token") || localStorage.getItem("refresh")
        ) {

            originalRequest._retry = true;

            try {

                const response = await axios.post(
                    `${API_URL}/token/refresh/`,
                    {
                        refresh: localStorage.getItem("refresh_token") || localStorage.getItem("refresh"),
                    }
                );

                localStorage.setItem(
                    "access",
                    response.data.access
                );
                localStorage.setItem("access_token", response.data.access);

                originalRequest.headers.Authorization =
                    `Bearer ${response.data.access}`;

                return client(originalRequest);

            } catch {

                clearAuthSession();
                window.location.href = window.location.pathname.startsWith("/order-dashboard") ? "/admin-login" : "/login";
            }
        }

        if (error.response?.status === 403) {
            window.dispatchEvent(new CustomEvent("api:forbidden"));
        }

        if (error.response?.status === 401) {
            clearAuthSession();
            const loginPath = window.location.pathname.startsWith("/order-dashboard") ? "/admin-login" : "/login";
            if (window.location.pathname !== loginPath) window.location.href = loginPath;
        }

        return Promise.reject(error);
    }
);

export default client;
