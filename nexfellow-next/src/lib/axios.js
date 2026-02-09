import axios from "axios";

// Determine base URL for API calls
const getBaseURL = () => {
    // Use NEXT_PUBLIC_SERVER_URL for production (deployed on Vercel)
    // In production, NODE_ENV is "production" and we use the server URL
    const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || "https://nexfellow-nextjs.onrender.com";
    console.log("API Base URL configured:", baseURL);
    return baseURL;
};

// Create axios instance with base configuration
const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Track if we're currently refreshing to avoid multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor for adding auth headers if needed
api.interceptors.request.use(
    (config) => {
        // You can add auth token here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Prevent infinite loop on refresh endpoint
            if (originalRequest.url?.includes('/auth/refresh-token')) {
                return Promise.reject(error);
            }

            // Don't try to refresh on exchange-code endpoint - this is part of OAuth flow
            if (originalRequest.url?.includes('/auth/exchange-code')) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            if (isRefreshing) {
                // Queue failed requests while refreshing
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            isRefreshing = true;

            try {
                // Attempt to refresh token
                const response = await api.post('/auth/refresh-token', {}, {
                    withCredentials: true,
                });

                if (response.status === 200) {
                    console.log('Token refreshed successfully');
                    isRefreshing = false;
                    processQueue(null);
                    // Retry the original request
                    return api(originalRequest);
                }
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError, null);

                // If refresh fails, DON'T immediately clear auth and redirect
                // Let the page handle auth state - just reject the request
                if (typeof window !== "undefined") {
                    const isOnAuthPage = window.location.pathname === "/login" ||
                        window.location.pathname === "/signup" ||
                        window.location.pathname === "/forgotpassword" ||
                        window.location.pathname === "/auth/callback" ||
                        window.location.pathname.startsWith("/auth/");

                    // Check if we just completed OAuth login (within last 30 seconds - increased from 5)
                    const oauthLoginTime = sessionStorage.getItem("oauth_login_time");
                    const justCompletedOAuth = oauthLoginTime && (Date.now() - parseInt(oauthLoginTime)) < 30000;

                    // Check if localStorage has valid auth data
                    const hasLocalAuth = localStorage.getItem("isLoggedIn") === "true" &&
                        localStorage.getItem("user") &&
                        localStorage.getItem("user") !== "null";

                    // Only clear and redirect if:
                    // 1. Not on auth page
                    // 2. Did not just complete OAuth
                    // 3. No valid local auth data (user likely truly logged out)
                    if (!isOnAuthPage && !justCompletedOAuth && !hasLocalAuth) {
                        console.log("Token refresh failed and no local auth, redirecting to login");
                        window.location.href = "/login";
                    } else {
                        console.log("Token refresh failed but local auth exists or OAuth just completed, not redirecting");
                    }
                }
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        if (error.response?.status === 403) {
            console.log("Forbidden request");
        } else if (error.response?.status === 500) {
            console.error("Server error");
        }

        return Promise.reject(error);
    }
);

export default api;
