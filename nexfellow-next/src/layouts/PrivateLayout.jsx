"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { initializeSocket } from "@/utils/socket";
import Sidebar from "@/components/Sidebar/Sidebar";
import PageHeader from "@/components/Header/PageHeader";
import style from "./PrivateLayout.module.css";

// Pages where PageHeader should NOT appear
const EXCLUDED_PATHS = ["/feed", "/notifications", "/launches", "/my-products"];

export default function PrivateLayout({ children }) {
    const user = useSelector((state) => state.auth.user);
    const pathname = usePathname();

    // Initialize socket connection on user presence
    useEffect(() => {
        if (user?.id) {
            console.log("PrivateLayout: Initializing socket for user:", user.id);
            initializeSocket(user.id);
        }
    }, [user]);

    return (
        <div className={style.container}>
            <div className={style.main}>
                <div className={style.sidebar}>
                    <Sidebar />
                </div>
                <div className={style.content}>
                    {!EXCLUDED_PATHS.some(path => pathname === path || pathname?.startsWith(path + "/")) && (
                        <PageHeader />
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}
