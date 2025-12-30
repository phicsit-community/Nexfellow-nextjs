"use client";

import { useRouter } from "next/navigation";
import styles from "./GetVerified.module.css";
import validateIcon from "./assets/validate.webp";
import credibilityIcon from "./assets/credibility.webp";
import collaborationIcon from "./assets/collaboration.webp";
import arrowIcon from "./assets/arrow.webp";
import illustration from "./assets/illustration.svg";

const GetVerified = () => {
  const router = useRouter();

  const handleGetStartedClick = () => {
    router.push("/signup");
  };

  return (
    <section
      className={styles.getVerified}
      style={{ marginBottom: "2rem", maxWidth: "1150px" }}
    >
      <div className={styles.container}>
        <div className={styles.content}>
          <h2>
            <span className={styles.highlight}>Get Verified</span> to
            supercharge your experience
          </h2>
          <ul className={styles.features}>
            <li>
              <img src={validateIcon.src || validateIcon} alt="Validate" />
              Validate your professional identity
            </li>
            <li>
              <img src={credibilityIcon.src || credibilityIcon} alt="Credibility" />
              Increase credibility for published content
            </li>
            <li>
              <img src={collaborationIcon.src || collaborationIcon} alt="Collaboration" />
              Enhance collaboration opportunities
            </li>
          </ul>
          <button className={styles.cta} onClick={handleGetStartedClick}>
            <span>Get Started</span>
            <img className={styles.ctaArrow} src={arrowIcon.src || arrowIcon} alt="Arrow" />
          </button>
        </div>
        <div className={styles.illustration}>
          <img
            className={styles.illustrationImg}
            src={illustration.src || illustration}
            alt="Boy character and Labels"
          />
        </div>
      </div>
    </section>
  );
};

export default GetVerified;
