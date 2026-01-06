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

                // If refresh fails, redirect to login
                if (typeof window !== "undefined") {
                    console.log("Token refresh failed, redirecting to login");
                    localStorage.removeItem("isLoggedIn");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
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
