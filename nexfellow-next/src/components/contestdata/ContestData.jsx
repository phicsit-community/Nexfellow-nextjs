"use client";

import React, { useState, useEffect } from "react";
import htmr from "htmr";
import api from "../../lib/axios";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import defaultImage from "../../Pages/AllContest/Contestimages/Online_Contest_svg_banner_dark.png";
import styles from "./ContestData.module.css";

const ContestData = ({ contest, bookmarkedQuizzes }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const isLoggedin = typeof window !== "undefined" ? localStorage.getItem("isLoggedIn") : null;
  const router = useRouter();

  // Check if this contest is bookmarked (from parent prop)
  useEffect(() => {
    if (
      Array.isArray(bookmarkedQuizzes) &&
      bookmarkedQuizzes.some(
        (quiz) =>
          quiz._id === contest._id ||
          quiz.id === contest._id // handle both possible keys
      )
    ) {
      setIsBookmarked(true);
    } else {
      setIsBookmarked(false);
    }
  }, [bookmarkedQuizzes, contest._id]);

  // Always sync with backend for this contest's bookmark status
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      if (!isLoggedin) return;
      try {
        // This assumes you have a route that checks if a contest is bookmarked
        const res = await api.get(`/bookmarks/user?itemType=GeneralContest`);
        // res.data.bookmarks is an array of bookmark objects
        const found = Array.isArray(res.data.bookmarks)
          ? res.data.bookmarks.some(
            (bm) =>
              bm.bookmarkItem &&
              (bm.bookmarkItem._id === contest._id ||
                bm.bookmarkItem.id === contest._id)
          )
          : false;
        setIsBookmarked(found);
      } catch (error) {
        // Optionally handle error
      }
    };
    fetchBookmarkStatus();
    // Only run once on mount (or when contest._id changes)
    // eslint-disable-next-line
  }, [contest._id, isLoggedin]);

  const handleButtonClick = () => {
    router.push(`/community/contests/${contest._id}`);
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Intl.DateTimeFormat("en-US", options).format(
      new Date(dateString)
    );
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!isLoggedin) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      if (!isBookmarked) {
        // Add bookmark
        await api.post(`/bookmarks/GeneralContest/${contest._id}`);
        setIsBookmarked(true);
      } else {
        // Remove bookmark
        await api.delete(`/bookmarks/GeneralContest/${contest._id}`);
        setIsBookmarked(false);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.contest}>
      <div className={styles.contestdatabox}>
        <div className={styles.contestdataimage}>
          {contest.status === "Live" && <div className={styles.live}>Live</div>}
          <img
            src={contest.image || defaultImage}
            alt={contest.title}
            style={{ width: "100%", borderRadius: "10px" }}
          />
        </div>
        <div className={styles.contestdatacontent}>
          <h3 className={styles.h3}>
            {contest.title.length > 18
              ? `${contest.title.slice(0, 18)}...`
              : contest.title}
          </h3>
          <div
            onClick={handleBookmark}
            style={{ cursor: loading ? "not-allowed" : "pointer" }}
          >
            {isBookmarked ? (
              <FaBookmark size={15} />
            ) : (
              <FaRegBookmark size={15} verticalAlign="top" />
            )}
          </div>
          <p className={styles.description}>{htmr(contest.description)}</p>
        </div>
        <div className={styles.contestdatatime}>
          <div className={styles.childTime}>
            <p>Event Date</p>
            <h3>{formatDate(contest.startTime)}</h3>
          </div>
          <div className={styles.contesttotalregistered}>
            <div className={styles.contestavatarGroup}>
              {Array.from({ length: 3 }).map((_, index) => {
                const img = contest.User_profile_Image?.[index];
                return (
                  <div
                    key={index}
                    className={styles.contestavatarWrapper}
                    style={{ zIndex: 3 - index }}
                  >
                    <img
                      src={
                        img ||
                        "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png"
                      }
                      alt={`User ${index + 1}`}
                      className={styles.contestavatar}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png";
                      }}
                    />
                  </div>
                );
              })}
              {contest.User_profile_Image?.length > 3 && (
                <div
                  className={styles.contestavatarWrapper}
                  style={{ zIndex: 0 }}
                >
                  <div className={styles.moreCount}>
                    +{contest.User_profile_Image.length - 3}
                  </div>
                </div>
              )}
            </div>
            <p className={styles.contestjoined}>
              +{contest.totalRegistered} Joined
            </p>
          </div>
        </div>
        <div className={styles.contestdatabutton}>
          <button onClick={handleButtonClick}>View Details</button>
        </div>
      </div>
    </div>
  );
};

export default ContestData;
