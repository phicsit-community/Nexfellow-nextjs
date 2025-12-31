"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// assets
import navbarlogo from "./assets/NexFellowLogo.svg";

// styles
import styles from "./Navbar.module.css";

const Navbar = () => {
  const pathname = usePathname();
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => {
    setMenuActive((prev) => !prev);
  };

  return (
    <div className={`${styles.navbar} ${menuActive ? styles.menuActive : ""}`}>
      <div className={styles.navbarContent}>
        <div className={styles.navbarLogo}>
          <Link href="/">
            <img src={navbarlogo.src || navbarlogo} alt="NexFellow Logo" />
          </Link>

          <button
            className={styles.mobileMenuButton}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={menuActive}
          >
            <span className={styles.hamburgerIcon}></span>
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
          <Link href="/login" className={styles.navbarActionLink}>
            Log In
          </Link>
          <Link href="/signup" className={styles.navbarButton}>
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
