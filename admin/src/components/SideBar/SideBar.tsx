'use client';

import React, { useState, useEffect, useCallback } from "react";
import styles from "./SideBar.module.css";
import { useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { clearUser } from "@/slices/userSlice";

// Icons
import {
    FiUsers,
    FiFileText,
    FiBell,
    FiBarChart2,
    FiUserPlus,
    FiGlobe,
    FiCheckCircle,
    FiSend,
    FiLogOut,
    FiBookOpen,
    FiMenu,
    FiX,
} from "react-icons/fi";

import { MdOutlineCampaign } from "react-icons/md";

const SideBar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();

    // Start with null to avoid hydration mismatch
    const [isMobile, setIsMobile] = useState<boolean | null>(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Check if mobile - runs only on client after mount
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMobileOpen(false);
            }
        };

        // Initial check
        checkMobile();

        // Add resize listener
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close sidebar on route change (mobile only)
    useEffect(() => {
        if (isMobile) {
            setIsMobileOpen(false);
        }
    }, [pathname, isMobile]);

    const handleLogout = useCallback(() => {
        dispatch(clearUser());
        localStorage.clear();
        router.push("/login");
    }, [dispatch, router]);

    const isActive = (path: string) => pathname === path;

    const toggleMobileSidebar = () => {
        setIsMobileOpen(prev => !prev);
    };

    // Don't render until we know if it's mobile or not (prevents hydration mismatch)
    if (isMobile === null) {
        // Return the desktop version by default (server render matches this)
        return (
            <div className={styles.sidebar}>
                <div className={styles.logoDiv}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        className={styles.geekLogo}
                        src="/images/Navbar/NexFellowLogoDark.svg"
                        alt="NexFellow Logo"
                        style={{ height: '34px', width: 'auto' }}
                    />
                </div>
                <div className={styles.sideContainer}>
                    <div className={styles.sidebarUpper}>
                        <NavLinks isActive={isActive} />
                    </div>
                    <div className={styles.sidebarLower}>
                        {/* Logout button removed */}
                    </div>
                </div>
            </div>
        );
    }

    // Mobile View
    if (isMobile) {
        return (
            <>
                {/* Mobile Header */}
                <div className={styles.mobileHeader}>
                    <button
                        className={styles.hamburger}
                        onClick={toggleMobileSidebar}
                        aria-label="Toggle menu"
                    >
                        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/Navbar/NexFellowLogoDark.svg"
                        alt="NexFellow Logo"
                        style={{ height: '35px', width: 'auto' }}
                        className={styles.mobileLogo}
                    />
                    <div className={styles.mobileHeaderSpacer} />
                </div>

                {/* Mobile Overlay */}
                {isMobileOpen && (
                    <div
                        className={styles.overlay}
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}

                {/* Mobile Sidebar */}
                <div className={`${styles.sidebar} ${styles.mobileSidebar} ${isMobileOpen ? styles.mobileOpen : ''}`}>
                    <div className={styles.logoDiv}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            className={styles.geekLogo}
                            src="/images/Navbar/NexFellowLogoDark.svg"
                            alt="NexFellow Logo"
                            style={{ height: '40px', width: 'auto' }}
                        />
                        <button
                            className={styles.closeBtn}
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className={styles.sideContainer}>
                        <div className={styles.sidebarUpper}>
                            <NavLinks isActive={isActive} />
                        </div>

                        <div className={styles.sidebarLower}>
                            {/* Logout button removed */}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Desktop View
    return (
        <div className={styles.sidebar}>
            <div className={styles.logoDiv}>
                <Image
                    className={styles.geekLogo}
                    src="/images/Navbar/NexFellowLogoDark.svg"
                    alt="NexFellow Logo"
                    width={150}
                    height={34}
                />
            </div>
            <div className={styles.sideContainer}>
                <div className={styles.sidebarUpper}>
                    <NavLinks isActive={isActive} />
                </div>
                <div className={styles.sidebarLower}>
                    {/* Logout button removed */}
                </div>
            </div>
        </div>
    );
};

// Separate NavLinks component for reusability
function NavLinks({ isActive }: { isActive: (path: string) => boolean }) {
    return (
        <>
            <Link
                href="/users"
                className={`${styles.navLink} ${isActive('/users') ? styles.active : ''}`}
            >
                <FiUsers className={styles.sideIcon} />
                <p>Users</p>
            </Link>

            <Link
                href="/blogs"
                className={`${styles.navLink} ${isActive('/blogs') ? styles.active : ''}`}
            >
                <FiBookOpen className={styles.sideIcon} />
                <p>Blog</p>
            </Link>

            <Link
                href="/posts"
                className={`${styles.navLink} ${isActive('/posts') ? styles.active : ''}`}
            >
                <FiFileText className={styles.sideIcon} />
                <p>Posts</p>
            </Link>

            <Link
                href="/notifications"
                className={`${styles.navLink} ${isActive('/notifications') ? styles.active : ''}`}
            >
                <FiBell className={styles.sideIcon} />
                <p>Notifications</p>
            </Link>

            <Link
                href="/analytics"
                className={`${styles.navLink} ${isActive('/analytics') ? styles.active : ''}`}
            >
                <FiBarChart2 className={styles.sideIcon} />
                <p>Analytics</p>
            </Link>

            <Link
                href="/referrals"
                className={`${styles.navLink} ${isActive('/referrals') ? styles.active : ''}`}
            >
                <FiUserPlus className={styles.sideIcon} />
                <p>Referrals</p>
            </Link>

            <Link
                href="/advertisements"
                className={`${styles.navLink} ${isActive('/advertisements') ? styles.active : ''}`}
            >
                <MdOutlineCampaign className={styles.sideIcon} />
                <p>Advertisements</p>
            </Link>

            <Link
                href="/featured-communities"
                className={`${styles.navLink} ${isActive('/featured-communities') ? styles.active : ''}`}
            >
                <FiGlobe className={styles.sideIcon} />
                <p>All Communities</p>
            </Link>

            <Link
                href="/verifications"
                className={`${styles.navLink} ${isActive('/verifications') ? styles.active : ''}`}
            >
                <FiCheckCircle className={styles.sideIcon} />
                <p>Verifications</p>
            </Link>

            <div className={styles.geekMailerDiv}>
                <FiSend className={styles.sideIcon} />
                <a
                    href="http://localhost:3001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.geekMailerTag}
                >
                    Geek Mail
                </a>
            </div>
        </>
    );
}

export default SideBar;
