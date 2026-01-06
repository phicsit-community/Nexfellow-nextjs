"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import api from "@/lib/axios";
import tokenService from "@/utils/auth/tokenService";
import { initializeSocket } from "@/utils/socket";

/**
 * Client-side initialization component for Next.js
 * Handles token service initialization, socket connections, and auth heartbeat
 */
export default function ClientInitializer() {
    const user = useSelector((state) => state.auth.user);

    // Initialize token refresh service when the app mounts
    useEffect(() => {
        console.log("ClientInitializer: Initializing token service");

        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const expiresIn = localStorage.getItem("expiresIn");
        let isValid = false;

        if (isLoggedIn && expiresIn) {
            const expiresAt = new Date(expiresIn);
            if (!isNaN(expiresAt)) {
                isValid = expiresAt > new Date();
                console.log(`ClientInitializer: User login state: ${isValid ? "valid" : "expired"}`);
            }
        }

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
    }, []);

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
