"use client";

import Link from "next/link";
import styles from "./ExploreThousandCard.module.css";

// images
import ArrowRight from "./assets/ArrowCircleRight.webp";

const ExploreThousandCard = ({ category, img }) => {
  return (
    <div className={styles.cardContainer}>
      <img
        src={img}
        className={styles.cardContainerImg}
        alt={category}
        aria-label={category}
      />
      <div className={styles.cardContainerText}>
        <span className={styles.cardContainerCategory}>{category}</span>
        <Link href="/signup">
          <img
            src={ArrowRight.src || ArrowRight}
            className={styles.cardContainerImgArrow}
            alt="arrow-right"
            aria-label="arrow-right"
          />
        </Link>
      </div>
    </div>
  );
};

export default ExploreThousandCard;
