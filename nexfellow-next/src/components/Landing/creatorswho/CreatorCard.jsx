import React from "react";
import styles from "./CreatorCard.module.css";
// Import the arrow icon from react-icons
import { FaArrowRight } from "react-icons/fa";

const CreatorCard = ({ img, name, designation }) => {
  return (
    <div className={styles.cardContainer}>
      <img src={img} className={styles.mainImg} alt={name}></img>
      <div className={styles.foot}>
        <div>
          <div className={styles.footHead}>{name}</div>
          <div className={styles.footContent}>{designation}</div>
        </div>
        <div className={styles.footImg}>
          <div className={styles.arrowCircle}>
            <FaArrowRight size={16} color="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorCard;
