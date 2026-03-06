"use client";

import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import ViewCommunity from "@/Pages/Community/ViewCommunity";
import ViewOnlyExplore from "@/Pages/ViewOnly/ViewOnlyExplore";
import PrivateLayout from "@/layouts/PrivateLayout";
import ViewOnlyHeader from "@/Pages/ViewOnly/ViewOnlyHeader";

export default function CommunityPage() {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check multiple sources for authentication
        const checkAuth = () => {
            // Check Redux state
            if (isAuthenticated && user) {
                setIsLoggedIn(true);
                setIsLoading(false);
                return;
            }

            // Check cookies
            const cookies = document.cookie.split(';').reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split('=');
                acc[key] = value;
                return acc;
            }, {});

            if (cookies.isLoggedIn === 'true' || cookies.token || cookies.accessToken) {
                setIsLoggedIn(true);
            }

            // Check localStorage
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token') || localStorage.getItem('accessToken');
            if (storedUser || storedToken) {
                setIsLoggedIn(true);
            }

            setIsLoading(false);
        };

        // Small delay to allow Redux to hydrate
        const timer = setTimeout(checkAuth, 100);
        return () => clearTimeout(timer);
    }, [isAuthenticated, user]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#000'
            }}>
                <div style={{ color: '#fff' }}>Loading...</div>
            </div>
        );
    }

    // Show view-only page for unauthenticated users
    if (!isLoggedIn) {
        return (
            <div style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                width: '100vw', 
                height: '100vh', 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                background: '#000',
                margin: 0,
                padding: 0
            }}>
                <ViewOnlyHeader />
                <ViewOnlyExplore />
            </div>
        );
    }

    return (
        <PrivateLayout>
            <ViewCommunity />
        </PrivateLayout>
    );
}
