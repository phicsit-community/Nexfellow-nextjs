import React from "react";
import styles from "./Skeleton.module.css";

const SkeletonPost = () => {
  return (
    <>
      <div className={styles.skeletonPost}>
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonAvatar}></div>
          <div className={styles.skeletonDetails}>
            <div className={styles.skeletonText}></div>
            <div className={styles.skeletonText}></div>
          </div>
        </div>
        <div className={styles.skeletonContent}>
          <div className={styles.skeletonText}></div>
          <div className={styles.skeletonText}></div>

          <div className={styles.skeletonText}></div>
        </div>
        <div className={styles.skeletonActions}>
          <div className={styles.skeletonAction}></div>
          <div className={styles.skeletonAction}></div>
          <div className={styles.skeletonAction}></div>
        </div>
      </div>
      <div className={styles.skeletonPost}>
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonAvatar}></div>
          <div className={styles.skeletonDetails}>
            <div className={styles.skeletonText}></div>
            <div className={styles.skeletonText}></div>
          </div>
        </div>
        <div className={styles.skeletonContent}>
          <div className={styles.skeletonText}></div>
          <div className={styles.skeletonText}></div>
          <div className={styles.skeletonImageGrid}>
            <div className={styles.skeletonImageItem}></div>
            <div className={styles.skeletonImageItem}></div>
            <div className={styles.skeletonImageItem}></div>
            <div className={styles.skeletonImageItem}></div>
          </div>
          <div className={styles.skeletonText}></div>
        </div>
        <div className={styles.skeletonActions}>
          <div className={styles.skeletonAction}></div>
          <div className={styles.skeletonAction}></div>
          <div className={styles.skeletonAction}></div>
        </div>
      </div>
      <div className={styles.skeletonPost}>
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonAvatar}></div>
          <div className={styles.skeletonDetails}>
            <div className={styles.skeletonText}></div>
            <div className={styles.skeletonText}></div>
          </div>
        </div>
        <div className={styles.skeletonContent}>
          <div className={styles.skeletonText}></div>
          <div className={styles.skeletonText}></div>
          <div className={styles.skeletonImageGrid}>
            <div className={styles.skeletonImageItem}></div>
            <div className={styles.skeletonImageItem}></div>
            <div className={styles.skeletonImageItem}></div>
            <div className={styles.skeletonImageItem}></div>
          </div>
          <div className={styles.skeletonText}></div>
        </div>
        <div className={styles.skeletonActions}>
          <div className={styles.skeletonAction}></div>
          <div className={styles.skeletonAction}></div>
          <div className={styles.skeletonAction}></div>
        </div>
      </div>
    </>
  );
};

export default SkeletonPost;
