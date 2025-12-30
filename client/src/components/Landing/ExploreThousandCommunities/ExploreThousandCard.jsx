import styles from "./ExploreThousandCard.module.css";

// images
import ArrowRight from "./assets/ArrowCircleRight.webp";
import { Link } from "react-router-dom";
const ExploreThousandCard = ({ category, img }) => {
  return (
    <div className={styles.cardContainer}>
      <img
        src={img}
        className={styles.cardContainerImg}
        alt={category}
        aria-label={category}
      />
      <div className={styles.cardContainerText}>
        <span className={styles.cardContainerCategory}>{category}</span>
        <Link to={"/signup"}>
          <img
            src={ArrowRight}
            className={styles.cardContainerImgArrow}
            alt="arrow-right"
            aria-label="arrow-right"
          />
        </Link>
      </div>
    </div>
  );
};

export default ExploreThousandCard;
