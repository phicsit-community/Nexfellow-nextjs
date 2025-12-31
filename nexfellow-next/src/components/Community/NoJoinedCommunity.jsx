"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./NoJoinedCommunity.module.css";
import illustration from "./assets/Illustration.png";

const NoJoinedCommunityPage = () => {
  const router = useRouter();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setAnimate(true);
  }, []);

  const handleJoinButtonClick = () => {
    router.push("/explore");
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${animate ? styles.animate : ""}`}>
        <img
          src={illustration}
          alt="No Community Illustration"
          className={styles.illustration}
        />
        <h2 className={styles.title}>
          Once you join a community, it'll show up here
        </h2>

        <button className={styles.joinButton} onClick={handleJoinButtonClick}>
          Join Community
        </button>
      </div>
    </div>
  );
};

export default NoJoinedCommunityPage;

