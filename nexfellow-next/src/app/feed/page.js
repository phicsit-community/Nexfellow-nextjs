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
            const justCompletedOAuth = oauthLoginTime && (Date.now() - parseInt(oauthLoginTime)) < 10000;

            if (oauthSuccess) {
                sessionStorage.removeItem("oauth_login_success");
            }

            // First, check if already logged in via Redux (from OAuth callback)
            if (isLoggedIn && user) {
                setIsCheckingAuth(false);
                return;
            }

            // Check localStorage - prioritize this for OAuth flow
            const localIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            const userStr = localStorage.getItem("user");
            const hasUser = userStr && userStr !== "null" && userStr !== "undefined";

            if (localIsLoggedIn && hasUser) {
                try {
                    const parsedUser = JSON.parse(userStr);
                    if (parsedUser && parsedUser.id) {
                        dispatch(login({ user: parsedUser, expiresIn: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() }));
                        setIsCheckingAuth(false);
                        return;
                    }
                } catch (e) {
                    console.log("Failed to parse user from localStorage");
                }
            }

            // If we just completed OAuth but localStorage isn't ready, wait a bit
            if (justCompletedOAuth) {
                await new Promise(resolve => setTimeout(resolve, 500));

                // Re-check localStorage after waiting
                const retryLocalIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
                const retryUserStr = localStorage.getItem("user");
                const retryHasUser = retryUserStr && retryUserStr !== "null" && retryUserStr !== "undefined";

                if (retryLocalIsLoggedIn && retryHasUser) {
                    try {
                        const parsedUser = JSON.parse(retryUserStr);
                        if (parsedUser && parsedUser.id) {
                            dispatch(login({ user: parsedUser, expiresIn: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() }));
                            setIsCheckingAuth(false);
                            return;
                        }
                    } catch (e) {
                        console.log("Failed to parse user from localStorage on retry");
                    }
                }
            }

            // If no localStorage data, check with server
            try {
                const response = await api.get("/auth/getDetails", {
                    withCredentials: true,
                });

                if (response.status === 200 && response.data.payload) {
                    const { payload, expiresIn } = response.data;
                    dispatch(login({ user: payload, expiresIn }));
                    setIsCheckingAuth(false);
                    return;
                }
            } catch (error) {
                console.log("Feed: Auth check failed, redirecting to login");
            }

            // Not authenticated - redirect to login
            router.replace("/login");
        };

        // Run immediately - the full page reload from callback ensures state is fresh
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
