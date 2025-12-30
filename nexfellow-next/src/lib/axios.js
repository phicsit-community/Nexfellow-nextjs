import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_LOCALHOST
        : process.env.NEXT_PUBLIC_SERVER_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

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

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle specific error codes
        if (error.response?.status === 401) {
            // Handle unauthorized - could redirect to login
            console.log("Unauthorized request");
        }
        return Promise.reject(error);
    }
);

export default api;
