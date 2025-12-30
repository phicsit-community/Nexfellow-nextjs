import React from "react";
import Skeleton from "./Skeleton";
import styles from "./ContestCardSkeleton.module.css";

const ContestCardSkeleton = () => {
  return (
    <div className={styles.cardSkeleton}>
      <div className={styles.headerSkeleton}>
        <Skeleton width="70%" height="24px" />
        <Skeleton width="40%" height="16px" className={styles.marginTop} />
      </div>
      <div className={styles.bodySkeleton}>
        <div className={styles.infoRow}>
          <Skeleton width="40%" height="16px" />
          <Skeleton width="40%" height="16px" />
        </div>
        <div className={styles.infoRow}>
          <Skeleton width="40%" height="16px" />
          <Skeleton width="40%" height="16px" />
        </div>
        <div className={styles.infoRow}>
          <Skeleton width="40%" height="16px" />
          <Skeleton width="40%" height="16px" />
        </div>
      </div>
      <div className={styles.footerSkeleton}>
        <Skeleton width="100%" height="36px" />
      </div>
    </div>
  );
};

export default ContestCardSkeleton;
