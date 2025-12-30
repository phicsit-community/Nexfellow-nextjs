import styles from "./challengeCard.module.css";
import Skeleton from "../ui/Skeleton/Skeleton";

const ChallengeCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Skeleton type="challengeCardImage" />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardContent}>
          <Skeleton type="challengeCardTitle" />
        </div>
        <Skeleton type="challengeCardText" />
        <div className={styles.cardFooter}>
          <Skeleton type="challengeCardFooter" />
        </div>
      </div>
    </div>
  );
};

export default ChallengeCardSkeleton;
