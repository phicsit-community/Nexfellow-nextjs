"use client";

import { useEffect, useState } from "react";
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
    const { isLoggedIn, isAuthLoading } = useSelector((state) => state.auth);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // Check localStorage first
            const localIsLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            const userStr = localStorage.getItem("user");
            const hasUser = userStr && userStr !== "null" && userStr !== "undefined";

            if (localIsLoggedIn && hasUser) {
                setIsCheckingAuth(false);
                return;
            }

            // If no localStorage data, check with server (handles OAuth redirect)
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

        checkAuth();
    }, [dispatch, router]);

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
