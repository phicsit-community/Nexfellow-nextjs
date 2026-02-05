"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "@/lib/axios";
import tokenService from "@/utils/auth/tokenService";
import { initializeSocket } from "@/utils/socket";
import { login, setAuthLoading } from "@/store/slices/authSlice";

/**
 * Client-side initialization component for Next.js
 * Handles token service initialization, socket connections, and auth heartbeat
 */
export default function ClientInitializer() {
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    // Initialize token refresh service and check auth on mount
    useEffect(() => {
        console.log("ClientInitializer: Initializing...");

        const initializeAuth = async () => {
            // Skip auth check on public pages to avoid unnecessary API calls
            const isPublicPage = typeof window !== "undefined" &&
                (window.location.pathname === "/" ||
                    window.location.pathname === "/login" ||
                    window.location.pathname === "/signup" ||
                    window.location.pathname === "/forgotpassword" ||
                    window.location.pathname === "/contact" ||
                    window.location.pathname === "/privacy" ||
                    window.location.pathname === "/terms" ||
                    window.location.pathname === "/help" ||
                    window.location.pathname.startsWith("/blogs"));

            if (isPublicPage) {
                console.log("ClientInitializer: On public page, skipping auth check");
                dispatch(setAuthLoading(false));
                return;
            }

            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            const userStr = localStorage.getItem("user");
            const hasUser = userStr && userStr !== "null" && userStr !== "undefined";

            // Case 1: User data exists in localStorage - we're good
            if (isLoggedIn && hasUser) {
                console.log("ClientInitializer: User data found in localStorage");
                dispatch(setAuthLoading(false));
                return;
            }

            // Case 2: No localStorage data - try to fetch from server (handles OAuth redirect)
            // This is crucial for OAuth flows where cookies are set but localStorage is empty
            console.log("ClientInitializer: No user data in localStorage, checking server...");

            try {
                const response = await api.get("/auth/getDetails", {
                    withCredentials: true,
                });

                if (response.status === 200 && response.data.payload) {
                    const { payload, expiresIn } = response.data;
                    console.log("ClientInitializer: User authenticated via cookies, updating state");

                    // Update Redux and localStorage
                    dispatch(login({ user: payload, expiresIn }));
                    
                    // Set the isLoggedIn cookie for middleware (in case backend didn't set it)
                    const expires = new Date();
                    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
                    document.cookie = `isLoggedIn=true;expires=${expires.toUTCString()};path=/;SameSite=Lax`;
                }
            } catch (error) {
                // Not authenticated - clear stale data
                console.log("ClientInitializer: Not authenticated, clearing stale data");
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                localStorage.removeItem("expiresIn");
                // Clear stale cookie
                document.cookie = "isLoggedIn=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            } finally {
                dispatch(setAuthLoading(false));
            }
        };

        initializeAuth();
        tokenService.initialize();

        // Auth heartbeat check every 15 minutes
        const authCheckInterval = setInterval(() => {
            const currentIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            if (currentIsLoggedIn) {
                console.log("ClientInitializer: Performing auth heartbeat check");
                api
                    .get("/auth/getDetails", { withCredentials: true })
                    .catch((err) => {
                        console.log("Auth heartbeat error (non-critical):", err.message);
                    });
            }
        }, 15 * 60 * 1000);

        return () => {
            clearInterval(authCheckInterval);
        };
    }, [dispatch]);

    // Initialize socket connection on user presence or change
    useEffect(() => {
        if (user?.id) {
            console.log("ClientInitializer: Initializing socket for user:", user.id);
            initializeSocket(user.id);
        }
    }, [user]);

    // This component doesn't render anything
    return null;
}
