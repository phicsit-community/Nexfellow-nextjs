import React, { useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";

import {NavLink, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import styles from "./Challenge.module.css";

import leftarrow from "./../../assests/challenges/leftarrow.png";
import threedots from "./../../assests/challenges/threedots.png";
import EditChallenge from "./editChallenge";

const Challenge = (props) => {
  const [isEditChallengeOpen, setIsEditChallengeOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div>
      {isEditChallengeOpen && <div className={styles.overlay}></div>}
      <div>
        <Navbar />
        <div className={styles.hero}>
          <button className={styles.allChallenges}>
            <img src={leftarrow} />
            <p onClick={()=>(navigate("/create-challenge"))}>Challenges</p>
          </button>
          <div className={styles.challengeContainer}>
            <p className={styles.challengeName}>Challenge Name</p>
            <div className={styles.publishContainer}>
              <button className={styles.publishButton}>Publish</button>
              <img src={threedots} />
            </div>
          </div>
          <div className={styles.challengeDetails}>
            <NavLink
              to="./overview"
              style={({ isActive }) => {
                return isActive
                  ? {
                      textDecoration: "underline",
                      textDecorationColor: "#08AAA2",
                      fontWeight: "600",
                      color: "black",
                    }
                  : {};
              }}
            >
              Overview
            </NavLink>
            <NavLink
              to="./checkpoints"
              style={({ isActive }) => {
                return isActive
                  ? {
                      textDecoration: "underline",
                      textDecorationColor: "#08AAA2",
                      fontWeight: "600",
                      color: "black",
                    }
                  : {};
              }}
            >
              Checkpoints
            </NavLink>
            <NavLink
              to="./participants"
              style={({ isActive }) => {
                return isActive
                  ? {
                      textDecoration: "underline",
                      textDecorationColor: "#08AAA2",
                      fontWeight: "600",
                      color: "black",
                    }
                  : {};
              }}
            >
              Participants
            </NavLink>
          </div>
          <div>
            <Outlet context={{ isEditChallengeOpen, setIsEditChallengeOpen }} />
          </div>
        </div>
      </div>
      {isEditChallengeOpen && (
        <EditChallenge setIsEditChallengeOpen={setIsEditChallengeOpen} />
      )}
    </div>
  );
};

export default Challenge;
