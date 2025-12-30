import React from "react";
import styles from "./Skeleton.module.css";

const SkeletonAnalytics = () => {
  // Create an array to render multiple analytics cards
  const analyticCards = Array(6).fill(null);

  return (
    <div className={styles.skeletonAnalyticsWrapper}>
      {analyticCards.map((_, index) => (
        <div key={index} className={styles.skeletonAnalytic}>
          <div className={styles.skeletonAnalyticIcon}></div>
          <div className={styles.skeletonAnalyticHeading}></div>
          <div className={styles.skeletonAnalyticContent}>
            <div className={styles.skeletonAnalyticStats}></div>
            <div className={styles.skeletonAnalyticRight}>
              <div className={styles.skeletonAnalyticTrend}></div>
              <div className={styles.skeletonAnalyticPeriod}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonAnalytics;
