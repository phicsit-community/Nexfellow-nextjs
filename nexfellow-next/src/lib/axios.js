import axios from "axios";

const getBaseURL = () => {
    if (process.env.NEXT_PUBLIC_SERVER_URL) {
        return process.env.NEXT_PUBLIC_SERVER_URL;
    }
    if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        if (
            hostname.includes("vercel.app") ||
            hostname.includes("nexfellow.com") ||
            hostname.includes("onrender.com")
        ) {
            return "https://nexfellow-nextjs.onrender.com";
        }
    }
    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
        return "https://nexfellow-nextjs.onrender.com";
    }
    return "http://localhost:4000";
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach the Clerk session token to every request.
api.interceptors.request.use(
    async (config) => {
        if (typeof window !== "undefined") {
            try {
                const token = await window.Clerk?.session?.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (_) {
                // Clerk not ready — proceed without token
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Retry 401s once after waiting for Clerk session to load (handles refresh race condition).
// All other errors are passed through to the caller.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const suppressErrorLog = Boolean(
            originalRequest?.suppressErrorLog ||
            originalRequest?.meta?.suppressErrorLog
        );

        // On 401: wait up to 2s for Clerk session, then retry once.
        // This fixes the race where components mount and fire requests before
        // window.Clerk.session is populated after a page refresh.
        if (
            error.response?.status === 401 &&
            !originalRequest._retried &&
            typeof window !== "undefined"
        ) {
            originalRequest._retried = true;
            let token = null;
            for (let i = 0; i < 8; i++) {
                try { token = await window.Clerk?.session?.getToken(); } catch (_) {}
                if (token) break;
                if (i < 7) await new Promise((r) => setTimeout(r, 250));
            }
            if (token) {
                // Request interceptor will attach the fresh token on retry
                return api(originalRequest);
            }
        }

        if (!suppressErrorLog) {
            if (error.response?.status === 403) {
                console.log("Forbidden request");
            } else if (error.response?.status === 500) {
                console.warn(`Server error on ${originalRequest?.url || "unknown endpoint"}`);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
