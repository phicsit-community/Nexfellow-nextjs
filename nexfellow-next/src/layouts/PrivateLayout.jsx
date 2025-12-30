"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { initializeSocket } from "@/utils/socket";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";

export default function PrivateLayout({ children }) {
    const user = useSelector((state) => state.auth.user);

    // Initialize socket connection on user presence
    useEffect(() => {
        if (user?.id) {
            console.log("PrivateLayout: Initializing socket for user:", user.id);
            initializeSocket(user.id);
        }
    }, [user]);

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
