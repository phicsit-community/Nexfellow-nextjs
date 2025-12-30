import React from "react";
import styles from "./Community.module.css";
import Skeleton from "../ui/Skeleton/Skeleton";

const SidebarItemSkeleton = ({ count = 3 }) => {
  const items = [];

  for (let i = 0; i < count; i++) {
    items.push(
      <div key={i} className={styles.sidebarItemSkeleton}>
        <div className={styles.sidebarItemSkeletonInner}>
          <Skeleton type="sidebarImage" />
          <div className={styles.sidebarItemContent}>
            <Skeleton type="sidebarTitle" />
            <Skeleton type="sidebarSubtitle" />
          </div>
        </div>
      </div>
    );
  }

  return <>{items}</>;
};

export default SidebarItemSkeleton;
