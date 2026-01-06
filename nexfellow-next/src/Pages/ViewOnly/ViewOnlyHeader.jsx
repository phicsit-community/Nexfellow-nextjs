"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// assets
import navbarlogo from "./assets/NexFellowLogo.svg";

// styles
import styles from "./ViewOnlyHeader.module.css";

const ViewOnlyHeader = () => {
    const pathname = usePathname();
    const [menuActive, setMenuActive] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const isLoggedin = localStorage.getItem("isLoggedIn");
            setIsLoggedIn(isLoggedin === "true");
            const userData = JSON.parse(localStorage.getItem("user"));
            setUsername(userData?.username);
        }
    }, []);

    const toggleMenu = () => {
        setMenuActive((prev) => !prev);
    };

    return (
        <div className={`${styles.navbar} ${menuActive ? styles.menuActive : ""}`}>
            <div className={styles.navbarContent}>
                <div className={styles.navbarLogo}>
                    <Link href="/">
                        <img src={navbarlogo?.src || navbarlogo} alt="NexFellow Logo" />
                    </Link>

                    <button
                        className={styles.mobileMenuButton}
                        onClick={toggleMenu}
                        aria-label="Toggle navigation menu"
                        aria-expanded={menuActive}
                    >
                        &#9776;
                    </button>
                </div>

                <div className={styles.navbarActions}>
                    <div className={styles.navbarLinks}>
                        {/* <Link to="/" className={styles.navbarLink}>
                            Overview
                        </Link>
                        <Link to="/" className={styles.navbarLink}>
                            Analytics
                        </Link>
                        <Link to="/mission" className={styles.navbarLink}>
                            Mission
                        </Link>
                        <Link to="/blogs" className={styles.navbarLink}>
                            Blogs
                        </Link> */}
                    </div>

                    {isLoggedIn && username ? (
                        <Link href={`/dashboard/${username}`} className={styles.navbarButton}>
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href="/signup" className={styles.navbarActionLink}>
                                Register
                            </Link>
                            <Link href="/login" className={styles.navbarButton}>
                                Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewOnlyHeader;
