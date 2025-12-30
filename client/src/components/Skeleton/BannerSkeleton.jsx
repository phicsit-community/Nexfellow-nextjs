import React from "react";
import Skeleton from "./Skeleton";
import styles from "./BannerSkeleton.module.css";

const BannerSkeleton = () => {
  return (
    <div className={styles.bannerSkeleton}>
      <div className={styles.contentArea}>
        <Skeleton width="60%" height="40px" className={styles.title} />
        <Skeleton width="80%" height="20px" className={styles.subtitle} />
        <div className={styles.buttonArea}>
          <Skeleton width="120px" height="40px" />
        </div>
      </div>
    </div>
  );
};

export default BannerSkeleton;
