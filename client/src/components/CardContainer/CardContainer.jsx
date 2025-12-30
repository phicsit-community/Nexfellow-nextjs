import React, { useState, useEffect, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CardContainer.module.css";
import ContestData from "../contestdata/ContestData";
import { FaChevronRight } from "react-icons/fa";

const CardContainer = forwardRef(function CardContainer(
  { type, heading, quizzes, bookmarkedQuizIds },
  ref
) {
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const filteredQuizzes = quizzes.filter((quiz) => {
        if (type === "Upcoming") {
          return quiz.status === "Live" || quiz.status === "Upcoming";
        }
        return quiz.status === type;
      });

      const sortingFilterData = filteredQuizzes.sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );
      setFilteredData(sortingFilterData);
    } catch (error) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [quizzes, type]);

  const handleClick = () => {
    navigate(`/contests/${type.toLowerCase()}`);
  };

  // Skeleton loader component for cards
  const SkeletonLoader = () => (
    <div className={styles.skeletonCardsContainer}>
      {[1, 2, 3].map((index) => (
        <div
          key={`skeleton-${index}`}
          className={`${styles.skeletonCardItem} ${styles.skeleton}`}
        ></div>
      ))}
    </div>
  );

  return (
    <div className={styles.container} ref={ref}>
      <div className={styles.mainContainer}>
        <div className={styles.header}>
          <h2 className={styles.heading}>{heading}</h2>
          <div className={styles.line} />
          <div className={styles.btnContainer}>
            <div className={styles.btn} onClick={handleClick}>
              All {type}
              <FaChevronRight className={styles.icon} />
            </div>
          </div>
        </div>

        <div className={styles.cardContainer}>
          {loading ? (
            <SkeletonLoader />
          ) : error ? (
            <p>{error}</p>
          ) : filteredData.length === 0 ? (
            <p>No {type} contests available</p>
          ) : (
            filteredData
              .slice(0, 3)
              .map((quiz, index) => (
                <ContestData
                  key={quiz._id || index}
                  contest={quiz}
                  isBookmarked={bookmarkedQuizIds.includes(quiz._id)}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
});

CardContainer.displayName = "CardContainer";

export default CardContainer;
