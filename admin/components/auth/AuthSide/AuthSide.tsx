'use client';

import styles from './AuthSide.module.css';
import Image from 'next/image';

const AuthSide = () => {
  return (
    <div className={styles.main}>
      <div className={styles.container}>
        {/* bookbox */}
        <div className={`${styles.item} ${styles.item1}`}>
          <div className={styles.icon}>
            <Image src="/assets/Login/Book.svg" alt="book" width={50} height={50} />
          </div>
        </div>

        {/* trophy */}
        <div className={`${styles.item} ${styles.item2}`}>
          <div className={styles.icon}>
            <Image src="/assets/Login/Trophy.svg" alt="trophy" width={50} height={50} />
          </div>
        </div>

        {/* community */}
        <div className={`${styles.item} ${styles.item3}`}>
          <div className={styles.icon}>
            <Image src="/assets/Login/Community.svg" alt="community" width={50} height={50} />
          </div>
        </div>

        {/* medal */}
        <div className={`${styles.item} ${styles.item4}`}>
          <div className={styles.icon}>
            <Image src="/assets/Login/Medal.svg" alt="medal" width={50} height={50} />
          </div>
        </div>
      </div>
      <div className={styles.text}>
        NexFellow is your launchpad to a world of friendly competition.
        Challenge yourself in diverse topics, battle it out with fellow geeks
        worldwide, and watch your name climb the leaderboards after each
        contest. Forge friendships with a supportive community. Join the Clash
        and unleash your inner champion!
      </div>
    </div>
  );
};

export default AuthSide;
