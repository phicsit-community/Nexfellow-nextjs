import React from "react";
import { MdOutlineClose } from "react-icons/md";
import editchallenge1 from "./../../assests/challenges/editchallenge1.png";
import editchallenge2 from "./../../assests/challenges/editchallenge2.png";
import styles from "./editChallenge.module.css";
import Switch from "@mui/material/Switch";
const EditChallenge = ({ setIsEditChallengeOpen }) => {
  const label = { inputProps: { "aria-label": "Switch demo" } };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.headerText}>Set up schedule & checkpoints</p>
        <MdOutlineClose
          fontSize={30}
          onClick={() => {
            setIsEditChallengeOpen(false);
          }}
        />
      </div>
      <hr></hr>
      <div className={styles.form}>
        <p>Start</p>
        <div className={styles.inputt}>
          <input className={styles.inputDateTime} type="date" />
          <input className={styles.inputDateTime} type="time" />
        </div>
        <p>End</p>
        <div className={styles.inputt}>
          <input className={styles.inputDateTime} type="date" />
          <input className={styles.inputDateTime} type="time" />
        </div>
        <img src={editchallenge1} style={{ width: "204px", height: "191px" }} />
      </div>
      <hr></hr>
      <div className={styles.foot}>
        <div className={styles.footHead}>
          <p>Step-by-Step unlocking</p>
          <Switch
            size="small"
            sx={{
              width: 50, // Standard width for a good balance
              height: 26, // Standard height
              padding: 0,
              "& .MuiSwitch-switchBase": {
                padding: 1, // Slight padding around the thumb for better aesthetics
                "&.Mui-checked": {
                  transform: "translateX(23px)", // Move thumb when checked
                },
                "& .MuiSwitch-thumb": {
                  width: 10, // Default circle size
                  height: 10, // Default circle size
                  color: "#fff", // White color for the thumb (circle)
                },
              },
              "& .MuiSwitch-track": {
                borderRadius: 13, // Smoothly rounded track
                backgroundColor: "#bdbdbd", // Default track color
                opacity: 1,
                transition: "background-color 0.3s",
              },
              "& .Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#1976d2", // Color when switch is ON (blue)
              },
            }}
          />
        </div>
        <p className={styles.footContent}>
          Participants must complete each checkpoint in order to move on to the
          next checkpoints
        </p>
        <img src={editchallenge2} style={{ width: "191px", height: "150px" }} />
        <button className={styles.updateCheckpoint}>Update Checkpoints</button>
      </div>
    </div>
  );
};

export default EditChallenge;
