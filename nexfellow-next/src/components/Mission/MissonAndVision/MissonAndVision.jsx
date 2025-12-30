import React from "react";
import styles from "./MissonAndVision.module.css";
import mission from "./assets/mission.svg";
import vision from "./assets/vision.svg";
import { FaArrowRight } from "react-icons/fa";

const MissonAndVision = () => {
  return (
    <section className={styles.section}>
      <div className={styles.tag}>⭐ Our Foundation</div>

      <h2 className={styles.heading}>
        Mission <span className={styles.highlight}>&</span> Vision
      </h2>
      <p className={styles.subheading}>
        Discover what drives us forward and where we're headed together
      </p>

      <div className={styles.cardContainer}>
        {/* Mission Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <img src={mission} className={styles.icon} />
              <div>
                <h3 className={styles.cardTitle}>Mission</h3>
                <p className={`${styles.cardSubtitle} ${styles.missionsub} `}>
                  What We Do
                </p>
              </div>
            </div>
            <div className={styles.iconContainer}>
              <FaArrowRight className={styles.arrowIcon} />
            </div>
          </div>
          <p className={styles.cardDescription}>
            In 2025, success isn't built alone—it flourishes within communities.
            NexFellow empowers students, startups, and businesses to create,
            grow, and monetize powerful communities that drive innovation.
          </p>
          <ul className={styles.bulletList}>
            <li>
              <strong>Connect:</strong> Bridge the gap between brilliant minds
              worldwide
            </li>
            <li>
              <strong>Collaborate:</strong> Provide tools for meaningful
              partnership
            </li>
            <li>
              <strong>Create:</strong> Transform ideas into thriving ecosystems
            </li>
          </ul>
          <div className={styles.cardFooter}>
            <div>
              <span className={styles.metric}>1M+</span>
              <span className={styles.label}>Target Communities</span>
            </div>
            <div>
              <span className={styles.infinity}>∞</span>
              <span className={styles.label}>Possibilities</span>
            </div>
          </div>
        </div>

        {/* Vision Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <img src={vision} className={styles.icon} />
              <div>
                <h3 className={styles.cardTitle}>Vision</h3>
                <p className={`${styles.cardSubtitle} ${styles.visionsub}`}>
                  Where We're Going
                </p>
              </div>
            </div>
            <div className={styles.iconContainer}>
              <FaArrowRight className={styles.arrowIcon} />
            </div>
          </div>
          <p className={styles.cardDescription}>
            We envision a world with one million vibrant virtual communities,
            each driven by shared purpose, innovative thinking, and an
            unwavering commitment to collective progress.
          </p>
          <ul className={styles.bulletList}>
            <li>
              <strong>Ecosystems:</strong> Where ideas are nurtured and
              opportunities unlocked
            </li>
            <li>
              <strong>Inclusivity:</strong> Regardless of background, geography,
              or experience
            </li>
            <li>
              <strong>Partnership:</strong> Building together, not just
              networking
            </li>
          </ul>
          <div className={styles.cardFooter}>
            <div className={styles.futureNote}>
              The Future Is{" "}
              <span className={styles.emphasis}>Built By Communities</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.colorLine}></div>
    </section>
  );
};

export default MissonAndVision;
