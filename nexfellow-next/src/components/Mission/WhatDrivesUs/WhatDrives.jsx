import styles from "./WhatDrives.module.css";
import card1 from "./assets/card1.svg";
import card2 from "./assets/card2.svg";
import card3 from "./assets/card3.svg";

const WhatDrives = () => {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        What <span className={styles.highlight}>Drives</span> Us?
      </h2>
      <p className={styles.description}>
        In a world where brilliant minds are scattered across the globe, we
        believe that innovation happens when passionate individuals connect,
        collaborate, and create together. We're not just building a platform—
        we're cultivating a movement where every idea has the potential to
        change the world, and every connection sparks limitless possibilities.
      </p>
      <div className={styles.cardContainer}>
        <div className={styles.card1}>
          <img src={card1} className={styles.icon} />
          <h3 className={styles.cardTitle}>Accelerate Dreams</h3>
          <p className={styles.cardText}>
            Every startup, every project, every wild idea deserves the right
            connections to turn possibilities into reality.
          </p>
        </div>
        <div className={styles.card2}>
          <img src={card2} className={styles.icon} />
          <h3 className={styles.cardTitle}>Ignite Innovation</h3>
          <p className={styles.cardText}>
            When diverse minds collide, magic happens. We create the spark that
            ignites breakthrough innovations.
          </p>
        </div>
        <div className={styles.card3}>
          <img src={card3} className={styles.icon} />
          <h3 className={styles.cardTitle}>Build Community</h3>
          <p className={styles.cardText}>
            Beyond transactions, we foster genuine relationships that last,
            support systems that endure, and communities that thrive.
          </p>
        </div>
      </div>
      <div className={styles.colorLine}></div>
    </section>
  );
};

export default WhatDrives;
