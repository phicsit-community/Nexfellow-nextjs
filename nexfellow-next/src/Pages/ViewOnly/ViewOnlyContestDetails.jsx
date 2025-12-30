import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./ViewOnlyContestDetails.module.css";
import { Icon } from "@iconify/react";

import contestBanner from './assets/contest.png';
const DEFAULT_AVATAR =
  "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function padToTwoDigits(num) {
  return num.toString().padStart(2, '0');
}

function getAvatarImages(userImages = []) {
  const images = [...userImages];
  while (images.length < 3) {
    images.push(DEFAULT_AVATAR);
  }
  return images.slice(0, 3);
}

// Helper to format duration for display
function formatDuration(quizData) {
  if (quizData.timerMode === "full") {
    // Full timer: duration is already in minutes
    const totalMinutes = quizData.duration;
    if (totalMinutes > 1.5) {
      // Convert to "Xh Ym" or "Xm" as appropriate
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      if (hours > 0) {
        return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
      } else {
        return `${Math.round(totalMinutes)}m`;
      }
    } else {
      // Less than 1.5 minutes: display in seconds
      const seconds = Math.round(totalMinutes * 60);
      return `${seconds}s`;
    }
  } else if (quizData.timerMode === "rapid" && quizData.questions?.length > 0) {
    // Rapid mode: sum up question time limits (in seconds)
    const totalSeconds = quizData.questions.reduce(
      (sum, q) => sum + (q.timeLimit || 0),
      0
    );
    if (totalSeconds > 90) {
      const totalMinutes = Math.round(totalSeconds / 60);
      return `${totalMinutes}m`;
    } else {
      return `${totalSeconds}s`;
    }
  } else {
    return "N/A";
  }
}

// ----------- NEW Helper Function for Countdown -----------
function formatCountdown(diffMs) {
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  }
  return `${hours}h : ${String(minutes).padStart(2, "0")}m : ${String(seconds).padStart(2, "0")}s`;
}

// -------------------- COMPONENT -------------------

export default function ContestPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("Loading...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/community/public/${id}`);
        const data = res.data.quiz;
        console.log("Fetched quiz data:", data);
        setQuiz({
          title: data.title,
          totalRegistered: data.totalRegistered,
          userImages: data.userImages || [],
          duration: data.duration,
          questionCount: data.questionCount,
          startTime: data.startTime,
          totalMarks: data.totalMarks,
          timerMode: data.timerMode || "full", // default to full if not specified
          questions: data.questions || [],
        });
      } catch (err) {
        setQuiz(null);
      } finally {
        setTimeout(() => setLoading(false), 400);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!quiz?.startTime) return;
    const countdown = setInterval(() => {
      const diff = new Date(quiz.startTime) - new Date();
      if (diff <= 0) {
        setTimeLeft("Contest Started");
        clearInterval(countdown);
      } else {
        setTimeLeft(formatCountdown(diff));
      }
    }, 1000);
    return () => clearInterval(countdown);
  }, [quiz?.startTime]);

  const handleLogin = () => {
    navigate("/login", {
      state: {
        returnUrl: `/contests/${id}`,
        message: "Login to join contest",
      },
    });
  };

  const handleRegister = () => {
    navigate("/register", {
      state: {
        returnUrl: `/contests/${id}`,
      },
    });
  };

  if (loading) {
    return (
      <div className={styles.bg}>
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
          <p className={styles.loadingText}>Loading contest...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className={styles.bg}>
        <div className={styles.centeredCard}>
          <h3>Contest Not Found</h3>
          <button className={styles.primaryBtn} onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bg}>
      <div className={styles.cardOuter}>
        <div className={styles.cardInner}>
          <img src={contestBanner} className={styles.banner} alt="Contest Banner" />
          <div className={styles.cardContent}>
            <div className={styles.titleRow}>
              <div className={styles.rowBetween}>
                <span className={styles.quizTitle}>{quiz.title}</span>
                <span className={styles.timerPill}>
                  <Icon icon="material-symbols:timer-outline-rounded" width="18" style={{ marginRight: 6 }} />
                  {timeLeft === "Contest Started"
                    ? "Contest Started"
                    : `Contest Start in: ${timeLeft}`}
                </span>
              </div>
            </div>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <Icon icon="material-symbols:date-range" width="32" color="#08AAA2" />
                <span>
                  <b>{formatDate(quiz.startTime)} | {formatTime(quiz.startTime)}</b>
                </span>
              </div>
              <div className={styles.infoItem}>
                <Icon icon="iconamoon:certificate-badge-light" width="32" color="#08AAA2" />
                <span>
                  <b>Number of Questions:</b> {quiz.questionCount}
                </span>
              </div>
              <div className={styles.infoItem}>
                <Icon icon="mdi:file-star-four-points" width="32" color="#08AAA2" />
                <span>
                  <b>Total Marks:</b> {parseInt(quiz.questions.length) * 10 || "N/A"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <Icon icon="material-symbols:avg-time-outline-rounded" width="32" color="#08AAA2" />
                <span>
                  <b>Duration:</b> {formatDuration(quiz)}
                </span>
              </div>
            </div>
            <div className={styles.participants}>
              <div>
                {getAvatarImages(quiz.userImages).map((img, idx) => (
                  <img
                    key={idx}
                    src={img || DEFAULT_AVATAR}
                    alt="User"
                    className={styles.avatar}
                    onError={(e) => (e.target.src = DEFAULT_AVATAR)}
                  />
                ))}
              </div>
              <div className={styles.participantCount}>
                +{quiz.totalRegistered} Joined
              </div>
            </div>
            <button className={styles.joinBtn} onClick={handleLogin}>
              Login to Join Contest
            </button>
            <div className={styles.bottomText}>
              <span className={styles.loginLink} onClick={handleLogin}>
                Log in
              </span>{" "}
              to follow this community and see more content!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
