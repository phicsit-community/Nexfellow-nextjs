"use client";

import { useEffect, useRef } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useSelector, useDispatch } from "react-redux";
import api from "@/lib/axios";
import { initializeSocket } from "@/utils/socket";
import { login, logout, setAuthLoading } from "@/store/slices/authSlice";

/**
 * Bridges Clerk auth state into Redux and initializes the socket connection.
 *
 * Flow:
 *  1. Clerk detects the signed-in session.
 *  2. We call /auth/getDetails (protected by requireAuth) to get the MongoDB user record.
 *  3. Redux is populated with the MongoDB user data (id, username, picture, isOnboarded, etc.).
 *  4. A cookie is set for the Next.js middleware onboarding check.
 *  5. Socket is opened once the MongoDB user id is known.
 *
 * If the backend is unreachable (network error), we sign out of Clerk so the user
 * gets a clean sign-in form instead of an infinite redirect loop.
 */
export default function ClientInitializer() {
    const { isSignedIn, isLoaded } = useAuth();
    const { signOut } = useClerk();
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const initializedRef = useRef(false);
    // Track previous isSignedIn to detect true→false transition (sign-out event)
    const prevIsSignedIn = useRef(undefined);

    useEffect(() => {
        if (!isLoaded) return;

        const initializeAuth = async () => {
            if (!isSignedIn) {
                const wasSignedIn = prevIsSignedIn.current;
                prevIsSignedIn.current = false;
                dispatch(logout());
                dispatch(setAuthLoading(false));
                // Hard redirect only on sign-out event (not on initial unauthenticated load)
                if (wasSignedIn === true) {
                    window.location.replace("/");
                }
                return;
            }
            prevIsSignedIn.current = true;

            // Already have user data from a previous render
            if (user?.id) {
                dispatch(setAuthLoading(false));
                return;
            }

            // Prevent double-fetch on StrictMode double-invoke
            if (initializedRef.current) return;
            initializedRef.current = true;

            try {
                const response = await api.get("/auth/getDetails", { withCredentials: true });

                if (response.status === 200 && response.data.payload) {
                    const { payload } = response.data;
                    dispatch(login({ user: payload }));

                    // Set isOnboarded cookie so Next.js middleware can redirect to /onboarding
                    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
                    document.cookie = `isOnboarded=${payload.isOnboarded ? "true" : "false"};expires=${expires};path=/;SameSite=Lax`;
                }
            } catch (error) {
                const isNetworkDown = !error.response; // no response = backend unreachable
                const isNotFound = error.response?.status === 401;

                if (isNetworkDown) {
                    // Backend is unreachable — sign out of Clerk so the user gets a clean
                    // sign-in form instead of looping: Clerk-session → dashboard → landing.
                    console.warn("ClientInitializer: backend unreachable, signing out to prevent redirect loop");
                    dispatch(logout());
                    await signOut();
                } else if (isNotFound) {
                    // 401 means Clerk session valid but user not in MongoDB yet
                    // (webhook may still be propagating). Don't sign out — let them retry.
                    console.log("ClientInitializer: user not found in MongoDB yet, will retry on next load");
                    dispatch(setAuthLoading(false));
                } else {
                    console.log("ClientInitializer: Failed to fetch user details:", error.message);
                    dispatch(setAuthLoading(false));
                }
            } finally {
                dispatch(setAuthLoading(false));
                initializedRef.current = false;
            }
        };

        initializeAuth();
    }, [isSignedIn, isLoaded, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

    // Open socket once Redux has the MongoDB user id
    useEffect(() => {
        if (user?.id) {
            initializeSocket(user.id);
        }
    }, [user?.id]);

    return null;
}
