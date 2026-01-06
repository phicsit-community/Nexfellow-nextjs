//styles
import styles from "./Leaderboard.module.css";
import { FaArrowLeft, FaArrowRight, FaFire } from "react-icons/fa";

//assets
import rank1 from "./assets/A.svg";
import rank2 from "./assets/B.svg";

// Skeleton versions of the cards with shimmer effect
export const TopCard1Skeleton = () => {
  return (
    <div className={`${styles.firstPosition} ${styles.shimmer}`}>
      <div className={styles.skeletonRankIcon}></div>
      <div className={styles.skeletonFirstPosImg}></div>
      <div className={styles.dataFP}>
        <div className={`${styles.skeletonCell} ${styles.skeletonName}`}></div>
        <div
          className={`${styles.skeletonCell} ${styles.skeletonRating}`}
        ></div>
      </div>
    </div>
  );
};

export const TopCard2Skeleton = () => {
  return (
    <div className={`${styles.STPositions} ${styles.shimmer}`}>
      <div className={styles.skeletonSTposImg}></div>
      <div className={styles.skeletonRankIcon}></div>
      <div className={styles.dataST}>
        <div className={`${styles.skeletonCell} ${styles.skeletonName}`}></div>
        <div
          className={`${styles.skeletonCell} ${styles.skeletonRating}`}
        ></div>
      </div>
    </div>
  );
};

export const TopCard1 = ({ name, rating, picture, rank, onClick }) => {
  return (
    <div className={styles.firstPosition} onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <img src={rank1?.src || rank1} alt="Rank Icon" className={styles.rankCard} />
      <img
        src={picture || "https://via.placeholder.com/75"}
        className={styles.firstPosImg}
        alt={name}
      />
      <p className={styles.rank}>{rank}</p>
      <div className={styles.dataFP}>
        <div className={styles.rankCard1}>
          <p className={styles.dataFP1}>{name}</p>
          <p className={styles.dataFP2}><FaFire style={{ color: "#ff3030", fontSize: "18px" }} />
            <span>{Math.round(rating)}</span></p>
        </div>
      </div>
    </div>
  );
};

export const TopCard2 = ({ name, rating, picture, rank, onClick }) => {
  return (
    <div className={styles.STPositions} onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <img
        src={picture || "https://via.placeholder.com/75"}
        className={styles.STposImg}
        alt={name}
      />
      <img src={rank2?.src || rank2} alt="Rank Icon" className={styles.rankCard} />
      <p className={styles.rankst}>{rank}</p>
      <div className={styles.dataST}>
        <div className={styles.rankCard2}>
          <p className={styles.data1}>{name}</p>
          <p className={styles.data2}><FaFire style={{ color: "#ff3030", fontSize: "18px" }} />
            <span>{Math.round(rating)}</span></p>
        </div>
      </div>
    </div>
  );
};

// Export both actual components and skeleton components
export default { TopCard1, TopCard2, TopCard1Skeleton, TopCard2Skeleton };
