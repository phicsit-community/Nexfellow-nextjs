"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "./NotFound.module.css";
import logo from "./assets/Logo.svg";
import mainLogo from "./assets/Container.svg";
import home from "./assets/home.svg";
import refresh from "./assets/refresh.svg";
import support from "./assets/support.svg";

const NotFound = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <img src={logo.src || logo} alt="Logo" width={40} height={40} />
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
            onClick={handleGoBack}
          >
            ← Go Back
          </button>
          <button
            className={`${styles.btn} ${styles.home}`}
            onClick={handleGoHome}
          >
            <img src={home.src || home} alt="home" />
            Back to Home
          </button>
        </div>
        <div className={styles.options}>
          <span className={styles.optionsspan1} onClick={handleRefresh}>
            <img src={refresh.src || refresh} alt="refresh" /> Refresh
          </span>
          <span>
            <img src={support.src || support} alt="support" /> Support
          </span>
        </div>
      </div>

      <div className={styles.right}>
        <img src={mainLogo.src || mainLogo} alt="404 Illustration" />
      </div>
    </div>
  );
};

export default NotFound;
