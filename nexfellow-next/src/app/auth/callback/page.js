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
                    // Store user in Redux
                    dispatch(
                        login({
                            user: response.data.payload,
                            expiresIn: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                        })
                    );

                    // Set a flag in sessionStorage to indicate successful OAuth login
                    sessionStorage.setItem("oauth_login_success", "true");

                    // Wait for localStorage to be updated, then do a hard redirect
                    await new Promise(resolve => setTimeout(resolve, 300));

                    // Use window.location for a full page reload to ensure state is fresh
                    window.location.href = "/feed";
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

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {isProcessing ? (
                    <>
                        <div className={styles.spinner}></div>
                        <h2 className={styles.title}>Completing sign in...</h2>
                        <p className={styles.subtitle}>Please wait while we authenticate you</p>
                    </>
                ) : error ? (
                    <>
                        <div className={styles.errorIcon}>✕</div>
                        <h2 className={styles.title}>Authentication Failed</h2>
                        <p className={styles.error}>{error}</p>
                        <p className={styles.subtitle}>Redirecting to login...</p>
                    </>
                ) : null}
            </div>
        </div>
    );
}
