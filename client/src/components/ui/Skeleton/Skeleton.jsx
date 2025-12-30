import React from "react";
import styles from "./Skeleton.module.css";

const Skeleton = ({ type, count = 1 }) => {
  const renderSkeleton = () => {
    const skeletons = [];

    for (let i = 0; i < count; i++) {
      skeletons.push(
        <div key={i} className={`${styles.skeleton} ${styles[type]}`}>
          <div className={styles.shimmer}></div>
        </div>
      );
    }

    return skeletons;
  };

  return <>{renderSkeleton()}</>;
};

export default Skeleton;
