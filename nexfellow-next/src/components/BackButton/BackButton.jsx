"use client";

import { useRouter } from "next/navigation";

// styles
import styles from "./BackButton.module.css";

// assets
import backBtn from "./assets/ArrowLeft.svg";

const BackButton = ({ text = "Back", showText = true, smallText = false }) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <button
      className={`${styles.backButton} ${smallText ? styles.smallText : ""}`}
      onClick={handleBack}
    >
      <img src={backBtn.src || backBtn} alt="Back" />
      {showText && <p className={styles.text}>{text}</p>}
    </button>
  );
};

export default BackButton;
