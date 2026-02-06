"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";
import ThemeToggleButton from "../ThemeToggle/ThemeToggleButton";
import ModeratedDropdown from "../Header/ModeratedDropdown";

import styles from "./ProfileDropdown.module.css";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Users, LogOut, LayoutDashboard } from "lucide-react";

function ProfileDropdown() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [error, setError] = useState(null);
    const [moderated, setModerated] = useState([]);
    const router = useRouter();
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!isLoggedIn) return;
            setLoading(true);
            setError(null);
            try {
                const userData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;
                const userId = userData?.id;
                const username = userData?.username;

                if (!userId || !username) throw new Error("Invalid user data");

                const response = await api.get(`/user/profile`);
                setUser(response.data);
            } catch (err) {
                setError("Failed to load user data: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchModerated = async () => {
            if (!isLoggedIn) return;
            try {
                const res = await api.get("/community/moderator/communities");
                setModerated(res.data.communities || []);
            } catch (e) {
                console.error("Error fetching moderated communities:", e);
            }
        };

        if (isLoggedIn) {
            fetchUserData();
            fetchModerated();
        }
    }, [isLoggedIn]);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);

        try {
            const response = await api.get("/user/logout", {
                withCredentials: true,
            });

            if (response.status === 200) {
                localStorage.clear();
                sessionStorage.clear();

                document.cookie.split(";").forEach((c) => {
                    document.cookie = c
                        .replace(/^ +/, "")
                        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });

                router.push("/login");
            } else {
                console.error("Logout failed:", response.data.message);
                setIsLoggingOut(false);
            }
        } catch (error) {
            console.error("Error during logout:", error.message);
            setIsLoggingOut(false);
        }
    };

    const getInitials = (name) => {
        return name?.charAt(0).toUpperCase() || "U";
    };

    if (loading) {
        return (
            <div className={`${styles.profileLink} ${styles.skeleton}`}>
                <div className={`${styles.skeletonCircle} ${styles.shimmer}`}></div>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className={styles.profileLink}>
                    {user?.profilePhoto && !error ? (
                        <>
                            <img
                                className={styles.dp}
                                src={user.profilePhoto}
                                alt={user.name || "User"}
                                onError={(e) => {
                                    e.target.parentElement.classList.add(styles.initials);
                                    e.target.parentElement.textContent = getInitials(user.name);
                                }}
                            />
                            <span className={styles.statusDot}></span>
                        </>
                    ) : (
                        <div className={styles.initials}>
                            {getInitials(user?.name)}
                        </div>
                    )}
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className={`${styles.menuContent} w-72 p-0 mt-3`}
            >
                <Link
                    href={user?.username ? `/dashboard/${user.username}` : "#"}
                    className={styles.profileHeader}
                >
                    <div className={styles.avatar}>
                        {user?.profilePhoto ? (
                            <img src={user.profilePhoto} alt="Avatar" />
                        ) : (
                            <span className={styles.avatarInitials}>
                                {getInitials(user?.name)}
                            </span>
                        )}
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.name}</span>
                        <span className={styles.userHandle}>@{user?.username}</span>
                    </div>
                </Link>

                <div className={styles.section}>
                    <div className={styles.sectionLabel}>Appearance</div>
                    <DropdownMenuItem asChild className={styles.menuItem}>
                        <ThemeToggleButton />
                    </DropdownMenuItem>
                </div>

                <div className={styles.section}>
                    <ModeratedDropdown
                        moderated={moderated}
                        getInitials={getInitials}
                    />
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionLabel}>Navigation</div>
                    <DropdownMenuItem asChild className={styles.menuItem}>
                        <Link href={user?.username ? `/dashboard/${user.username}` : "#"}>
                            <LayoutDashboard className={`dark:text-white ${styles.icon}`} />
                            Dashboard
                        </Link>
                    </DropdownMenuItem>

                    {user?.isCommunityAccount && user?.createdCommunity ? (
                        <DropdownMenuItem asChild className={styles.menuItem}>
                            <Link href={`/community/${user?.username}`}>
                                <Users className={styles.icon} />
                                View as a member
                            </Link>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem asChild className={styles.menuItem}>
                            <Link href={`/user/${user?.username}`}>
                                <Users className={`dark:text-white ${styles.icon}`} />
                                My Profile
                            </Link>
                        </DropdownMenuItem>
                    )}
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionLabel}>Account</div>
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            handleLogout();
                        }}
                        disabled={isLoggingOut}
                        className={`${styles.menuItem} ${styles.logout}`}
                    >
                        <LogOut className={styles.logoutIcon} />
                        {isLoggingOut ? "Logging out..." : "Logout"}
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default ProfileDropdown;
