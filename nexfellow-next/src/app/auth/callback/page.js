"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { login } from "@/store/slices/authSlice";
import api from "@/lib/axios";
import styles from "./page.module.css";

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const hasProcessed = useRef(false);

    useEffect(() => {
        const exchangeCode = async () => {
            // Prevent double execution
            if (hasProcessed.current) return;
            hasProcessed.current = true;

            const code = searchParams.get("code");

            if (!code) {
                setError("No authorization code found");
                setIsProcessing(false);
                setTimeout(() => router.push("/login"), 2000);
                return;
            }

            try {
                const response = await api.post("/auth/exchange-code", { code });

                if (response.data.success) {
                    // Store user in Redux (this also saves to localStorage)
                    dispatch(
                        login({
                            user: response.data.payload,
                            expiresIn: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                        })
                    );

                    // Store access token in localStorage for Authorization header fallback
                    if (response.data.token) {
                        localStorage.setItem("accessToken", response.data.token);
                    }

                    // Set flags in sessionStorage to indicate successful OAuth login
                    sessionStorage.setItem("oauth_login_success", "true");
                    sessionStorage.setItem("oauth_login_time", Date.now().toString());

                    // CRITICAL: Wait and verify localStorage is set before redirecting
                    // This prevents the race condition where feed page doesn't see the auth data
                    let verified = false;
                    for (let i = 0; i < 10; i++) {
                        await new Promise(resolve => setTimeout(resolve, 100));

                        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
                        const userStr = localStorage.getItem("user");
                        const hasUser = userStr && userStr !== "null" && userStr !== "undefined";

                        if (isLoggedIn && hasUser) {
                            console.log("OAuth callback: localStorage verified after", (i + 1) * 100, "ms");
                            verified = true;
                            break;
                        }
                    }

                    if (!verified) {
                        // Force set localStorage directly as fallback
                        console.log("OAuth callback: Force setting localStorage");
                        localStorage.setItem("isLoggedIn", "true");
                        localStorage.setItem("user", JSON.stringify(response.data.payload));
                        localStorage.setItem("expiresIn", new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString());
                    }

                    // Set isOnboarded cookie on the frontend domain so Next.js middleware can read it
                    const isOnboarded = response.data.payload?.isOnboarded;
                    const onboardedExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
                    document.cookie = `isOnboarded=${isOnboarded ? "true" : "false"};expires=${onboardedExpiry};path=/;SameSite=Lax`;

                    // Final wait to ensure everything is synced
                    await new Promise(resolve => setTimeout(resolve, 200));

                    // Route based on onboarding status
                    const destination = response.data.redirect || (isOnboarded ? "/feed" : "/onboarding");
                    window.location.href = destination;
                } else {
                    throw new Error("Failed to authenticate");
                }
            } catch (err) {
                console.error("OAuth callback error:", err);
                setError(err.response?.data?.message || "Authentication failed");
                setIsProcessing(false);
                setTimeout(() => router.push("/login"), 3000);
            }
        };

        exchangeCode();
    }, [searchParams, dispatch]);

    // Only show UI if there's an error; otherwise keep the page invisible
    // so the OAuth redirect feels seamless.
    if (!error) return null;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.errorIcon}>✕</div>
                <h2 className={styles.title}>Authentication Failed</h2>
                <p className={styles.error}>{error}</p>
                <p className={styles.subtitle}>Redirecting to login...</p>
            </div>
        </div>
    );
}
