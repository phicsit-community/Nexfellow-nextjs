import React from "react";
import styles from "../UI/Skeleton/Skeleton.module.css";
import Skeleton from "../UI/Skeleton/Skeleton";

const CommunityListSkeleton = ({ count = 5 }) => {
  const items = [];

  for (let i = 0; i < count; i++) {
    items.push(
      <div key={i} className={styles.communityItem}>
        <Skeleton type="communityImage" />
        <div className={styles.communityDetails}>
          <Skeleton type="communityTitle" />
          <Skeleton type="communityUsername" />
          <Skeleton type="communityDescription" />
        </div>
      </div>
    );
  }

  return <>{items}</>;
};

export default CommunityListSkeleton;
