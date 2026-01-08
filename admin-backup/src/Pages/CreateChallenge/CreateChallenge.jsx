import styles from "./CreateChallenge.module.css";

//components
import Navbar from "../../Components/Navbar/Navbar";
import TemplateCard from "../../Components/TemplateCard/TemplateCard";

//icons
import WEEK from "./assets/Week.svg";
import MONTH from "./assets/Month.svg";
import YEAR from "./assets/100Days.svg";
import { FiUsers } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChallengeForm from "../../Components/ChallengeForm/ChallengeForm";

// images
import trophy from "./assets/trophy.png";

function CreateChallenge() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleClickOnChallenge = () => {
    console.log("fds");
    navigate("/challenge/overview");
  };
  useEffect(() => {
    if (isCreateModalOpen) {
      document.body.style.overflow = "hidden";
      scrollTo(0, 0);
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isCreateModalOpen]);

  const challenges = [
    {
      id: 1,
      challengeName: "Testing 1",
      imgURL: { trophy },
      participants: 10,
      startDate: "31 Jul 2024",
      endDate: "09 Sep 2024",
      status: "Active",
    },
    {
      id: 2,
      challengeName: "Testing 2",
      imgURL:
        "https://cdn.pixabay.com/photo/2016/07/07/16/46/dice-1502706_640.jpg",
      participants: 20,
      startDate: "31 Jul 2024",
      endDate: "09 Sep 2024",
      status: "Ended",
    },
    {
      id: 3,
      challengeName: "Testing 3",
      imgURL:
        "https://cdn.pixabay.com/photo/2016/07/07/16/46/dice-1502706_640.jpg",
      participants: 9,
      startDate: "31 Jul 2024",
      endDate: "09 Sep 2024",
      status: "Ended",
    },
  ];

  return (
    <div style={{ position: "relative" }}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Challenges</h1>
          <div
            className={styles.button}
            onClick={() => {
              setIsCreateModalOpen(true);
            }}
          >
            + Create Challenge
          </div>
        </div>

        <div className={styles.templateContainer}>
          <div className={styles.text}>Pick a template</div>

          <div className={styles.templates}>
            <TemplateCard
              heading="7-day Challenge"
              desc="Ignite a week of excitement"
              logo={WEEK}
              setIsCreateModalOpen={setIsCreateModalOpen}
            />

            <TemplateCard
              heading="30-day Challenge"
              desc="Set a month-long quest"
              logo={MONTH}
              setIsCreateModalOpen={setIsCreateModalOpen}
            />

            <TemplateCard
              heading="100-day Challenge"
              desc="Build an epic campaign"
              logo={YEAR}
              setIsCreateModalOpen={setIsCreateModalOpen}
            />
          </div>
        </div>

        {/* Challenges */}
        <div className={styles.challengeListContainer}>
          {/* HEADER */}
          <div className={styles.challengeListHeader}>
            <div className={styles.headerName}>Name</div>
            <div className={styles.partStatus}>
              <div>Participants</div>
              <div>Status</div>
            </div>
          </div>
          {/* Challenge List */}

          <div className={styles.chanllengesList}>
            {challenges.map((challenges) => {
              return (
                <div
                  key={challenges.id}
                  className={styles.challengeess}
                  onClick={handleClickOnChallenge}
                >
                  <div className={styles.challengenameandImage}>
                    <img
                      src={trophy}
                      alt="challenge"
                      className={styles.challengeImage}
                    />
                    <div className={styles.nameanddate}>
                      <div className={styles.challengeName}>
                        {" "}
                        {challenges.challengeName}{" "}
                      </div>
                      <div className={styles.date}>
                        {challenges.startDate} - {challenges.endDate}
                      </div>
                    </div>
                  </div>

                  <div className={styles.participantsStyle}>
                    <div className={styles.participantsUsers}>
                      <FiUsers className={styles.participateIcons} />
                      {challenges.participants}
                    </div>
                    <div>
                      <div
                        className={
                          challenges.status === "Active"
                            ? styles.active
                            : styles.ended
                        }
                      >
                        {challenges.status}
                      </div>
                    </div>
                    <div>
                      <BsThreeDotsVertical
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setIsCreateModalOpen(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <div
          style={{
            position: "absolute",
            zIndex: "100",
            top: "0px",
            right: "0px",
            bottom: "0px",
            left: "0px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            height: "100%",
            width: "100%",
          }}
        ></div>
      )}

      <div
        style={{
          position: "absolute",
          zIndex: "100",
          top: "0px",
          right: "0px",
          bottom: "0px",
        }}
      >
        <div>
          {isCreateModalOpen && (
            <ChallengeForm setIsCreateModalOpen={setIsCreateModalOpen} />
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateChallenge;
