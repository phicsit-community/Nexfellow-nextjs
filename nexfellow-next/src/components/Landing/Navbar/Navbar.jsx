"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// assets
import navbarlogo from "./assets/NexFellowLogo.svg";

// styles
import styles from "./Navbar.module.css";
import Hamburger from "hamburger-react";

const Navbar = () => {
  const pathname = usePathname();
  const [menuActive, setMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Check if user is logged in (client-side only)
    const isLoggedin = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(isLoggedin === "true");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUsername(userData?.username || "");
  }, []);

  const toggleMenu = () => {
    setMenuActive((prev) => !prev);
  };

  return (
    <div className={`${styles.navbar} ${menuActive ? styles.menuActive : ""}`}>
      <div className={styles.navbarContent}>
        <div className={styles.navbarLogo}>
          <Link href="/">
            <img src={typeof navbarlogo === 'string' ? navbarlogo : navbarlogo.src} alt="NexFellow Logo" />
          </Link>

          <button
            className={styles.mobileMenuButton}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={menuActive}
          >
            <Hamburger size={24} />
          </button>
        </div>

        <div className={styles.navbarActions}>
          <div className={styles.navbarLinks}>
            <Link href="/" className={styles.navbarLink}>
              Overview
            </Link>
            <Link href="/" className={styles.navbarLink}>
              Analytics
            </Link>
            <Link href="/mission" className={styles.navbarLink}>
              Mission
            </Link>
            <Link href="/blogs" className={styles.navbarLink}>
              Blogs
            </Link>
          </div>

          {isLoggedIn ? (
            <Link href={`/dashboard/${username}`} className={styles.navbarButton}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className={styles.navbarActionLink}>
                Log In
              </Link>
              <Link href="/signup" className={styles.navbarButton}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
