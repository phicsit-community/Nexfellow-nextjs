"use client";

import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import EventDetails from "@/Pages/Event/EventDetails";
import ViewOnlyEvent from "@/Pages/ViewOnly/ViewOnlyEvent";
import PrivateLayout from "@/layouts/PrivateLayout";
import ViewOnlyHeader from "@/Pages/ViewOnly/ViewOnlyHeader";

export default function EventPage() {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            if (isAuthenticated && user) {
                setIsLoggedIn(true);
                setIsLoading(false);
                return;
            }

            const cookies = document.cookie.split(';').reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split('=');
                acc[key] = value;
                return acc;
            }, {});

            if (cookies.isLoggedIn === 'true' || cookies.token || cookies.accessToken) {
                setIsLoggedIn(true);
            }

            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token') || localStorage.getItem('accessToken');
            if (storedUser || storedToken) {
                setIsLoggedIn(true);
            }

            setIsLoading(false);
        };

        const timer = setTimeout(checkAuth, 100);
        return () => clearTimeout(timer);
    }, [isAuthenticated, user]);

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
                margin: 0,
                padding: 0
            }}>
                <ViewOnlyHeader />
                <div style={{ flex: 1, overflow: 'hidden', minHeight: 0, background: '#000' }}>
                    <ViewOnlyEvent />
                </div>
            </div>
        );
    }

    return (
        <PrivateLayout>
            <EventDetails />
        </PrivateLayout>
    );
}
