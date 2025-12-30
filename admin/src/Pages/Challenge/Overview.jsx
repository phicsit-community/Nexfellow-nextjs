import React from "react";
import { useOutletContext } from "react-router-dom";
import calender from "./../../assests/challenges/calender.png";
import checkpoint from "./../../assests/challenges/checkpoint.png";
import edit from "./../../assests/challenges/edit.png";
import time from "./../../assests/challenges/time.png";
import info from "./../../assests/challenges/info.png";
import trophy from "./../../assests/challenges/trophy.png";
import styles from "./Overview.module.css";
const Overview = () => {
  const { isEditChallengeOpen, setIsEditChallengeOpen } = useOutletContext();
  return (
    <div className={styles.overviewContainer}>
      <div className={styles.overviewTop}>
        <img src={info} style={{ width: "20px", height: "20px" }} />
        <p>Complete the setup when you are ready</p>
      </div>
      <div className={styles.overviewBottom}>
        <img src={trophy} />
        <div
          className={styles.overviewFunction}
          onClick={() => setIsEditChallengeOpen(true)}
        >
          <img src={calender} />
          <p>DATE MONTH-DATE MONTH</p>
        </div>
        <div
          className={styles.overviewFunction}
          onClick={() => setIsEditChallengeOpen(true)}
        >
          <img src={time} />
          <p>Schedule</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
