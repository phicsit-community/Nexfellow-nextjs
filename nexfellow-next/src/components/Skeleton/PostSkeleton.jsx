import React from "react";
import styles from "./Skeleton.module.css";

const PostSkeleton = () => {
  return (
    <div className={styles.postSkeleton}>
      <div className={styles.postHeader}>
        <div className={`${styles.avatar} ${styles.shimmer}`}></div>
        <div className={styles.userInfo}>
          <div className={`${styles.userName} ${styles.shimmer}`}></div>
          <div className={`${styles.timestamp} ${styles.shimmer}`}></div>
        </div>
      </div>
      <div className={`${styles.postContent} ${styles.shimmer}`}></div>
      <div className={`${styles.postImageContainer} ${styles.shimmer}`}></div>
      <div className={styles.postActions}>
        <div className={`${styles.action} ${styles.shimmer}`}></div>
        <div className={`${styles.action} ${styles.shimmer}`}></div>
        <div className={`${styles.action} ${styles.shimmer}`}></div>
      </div>
    </div>
  );
};

export default PostSkeleton;
