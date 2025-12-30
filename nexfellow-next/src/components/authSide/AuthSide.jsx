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
            <img src={BOOK} alt="book" />
          </div>
        </div>

        {/* community */}
        <div className={`${styles.item} ${styles.item2}`}>
          <div className={styles.icon}>
            <img src={TROPHY} alt="trophy" />
          </div>
        </div>

        <div className={`${styles.item} ${styles.item3}`}>
          <div className={styles.icon}>
            <img src={COMMUNITY} alt="community" />
          </div>
        </div>

        <div className={`${styles.item} ${styles.item4}`}>
          <div className={styles.icon}>
            <img src={MEDAL} alt="medal" />
          </div>
        </div>
      </div>
      <div className={styles.text}>
        NexFellow connects creators, startups, and companies to build thriving
        communities and grow projects. Create, manage, and scale your ideas in
        one place. Collaborate with like-minded individuals, share knowledge,
        and drive innovation. Unlock your potential and take your projects to
        new heights with NexFellow.
      </div>
    </div>
  );
};

export default AuthSide;
