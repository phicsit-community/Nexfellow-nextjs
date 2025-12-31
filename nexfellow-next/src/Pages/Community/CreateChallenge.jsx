"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./createChallenge.module.css";
import { AiOutlinePlus } from "react-icons/ai";
import { useMediaQuery } from "@mui/material";

// components
import CreateOverlay from "./CreateChallengeOverlay";
import ChallengeCard from "../../components/Community/ChallengeCard";
import ChallengeCardSkeleton from "../../components/Community/ChallengeCardSkeleton";
import axios from "axios";
import BackButton from "../../components/BackButton/BackButton";


// images
import leftArrow from "./assets/ArrowLeft.svg";
import days7 from "./assets/7Days.svg";
import days30 from "./assets/30Days.svg";
import days100 from "./assets/100Days.svg";
import trophy from "./assets/trophyy.svg";

import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Calendar, Clock } from "lucide-react";

const CreateChallenge = () => {
  const params = useParams();
  const communityId = params?.communityId;
  const [allChallenges, setAllChallenge] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width:768px)");
  const [showPcOnlyModal, setShowPcOnlyModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function getall() {
      try {
        setLoading(true);
        // Use the new API endpoint for getting created challenges
        const response = await axios.get(
          `/challenge/community/${communityId}/created`
        );
        console.log("API Response:", response.data);
        const challenges = response.data?.challenges || [];
        setAllChallenge(Array.isArray(challenges) ? challenges : []);
      } catch (error) {
        console.error("Error fetching challenges:", error);
        setAllChallenge([]);
      } finally {
        setLoading(false);
      }
    }
    getall();
  }, []);

  function formatDate(startISO, endISO) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const startDate = new Date(startISO);
    const endDate = new Date(endISO);

    const startDay = startDate.getDate();
    const startMonth = months[startDate.getMonth()];
    const endDay = endDate.getDate();
    const endMonth = months[endDate.getMonth()];
    const endyear = endDate.getFullYear();
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${endyear}`;
  }

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(7);
  const [dateAndTimeData, setDateAndTimeData] = useState({
    startDate: null,
    startTime: "00:00",
    endDate: null,
    endTime: "23:59",
  });

  const calculate = (numberOfDays) => {
    const toChange = {
      startDate: "",
      startTime: "00:00",
      endDate: "",
      endTime: "23:59",
    };

    const today = new Date();

    // Calculate the start date
    today.setDate(today.getDate() + 1);
    toChange.startDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // Calculate the end date
    today.setDate(today.getDate() + numberOfDays - 1);
    toChange.endDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    setDateAndTimeData(toChange);
    setSelectedDuration(numberOfDays);
  };

  const handleCreateChallengeClick = () => {
    if (isMobile) {
      setShowPcOnlyModal(true);
    } else {
      setIsPopupOpen(true);
    }
  };

  const hasChallenges =
    Array.isArray(allChallenges) && allChallenges.length > 0;

  return (
    <div className={styles.challengesContainer}>
      {/* Back button */}
      {isPopupOpen ? (
        <CreateOverlay
          setIsPopupOpen={setIsPopupOpen}
          dateAndTimeData={dateAndTimeData}
          setAllChallenge={setAllChallenge}
          selectedDuration={selectedDuration}
        />
      ) : null}
      <Dialog open={showPcOnlyModal} onOpenChange={setShowPcOnlyModal}>
        <DialogContent
          style={{
            padding: "1rem 2rem",
          }}
        >
          <DialogTitle>
            <span className="font-bold text-xl">
              Create on Desktop, Access on the App.
            </span>
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-2">
            To ensure a seamless experience, please create challenges on the
            desktop version. You can access and manage them on the app later.
          </p>
          <div className="flex justify-center mt-4">
            <Button
              className=" text-white rounded-md bg-[#24b2b4] cursor-pointer hover:bg-[#4ba3a5]"
              style={{
                padding: "0.5rem 1.5rem",
              }}
              onClick={() => setShowPcOnlyModal(false)}
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div style={{ marginBottom: "20px" }}>
        <div
          className="border rounded-lg hover:bg-accent text-sm w-fit"
          style={{ padding: "3px 10px" }}
        >
          <BackButton
            onClick={() => router.back()}
            showText={true}
            smallText={true}
            style={{ marginBottom: "0px" }}
          />
        </div>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <h1>Challenges</h1>
        <button
          className={styles.createChallengeButton}
          onClick={handleCreateChallengeClick}
        >
          <AiOutlinePlus size={18} /> Create Challenge
        </button>
      </div>

      {/* Challenge templates */}
      <div className={styles.templates}>
        <h2>Select a desired template</h2>
        <div className={styles.templateOptions}>
          <div
            className={styles.templateCard}
            onClick={() => {
              if (isMobile) {
                setShowPcOnlyModal(true);
              } else {
                setIsPopupOpen(true);
                calculate(7);
              }
            }}
          >
            <div
              className={`bg-[#FFE4E6] rounded-full flex items-center justify-center aspect-square w-[50px] h-[50px] `}
            >
              <Clock size={"24px"} color="#E11D48" />
            </div>
            <div className={styles.templateContent}>
              <h3>Weekly Challenge</h3>
              <p>Kickstart with a quick-win goal</p>
              <div className={styles.templateTag}>7 days</div>
            </div>
          </div>
          <div
            className={styles.templateCard}
            onClick={() => {
              if (isMobile) {
                setShowPcOnlyModal(true);
              } else {
                setIsPopupOpen(true);
                calculate(30);
              }
            }}
          >
            <div
              className={`bg-[#F3E8FF] rounded-full flex items-center justify-center aspect-square w-[50px] h-[50px] `}
            >
              <Calendar size={"24px"} color="#9333EA" />
            </div>
            <div className={styles.templateContent}>
              <h3>Monthly Challenge</h3>
              <p>Commit to a 30-day transformation</p>
              <div className={styles.templateTag}>30 days</div>
            </div>
          </div>
          <div
            className={styles.templateCard}
            onClick={() => {
              if (isMobile) {
                setShowPcOnlyModal(true);
              } else {
                setIsPopupOpen(true);
                calculate(100);
              }
            }}
          >
            <div
              className={`bg-[#FEF3C7] rounded-full flex items-center justify-center aspect-square w-[50px] h-[50px] `}
            >
              <Calendar size={"24px"} color="#D97706" />
            </div>
            <div className={styles.templateContent}>
              <h3>Century Challenge</h3>
              <p>Transform over 100 days of commitment</p>
              <div className={styles.templateTag}>100 days</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        // Branch 1: loading → keep skeletons inside the card container
        <div className={styles.cardContainer}>
          <div className={styles.grid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <ChallengeCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : hasChallenges ? (
        // Branch 2: data present → render cards container
        <div className={styles.cardContainer}>
          <h2>All Challenges</h2>
          <div className={styles.grid}>
            {allChallenges.map((element) => (
              <ChallengeCard
                key={element._id ?? element.slug ?? element.title} // prefer stable ids
                id={element._id}
                name={element.title || "Untitled Challenge"}
                date={
                  element.startDate && element.endDate
                    ? formatDate(element.startDate, element.endDate)
                    : "Dates Unavailable"
                }
                status={element.status || "Unknown Status"}
                participants={String(element.participants?.length ?? 0)}
                isFree={Boolean(element.isFree)}
                isUnpublished={element.status === "unpublished"}
              />
            ))}
          </div>
        </div>
      ) : (
        // Branch 3: no data → render dedicated no-challenges container
        <div className={styles.noChallengesContainer}>
          <div className={styles.noChallenges}>
            <div className={styles.boostEngagement}>
              <div className={styles.trophyIcon}>
                <img src={trophy} alt="Trophy Icon" />
              </div>
              <h2>Boost Community Engagement with Milestones</h2>
              <p>
                Use ready-made paths or create custom journeys for your
                community, complete with milestones and rewards!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateChallenge;
