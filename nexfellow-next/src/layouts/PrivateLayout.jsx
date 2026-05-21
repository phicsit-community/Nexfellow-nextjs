"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { initializeSocket } from "@/utils/socket";
import Sidebar from "@/components/Sidebar/Sidebar";
import PageHeader from "@/components/Header/PageHeader";
import style from "./PrivateLayout.module.css";

// Pages where PageHeader should NOT appear
const EXCLUDED_PATHS = ["/feed", "/notifications"];

export default function PrivateLayout({ children, hideSidebar = false }) {
    const user = useSelector((state) => state.auth.user);
    const pathname = usePathname();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Initialize socket connection on user presence
    useEffect(() => {
        if (user?.id) {
            console.log("PrivateLayout: Initializing socket for user:", user.id);
            initializeSocket(user.id);
        }
    }, [user]);

    // Close drawer on route change
    useEffect(() => {
        setMobileNavOpen(false);
    }, [pathname]);

    return (
        <div className={style.container}>
            <div className={style.main}>
                {!hideSidebar && (
                    <>
                        {mobileNavOpen && (
                            <div
                                className={style.drawerBackdrop}
                                onClick={() => setMobileNavOpen(false)}
                            />
                        )}
                        <div className={style.sidebar}>
                            <Sidebar
                                isDrawerOpen={mobileNavOpen}
                                onClose={() => setMobileNavOpen(false)}
                            />
                        </div>
                    </>
                )}
                <div className={style.content}>
                    {!EXCLUDED_PATHS.some(path => pathname === path || pathname?.startsWith(path + "/")) && (
                        <PageHeader onMenuToggle={() => setMobileNavOpen(v => !v)} />
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}
