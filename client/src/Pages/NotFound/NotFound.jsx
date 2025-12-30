import React from "react";

import { useNavigate } from "react-router-dom"; // For navigation
import styles from "./NotFound.module.css";
import logo from "./assets/Logo.svg";
import mainLogo from "./assets/Container.svg";
import home from "./assets/home.svg";
import Logo from "./assets/Logo.svg";
import refresh from "./assets/refresh.svg";
import support from "./assets/support.svg";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go to previous page
  };

  const handleGoHome = () => {
    navigate("/"); // Redirect to home page
  };

  const handleRefresh = () => {
    window.location.reload(); // Reload the page
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <img src={logo} alt="Logo" width={40} height={40} />
        </div>
        <h1 className={styles.heading}>404</h1>
        <h2 className={styles.subheading}>Oops! Page Not Found</h2>
        <p className={styles.text}>
          The page you're looking for seems to have wandered off into the
          digital void.
        </p>
        <div className={styles.buttons}>
          <button
            className={`${styles.btn} ${styles.back}`}
            onClick={() => {
              handleGoBack();
            }}
          >
            ← Go Back
          </button>
          <button
            className={`${styles.btn} ${styles.home}`}
            onClick={() => {
              handleGoHome();
            }}
          >
            <img src={home} />
            Back to Home
          </button>
        </div>
        <div className={styles.options}>
          <span
            className={styles.optionsspan1}
            onClick={() => {
              handleRefresh();
            }}
          >
            <img src={refresh} /> Refresh
          </span>
          <span>
            <img src={support} /> Support
          </span>
        </div>
      </div>

      <div className={styles.right}>
        <img src={mainLogo} alt="404 Illustration" />
      </div>
    </div>
  );
};

export default NotFound;
