import React, { useState, useEffect, useRef, useMemo } from "react";
import styles from "./Allcontest.module.css";
import axios from "axios";
import ContestBanner from "../../components/ContestBanner/ContestBanner.jsx";
import CardContainer from "../../components/CardContainer/CardContainer.jsx";
import BannerSkeleton from "../../components/Skeleton/BannerSkeleton.jsx";
import ContestCardSkeleton from "../../components/Skeleton/ContestCardSkeleton.jsx";

const Allcontest = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [bookmarkedQuizzes, setBookmarkedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const firstCardContainerRef = useRef(null);

  // Efficiently extract IDs of bookmarked quizzes
  const bookmarkedQuizIds = useMemo(
    () =>
      bookmarkedQuizzes
        .map((bookmark) => bookmark.bookmarkItem && bookmark.bookmarkItem._id)
        .filter(Boolean),
    [bookmarkedQuizzes]
  );

  useEffect(() => {
    const fetchBookmarkedQuizzes = async () => {
      try {
        const response = await axios.get("/bookmarks/user?itemType=GeneralContest", {
          withCredentials: true,
        });
        setBookmarkedQuizzes(response.data.bookmarks || []);
      } catch (error) {
        console.log(error);
        setBookmarkedQuizzes([]);
      }
    };

    const getQuizzes = async () => {
      try {
        const response = await axios.get("/quiz/getAllQuizzes");
        if (response.status === 200) {
          const data = response.data;
          const updatedQuizzes = data.map((quiz) => {
            const now = Date.now();
            const startTime = new Date(quiz.startTime).getTime();
            const endTime = new Date(quiz.endTime).getTime();

            if (startTime < now && endTime > now) {
              quiz.status = "Live";
            } else if (startTime > now) {
              quiz.status = "Upcoming";
            } else if (endTime < now) {
              quiz.status = "Past";
            }
            return quiz;
          });

          setQuizzes(updatedQuizzes);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchBookmarkedQuizzes();
    getQuizzes();
  }, []);

  const scrollToFirstCardContainer = () => {
    if (firstCardContainerRef.current) {
      firstCardContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Skeleton array for placeholder cards
  const skeletonArray = Array(6).fill(0);

  return (
    <div className={styles.Contesetapp}>
      <div className={styles.content_Container}>
        {loading ? (
          <>
            <BannerSkeleton />
            <div className={styles.skeletonGrid}>
              {skeletonArray.map((_, index) => (
                <ContestCardSkeleton key={index} />
              ))}
            </div>
          </>
        ) : (
          <>
            <ContestBanner
              quizzes={quizzes}
              onBannerClick={scrollToFirstCardContainer}
            />
            {quizzes.length > 0 ? (
              <div>
                <CardContainer
                  ref={firstCardContainerRef}
                  type="Upcoming"
                  heading="Upcoming Contests"
                  quizzes={quizzes}
                  bookmarkedQuizIds={bookmarkedQuizIds}
                />

                <CardContainer
                  type="Past"
                  heading="Past Contests"
                  quizzes={quizzes}
                  bookmarkedQuizIds={bookmarkedQuizIds}
                />
              </div>
            ) : (
              <p className={styles.noContests}>No Contests Available</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Allcontest;
