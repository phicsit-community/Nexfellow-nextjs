"use client";

import styles from "./authSide.module.css";

//icons
import BOOK from "./assets/Book.svg";
import COMMUNITY from "./assets/Community.svg";
import MEDAL from "./assets/Medal.svg";
import TROPHY from "./assets/Trophy.svg";

const AuthSide = () => {
  return (
    <div className={styles.main}>
      <div className={styles.container}>
        {/* bookbox */}
        <div className={`${styles.item} ${styles.item1}`}>
          <div className={styles.icon}>
            <img src={BOOK.src || BOOK} alt="book" />
          </div>
        </div>

        {/* community */}
        <div className={`${styles.item} ${styles.item2}`}>
          <div className={styles.icon}>
            <img src={TROPHY.src || TROPHY} alt="trophy" />
          </div>
        </div>

        <div className={`${styles.item} ${styles.item3}`}>
          <div className={styles.icon}>
            <img src={COMMUNITY.src || COMMUNITY} alt="community" />
          </div>
        </div>

        <div className={`${styles.item} ${styles.item4}`}>
          <div className={styles.icon}>
            <img src={MEDAL.src || MEDAL} alt="medal" />
          </div>
        </div>
      </div>
      <div className={styles.text}>
        Every week, NexFellow members ship products, collect honest reviews, and land their first paying users through the community. This is where builders actually grow.
      </div>
    </div>
  );
};

export default AuthSide;
