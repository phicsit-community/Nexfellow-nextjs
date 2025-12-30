import React from "react";
import styles from "./NoJoinedCommunity.module.css";
import Skeleton from "../ui/Skeleton/Skeleton";

const NoJoinedCommunitySkeleton = () => {
  return (
    <div className={styles.container}>
      <Skeleton type="noJoinedIllustration" />
      <Skeleton type="noJoinedText" />
      <Skeleton type="noJoinedButton" />
    </div>
  );
};

export default NoJoinedCommunitySkeleton;
