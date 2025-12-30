"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Hero.module.css";
import gridPattern from "./assets/grid.webp";
import herotextDesktop from "./assets/hero.svg";
import herotextMobile from "./assets/hero-mobile.svg";
import Navbar from "../Navbar/Navbar";

const HeroSection = () => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleGetStartedClick = () => {
    router.push("/signup");
  };

  return (
    <>
      <section className={styles.heroSection}>
        <Navbar />
        <img src={gridPattern.src || gridPattern} alt="" className={styles.gridImage} />

        <div className={styles.content}>
          <img
            src={isMobile ? (herotextMobile.src || herotextMobile) : (herotextDesktop.src || herotextDesktop)}
            alt="Geek Clash"
            className={styles.heroText}
          />

          <p className={styles.subText}>
            NexFellow unites geeks through communities, sparking meaningful
            connections and collaboration. We believe in the power of community
            building.{" "}
          </p>

          <button
            className={styles.getStartedBtn}
            onClick={handleGetStartedClick}
          >
            Get Started
            <div className={styles.getStartedBtnArrow}>➔</div>
          </button>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
