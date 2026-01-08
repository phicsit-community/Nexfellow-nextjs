import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

// assets
import navbarlogo from "./assets/NexFellowLogo.svg";

// styles
import styles from "./Navbar.module.css";
import Hamburger from "hamburger-react";

const Navbar = () => {
  const isLoginPage = useLocation();
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => {
    setMenuActive((prev) => !prev);
  };

  // Check if user is logged in
  const isLoggedin = localStorage.getItem("isLoggedIn");
  const isLoggedIn = isLoggedin === "true" ? true : false;
  let userData = null;
  try {
    const userStr = localStorage.getItem("user");
    if (userStr && userStr !== "undefined") {
      userData = JSON.parse(userStr);
    }
  } catch (error) {
    console.error("Error parsing user data:", error);
  }
  const username = userData?.username;
  return (
    <div className={`${styles.navbar} ${menuActive ? styles.menuActive : ""}`}>
      <div className={styles.navbarContent}>
        <div className={styles.navbarLogo}>
          <Link to="/">
            <img src={navbarlogo} alt="NexFellow Logo" />
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
            <Link to="/" className={styles.navbarLink}>
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
            </Link>
          </div>

          {isLoggedIn ? (
            <Link to={`/dashboard/${username}`} className={styles.navbarButton}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className={styles.navbarActionLink}>
                Log In
              </Link>
              <Link to="/signup" className={styles.navbarButton}>
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
