"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { initializeSocket } from "@/utils/socket";
import Header from "@/components/Header/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import style from "./PrivateLayout.module.css";

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
        <div className={style.container}>
            <Header />
            <div className={style.main}>
                <div className={style.sidebar}>
                    <Sidebar />
                </div>
                <div className={style.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}
