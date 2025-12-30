import React from "react";
import styles from "./ModeratorsView.module.css";
import Skeleton from "../ui/Skeleton/Skeleton";

const MemberItemSkeleton = ({ count = 5 }) => {
  const items = [];

  for (let i = 0; i < count; i++) {
    items.push(
      <div key={i} className={styles.memberItem}>
        <div className={styles.memberProfile}>
          <Skeleton type="memberAvatar" />
          <div className={styles.profileDetails}>
            <Skeleton type="memberName" />
            <Skeleton type="memberUsername" />
          </div>
        </div>
        <Skeleton type="memberButton" />
      </div>
    );
  }

  return <>{items}</>;
};

export default MemberItemSkeleton;
