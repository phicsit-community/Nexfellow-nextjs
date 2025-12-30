import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import MetaTags from "../../components/MetaTags/MetaTags";

// styles
import styles from "./ViewOnlyChallenge.module.css";

// assets
import Back from "../Community/assets/ArrowLeft.svg";
import info from "../Community/assets/WarningCircle.svg";
import trophy from "../Community/assets/trophyImage.svg";
import calender from "../Community/assets/calender.svg";
import leaderboard from "../Community/assets/leaderboard.svg";
import participants from "../Community/assets/participants.svg";

const ViewOnlyChallenge = () => {
  const [activeComponent, setActiveComponent] = useState("Summary");
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/challenge/getChallenge/${id}`);
        setChallenge(response.data);
      } catch (error) {
        console.error("Error fetching challenge:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChallenge();
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLoginPrompt = () => {
    navigate("/login", {
      state: {
        returnUrl: `/challenge/${id}`,
        message: "Login to participate in this challenge",
      },
    });
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "Summary":
        return (
          <PublicSummary onLogin={handleLoginPrompt} challenge={challenge} />
        );
      case "Checkpoints":
        return <PublicCheckpoints />;
      case "Participants":
        return <PublicParticipants />;
      default:
        return (
          <PublicSummary onLogin={handleLoginPrompt} challenge={challenge} />
        );
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading challenge details...</div>;
  }

  return (
    <div className={styles.container}>
      {challenge && (
        <MetaTags
          title={`${challenge.name || "Challenge"} | NexFellow`}
          description={
            challenge.description ||
            "Join this exciting coding challenge on NexFellow!"
          }
          contentId={id}
          contentType="challenge"
          type="article"
        />
      )}
      <div className={styles.backButton}>
        <button onClick={handleBack}>
          <img src={Back} alt="Back" />
          <span>Back</span>
        </button>
      </div>
      <div className={styles.challengNameDiv}>
        <span>{challenge?.name || "Challenge Preview"}</span>
        <div className={styles.loginCallToAction}>
          <button onClick={handleLoginPrompt}>Login to Participate</button>
        </div>
      </div>
      <div className={styles.activeDiv}>
        <div
          onClick={() => setActiveComponent("Summary")}
          className={activeComponent === "Summary" ? styles.activeCompo : ""}
        >
          Summary
        </div>
        <div
          onClick={() => setActiveComponent("Checkpoints")}
          className={
            activeComponent === "Checkpoints" ? styles.activeCompo : ""
          }
        >
          Checkpoints
        </div>
        <div
          onClick={() => setActiveComponent("Participants")}
          className={
            activeComponent === "Participants" ? styles.activeCompo : ""
          }
        >
          Participants
        </div>
      </div>
      <div>{renderComponent()}</div>
    </div>
  );
};

const PublicCheckpoints = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.checkpointsDiv}>
      <div className={styles.checkpointsDivHead}>
        <p>Checkpoints Preview</p>
      </div>
      <div className={styles.checkpointsDivContent}>
        <div>
          <img src={calender} alt="Calendar" />
          <span>Schedule</span>
        </div>
        <div>
          <img src={leaderboard} alt="Leaderboard" />
          <div>Leaderboard</div>
        </div>
      </div>
      <div className={`${styles.checkpointsDivContent2} ${styles.publicNote}`}>
        <p>Login to see challenge checkpoints details</p>
        <button onClick={() => navigate("/login")}>Login Now</button>
      </div>
    </div>
  );
};

const PublicParticipants = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.participantsDiv}>
      <img src={participants} alt="Participants" />
      <div className={styles.participantsDivContent1}>Participants Preview</div>
      <div className={styles.participantsDivContent2}>
        Login to see who&apos;s participating in this challenge
      </div>
      <button
        className={styles.loginParticipantsButton}
        onClick={() => navigate("/login")}
      >
        Login Now
      </button>
    </div>
  );
};

const PublicSummary = ({ onLogin, challenge }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.summaryDiv}>
      <div className={styles.summaryDivInfo}>
        <img src={info} alt="Info" />
        <span>Login to participate in this challenge</span>
      </div>
      <div className={styles.summaryDivMain}>
        <div className={styles.trophyImg}>
          <img src={trophy} width="232px" height="133px" alt="Trophy" />
        </div>
        <div className={styles.challengeInfoPreview}>
          <h3>{challenge?.name || "Challenge Preview"}</h3>
          <p>
            {challenge?.description ||
              "This challenge requires login to view complete details and participate."}
          </p>
          <p>Create an account or login to:</p>
          <ul>
            <li>View challenge details</li>
            <li>Track your progress</li>
            <li>Submit your work</li>
            <li>Communicate with other participants</li>
          </ul>
          <div className={styles.publicLoginButtons}>
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/signup")}>Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOnlyChallenge;
