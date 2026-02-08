import axios from "axios";

// Determine base URL for API calls
const getBaseURL = () => {
    const isDevelopment = process.env.NODE_ENV === "development";
    const baseURL = isDevelopment
        ? process.env.NEXT_PUBLIC_LOCALHOST
        : process.env.NEXT_PUBLIC_SERVER_URL;

    console.log("API Base URL configured:", baseURL, "| Environment:", process.env.NODE_ENV);
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

                // If refresh fails, clear auth data and redirect to login
                // But only if we're NOT already on the login page or auth callback
                if (typeof window !== "undefined") {
                    const isOnAuthPage = window.location.pathname === "/login" ||
                        window.location.pathname === "/signup" ||
                        window.location.pathname === "/forgotpassword" ||
                        window.location.pathname === "/auth/callback" ||
                        window.location.pathname.startsWith("/auth/");

                    // Check if we just completed OAuth login (within last 5 seconds)
                    const oauthLoginTime = sessionStorage.getItem("oauth_login_time");
                    const justCompletedOAuth = oauthLoginTime && (Date.now() - parseInt(oauthLoginTime)) < 5000;

                    if (!isOnAuthPage && !justCompletedOAuth) {
                        console.log("Token refresh failed, clearing auth data");
                        localStorage.removeItem("isLoggedIn");
                        localStorage.removeItem("user");
                        localStorage.removeItem("token");
                        localStorage.removeItem("expiresIn");

                        // Clear stale cookies
                        document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                        window.location.href = "/login";
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
