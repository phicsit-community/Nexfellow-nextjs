import React from "react";
import styles from "./JoinedCommunity.module.css";
import Skeleton from "../ui/Skeleton/Skeleton";

const CommunityCardSkeleton = ({ count = 3 }) => {
  const items = [];

  for (let i = 0; i < count; i++) {
    items.push(
      <div key={i} className={styles.card}>
        <Skeleton type="cardImage" className={styles.cardImage} />
        <div className={styles.cardDetails}>
          <Skeleton type="cardTitle" />
          <Skeleton type="cardSubtitle" />
        </div>
      </div>
    );
  }

  return <>{items}</>;
};

export default CommunityCardSkeleton;
