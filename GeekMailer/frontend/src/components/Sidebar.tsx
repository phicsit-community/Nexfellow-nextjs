"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearUser } from "@/lib/store/slices/userSlice";
import { useRouter } from "next/navigation";
import {
    FiHome,
    FiMail,
    FiSend,
    FiUsers,
    FiList,
    FiHelpCircle,
    FiUser,
    FiLogOut,
} from "react-icons/fi";

interface MenuItem {
    path: string;
    icon: React.ReactNode;
    label: string;
}

export default function Sidebar() {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("");

    useEffect(() => {
        setActiveTab(pathname);
    }, [pathname]);

    const menuItems: MenuItem[] = [
        { path: "/", icon: <FiHome size={18} />, label: "Home" },
        { path: "/view-emails", icon: <FiMail size={18} />, label: "View Emails" },
        { path: "/send-email", icon: <FiSend size={18} />, label: "Send Emails" },
        { path: "/contact", icon: <FiUsers size={18} />, label: "Contact" },
        { path: "/lists", icon: <FiList size={18} />, label: "Lists" },
    ];

    const isActive = (path: string) => activeTab === path;

    const handleLogout = () => {
        dispatch(clearUser());
        localStorage.clear();
        router.push("/login");
    };

    return (
        <aside className="w-52 h-[calc(100vh-80px)] py-4 border-r border-gray-200 flex flex-col justify-between bg-white fixed top-20 bottom-0">
            {/* Main Navigation */}
            <nav className="px-3">
                <ul className="list-none p-0 m-0 flex flex-col gap-1">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                href={item.path}
                                onClick={() => setActiveTab(item.path)}
                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm font-medium rounded-lg transition-all duration-200 ${isActive(item.path)
                                    ? "bg-teal-500 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                <span className={isActive(item.path) ? "text-white" : "text-gray-500"}>
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Account Management Section */}
            <div className="px-3 pb-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">
                    Account Management
                </p>
                <ul className="list-none p-0 m-0 flex flex-col gap-1">
                    <li>
                        <Link
                            href="/help"
                            onClick={() => setActiveTab("/help")}
                            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-all duration-200"
                        >
                            <FiHelpCircle size={18} className="text-gray-500" />
                            <span>Help</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/profile"
                            onClick={() => setActiveTab("/profile")}
                            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-all duration-200"
                        >
                            <FiUser size={18} className="text-gray-500" />
                            <span>Profile</span>
                        </Link>
                    </li>
                    <li>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-teal-500 hover:bg-teal-50 rounded-lg text-sm font-medium w-full transition-all duration-200"
                        >
                            <FiLogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    );
}
