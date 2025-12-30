import React from "react";
import styles from "../ui/Skeleton/Skeleton.module.css";
import Skeleton from "../ui/Skeleton/Skeleton";

const PostSkeleton = ({ count = 3 }) => {
  const posts = [];

  for (let i = 0; i < count; i++) {
    posts.push(
      <div key={i} className={styles.postCard}>
        <div className={styles.postHeader}>
          <Skeleton type="postAvatar" />
          <div className={styles.postUserInfo}>
            <Skeleton type="postUserName" />
            <Skeleton type="postUsername" />
          </div>
        </div>
        <Skeleton type="postContent" />
        <Skeleton type="postActions" />
      </div>
    );
  }

  return <>{posts}</>;
};

export default PostSkeleton;
