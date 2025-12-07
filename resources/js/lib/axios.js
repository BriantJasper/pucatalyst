import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const storage = localStorage.getItem("auth-storage");
        if (storage) {
            const { state } = JSON.parse(storage);
            const token = state?.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            const pathname = window.location.pathname;

            // Don't auto-redirect on auth-related pages (they handle their own errors)
            const authPages = [
                "/login",
                "/register",
                "/verify-email",
                "/forgot-password",
                "/reset-password",
            ];
            const isAuthPage = authPages.some((page) =>
                pathname.startsWith(page)
            );

            // Don't auto-redirect on protected areas - let ProtectedRoute handle it
            // This prevents race conditions with Zustand hydration
            const protectedAreas = ["/student/", "/alumni/", "/admin/"];
            const isProtectedArea = protectedAreas.some((area) =>
                pathname.startsWith(area)
            );

            // Only auto-redirect on public pages (landing, etc.)
            if (!isAuthPage && !isProtectedArea) {
                // Clear local storage
                localStorage.removeItem("auth-storage");
                // Redirect to login
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
