"use client";

import styles from "./challengeCard.module.css";
import { useRouter } from "next/navigation";
// images
import trophy from "./assets/trophy.svg";
import parti from "./assets/parti.svg";
import { Trophy } from "lucide-react";

const ChallengeCard = ({
  id,
  name,
  date,
  status,
  participants,
  isFree,
  isUnpublished,
  progress = 0,
}) => {
  const router = useRouter();
  // status = "unpublished", "upcoming", "ongoing", "completed

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "unpublished":
        return "text-[#E11D48]";
      case "upcoming":
        return "text-[#14B8A6]";
      case "completed":
        return "text-[#14B8A6]";
      default:
        return "text-[#14B8A6]";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status?.toLowerCase()) {
      case "unpublished":
        return "bg-[#E11D48]/20";
      case "upcoming":
        return "bg-[#14B8A6]/20";
      case "completed":
        return "bg-[#14B8A6]/20";
      default:
        return "bg-[#14B8A6]/20";
    }
  };

  const getBorderColor = (status) => {
    switch (status?.toLowerCase()) {
      case "unpublished":
        return "border-[#E11D48]";
      case "upcoming":
        return "border-[#14B8A6]";
      case "completed":
        return "border-[#14B8A6]";
      default:
        return "border-[#14B8A6]";
    }
  };

  return (
    <div className={styles.card}>
      {/* Status Tag */}
      <div
        className={`absolute top-4 left-4 text-xs rounded-full ${getStatusBgColor(
          status
        )} ${getStatusColor(status)} ${getBorderColor(status)}`}
        style={{
          padding: "4px 8px",
        }}
      >
        <span>{status}</span>
      </div>

      {/* Trophy Icon */}
      <div className={styles.trophyContainer}>
        <div
          className={`bg-[#F0FDFA] rounded-full flex items-center justify-center aspect-square w-[64px] h-[64px] `}
        >
          <Trophy size={"30px"} color="#14B8A6" />
        </div>
      </div>

      {/* Card Content */}
      <div className={styles.cardContent}>
        <h3 className={styles.title}>{name}</h3>
        <p className={styles.description}>
          Learn the fundamentals of programming
        </p>

        {/* Challenge Details */}
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Date:</span>
            <span className={styles.detailValue}>{date}</span>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.participantsLabel}>
              <img
                src={parti}
                alt="Participants"
                className={styles.participantsIcon}
              />
              <span>Participants:</span>
            </div>
            <span className={styles.detailValue}>{participants}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Progress:</span>
            <span className={styles.progressValue}>{progress}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Action Button */}
        <button
          className={styles.actionButton}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/challenge/${id}`);
          }}
        >
          {status?.toLowerCase() === "completed"
            ? "View Results"
            : "View Challenge"}
        </button>
      </div>
    </div>
  );
};

export default ChallengeCard;
