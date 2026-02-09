"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import FeedPage from "@/Pages/FeedPage/FeedPage";
import PrivateLayout from "@/layouts/PrivateLayout";
import Loader from "@/components/Loader/Loader";
import api from "@/lib/axios";
import { login, setAuthLoading } from "@/store/slices/authSlice";

export default function Feed() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { isLoggedIn, isAuthLoading, user } = useSelector((state) => state.auth);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const hasChecked = useRef(false);

    useEffect(() => {
        const checkAuth = async () => {
            // Prevent double execution
            if (hasChecked.current) return;
            hasChecked.current = true;

            // Check if we just came from OAuth callback
            const oauthSuccess = sessionStorage.getItem("oauth_login_success");
            const oauthLoginTime = sessionStorage.getItem("oauth_login_time");
            const justCompletedOAuth = oauthLoginTime && (Date.now() - parseInt(oauthLoginTime)) < 60000; // 60 seconds

            if (oauthSuccess) {
                sessionStorage.removeItem("oauth_login_success");
            }

            // First, check if already logged in via Redux (from OAuth callback)
            if (isLoggedIn && user) {
                console.log("Feed: Already logged in via Redux");
                setIsCheckingAuth(false);
                return;
            }

            // Check localStorage - THIS IS THE PRIMARY AUTH SOURCE after OAuth
            const localIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            const userStr = localStorage.getItem("user");
            const hasUser = userStr && userStr !== "null" && userStr !== "undefined";

            console.log("Feed: Checking localStorage - isLoggedIn:", localIsLoggedIn, "hasUser:", hasUser);

            if (localIsLoggedIn && hasUser) {
                try {
                    const parsedUser = JSON.parse(userStr);
                    if (parsedUser && parsedUser.id) {
                        console.log("Feed: Restored auth from localStorage for user:", parsedUser.email);
                        dispatch(login({ user: parsedUser, expiresIn: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() }));
                        setIsCheckingAuth(false);
                        // Don't make API call - localStorage is the source of truth after OAuth
                        return;
                    }
                } catch (e) {
                    console.log("Failed to parse user from localStorage:", e);
                }
            }

            // If we just completed OAuth but localStorage isn't ready yet, wait and retry
            if (justCompletedOAuth) {
                console.log("Feed: Just completed OAuth, waiting for localStorage...");

                // Wait and retry multiple times
                for (let i = 0; i < 10; i++) {
                    await new Promise(resolve => setTimeout(resolve, 200));

                    const retryLocalIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
                    const retryUserStr = localStorage.getItem("user");
                    const retryHasUser = retryUserStr && retryUserStr !== "null" && retryUserStr !== "undefined";

                    console.log("Feed: Retry", i + 1, "- isLoggedIn:", retryLocalIsLoggedIn, "hasUser:", retryHasUser);

                    if (retryLocalIsLoggedIn && retryHasUser) {
                        try {
                            const parsedUser = JSON.parse(retryUserStr);
                            if (parsedUser && parsedUser.id) {
                                console.log("Feed: Restored auth from localStorage after retry", i + 1);
                                dispatch(login({ user: parsedUser, expiresIn: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() }));
                                setIsCheckingAuth(false);
                                return;
                            }
                        } catch (e) {
                            console.log("Failed to parse user from localStorage on retry", i + 1);
                        }
                    }
                }
                
                // If still not found after retries, check one more time then redirect
                console.log("Feed: OAuth completed but no localStorage data found after 10 retries");
            }

            // Only check with server if no localStorage data and not just after OAuth
            if (!justCompletedOAuth) {
                try {
                    console.log("Feed: Checking auth with server...");
                    const response = await api.get("/auth/getDetails", {
                        withCredentials: true,
                    });

                    if (response.status === 200 && response.data.payload) {
                        const { payload, expiresIn } = response.data;
                        console.log("Feed: Auth confirmed by server");
                        dispatch(login({ user: payload, expiresIn }));
                        setIsCheckingAuth(false);
                        return;
                    }
                } catch (error) {
                    console.log("Feed: Server auth check failed:", error.message);
                }
            }

            // Not authenticated - redirect to login
            console.log("Feed: Not authenticated, redirecting to login");
            router.replace("/login");
        };

        // Run immediately
        checkAuth();
    }, [dispatch, router, isLoggedIn, user]);

    // Show loader while checking auth
    if (isCheckingAuth || isAuthLoading) {
        return <Loader />;
    }

    if (!isLoggedIn) {
        return <Loader />;
    }

    return (
        <PrivateLayout>
            <FeedPage />
        </PrivateLayout>
    );
}
