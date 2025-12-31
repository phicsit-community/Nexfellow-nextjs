/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import styles from "./Commoncd.module.css";
import CT from "./assets/CT.png";
import Duration from "./assets/Duration.png";
import NOQ from "./assets/NOQ.png";
import TM from "./assets/TM.png";
import CALENDAR from "./assets/CALENDAR.svg";
import MARKS from "./assets/MARKS.svg";
import DURATION from "./assets/DURATION.svg";
import QUESTIONS from "./assets/QUESTIONS.svg";
import { useRouter } from "next/navigation";
import Modal from "react-modal";
import axios from "axios";
import { toast } from "sonner";
Modal.setAppElement("#root");
import contestBanner from "./assets/image.png";
import {
  Clock,
  Users,
  Trophy,
  Info,
  Play,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  WhatsappShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  WhatsappIcon,
  TwitterIcon,
  LinkedinIcon,
  TelegramIcon,
} from "react-share";

const BookmarkIcon = ({ filled = false }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? "#6A6A6A" : "none"}
    stroke="#6A6A6A"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

const ShareArrowIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 26 26"
    fill="none"
    stroke="#6A6A6A"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const StopWatchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
  >
    <g clipPath="url(#clip0_3446_11482)">
      <path
        d="M6.13734 1.78031C5.98252 1.78031 5.85284 1.72786 5.7483 1.62295C5.64375 1.51804 5.5913 1.38836 5.59093 1.23391C5.59057 1.07945 5.64302 0.949775 5.7483 0.844865C5.85357 0.739955 5.98325 0.6875 6.13734 0.6875H8.32296C8.47777 0.6875 8.60763 0.739955 8.71254 0.844865C8.81745 0.949775 8.86973 1.07945 8.86936 1.23391C8.869 1.38836 8.81654 1.51822 8.712 1.62349C8.60745 1.72877 8.47777 1.78104 8.32296 1.78031H6.13734ZM7.23015 7.79077C7.38496 7.79077 7.51482 7.73831 7.61973 7.6334C7.72464 7.52849 7.77692 7.39881 7.77655 7.24436V5.05874C7.77655 4.90393 7.7241 4.77425 7.61919 4.6697C7.51428 4.56516 7.3846 4.5127 7.23015 4.51234C7.0757 4.51197 6.94602 4.56443 6.84111 4.6697C6.7362 4.77498 6.68374 4.90466 6.68374 5.05874V7.24436C6.68374 7.39918 6.7362 7.52904 6.84111 7.63395C6.94602 7.73886 7.0757 7.79113 7.23015 7.79077ZM7.23015 12.162C6.55625 12.162 5.92096 12.0323 5.32429 11.773C4.72761 11.5136 4.20634 11.1606 3.76047 10.714C3.31461 10.2674 2.96181 9.74599 2.70209 9.14968C2.44236 8.55337 2.3125 7.91826 2.3125 7.24436C2.3125 6.57046 2.44236 5.93518 2.70209 5.3385C2.96181 4.74183 3.31461 4.22056 3.76047 3.77469C4.20634 3.32882 4.72779 2.97603 5.32483 2.7163C5.92187 2.45658 6.55698 2.32672 7.23015 2.32672C7.79477 2.32672 8.33662 2.41778 8.8557 2.59992C9.37479 2.78205 9.862 3.04615 10.3173 3.39221L10.6998 3.00972C10.8 2.90955 10.9275 2.85946 11.0823 2.85946C11.2371 2.85946 11.3646 2.90955 11.4648 3.00972C11.565 3.1099 11.615 3.23739 11.615 3.39221C11.615 3.54702 11.565 3.67452 11.4648 3.77469L11.0823 4.15717C11.4284 4.61251 11.6925 5.09972 11.8746 5.61881C12.0567 6.13789 12.1478 6.67974 12.1478 7.24436C12.1478 7.91826 12.0179 8.55355 11.7582 9.15022C11.4985 9.7469 11.1457 10.2682 10.6998 10.714C10.254 11.1599 9.7325 11.5129 9.13546 11.773C8.53842 12.0331 7.90332 12.1627 7.23015 12.162ZM7.23015 11.0692C8.28653 11.0692 9.1881 10.6958 9.93485 9.94907C10.6816 9.20232 11.055 8.30075 11.055 7.24436C11.055 6.18798 10.6816 5.28641 9.93485 4.53966C9.1881 3.7929 8.28653 3.41953 7.23015 3.41953C6.17376 3.41953 5.27219 3.7929 4.52544 4.53966C3.77869 5.28641 3.40531 6.18798 3.40531 7.24436C3.40531 8.30075 3.77869 9.20232 4.52544 9.94907C5.27219 10.6958 6.17376 11.0692 7.23015 11.0692Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_3446_11482">
        <rect
          width="13.1137"
          height="13.1137"
          fill="white"
          transform="translate(0.671875 0.140625)"
        />
      </clipPath>
    </defs>
  </svg>
);

const Commoncd = ({ data, isRegistered, given, isCommunityQuiz }) => {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;
  const [registerLoading, setRegisterLoading] = useState(false);
  const [userRegistered, setUserRegistered] = useState(isRegistered || false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [bookmarked, setBookmarked] = useState(data.isBookmarked || false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareRef = useRef();
  console.log("User Registered:", isRegistered);

  const router = useRouter();

  // Determine the correct endpoints based on whether it's a community quiz

  // Check registration status on mount and when quiz changes
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        if (!data || !data._id) {
          console.error("Invalid quiz data:", data);
          setUserRegistered(false);
          return;
        }

        console.log("Checking registration for quiz ID:", data._id);

        const quizId = isCommunityQuiz ? data._id : data.id;

        const isRegisteredEndpoint = isCommunityQuiz
          ? `/community/quizzes/${quizId}/isRegistered`
          : `/quiz/isRegistered/${quizId}`;

        const response = await axios.post(
          isRegisteredEndpoint,
          {},
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        setUserRegistered(response.data.isRegistered);
        console.log("Registration status:", response.data);
      } catch (error) {
        setUserRegistered(false);
        toast.error(error.response?.data?.message || "An error occurred");
      }
    };
    checkRegistration();
    // eslint-disable-next-line
  }, [data._id]);

  const handleRegister = async () => {
    setRegisterLoading(true);
    try {
      if (!data || !data._id) {
        toast.error("Invalid quiz data");
        setRegisterLoading(false);
        return;
      }
      console.log("Registering for quiz ID:", data._id);
      if (userRegistered) {
        toast.error("You are already registered for this quiz!");
        setRegisterLoading(false);
        return;
      }

      const quizId = isCommunityQuiz ? data._id : data.id;

      const registerEndpoint = isCommunityQuiz
        ? `/community/quizzes/${quizId}/register`
        : `/quiz/registerQuiz/${quizId}`;

      const response = await axios.post(registerEndpoint);

      if (response.status === 200) {
        if (user && user.registeredQuizzes) {
          user.registeredQuizzes.push(data._id);
          localStorage.setItem("user", JSON.stringify(user));
        }
        toast.success(response.data.message || "Registered successfully!");
        window.location.reload();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      if (
        errorMessage.toLowerCase().includes("not verified") ||
        errorMessage.toLowerCase().includes("verification email sent")
      ) {
        toast.info(
          "You need to verify your email before registering. We've sent you a verification link. Please check your inbox (and spam folder)!"
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  useEffect(() => {
    const checkAttempted = async () => {
      try {
        console.log("Checking attempted status for quiz ID:", data);
        if (!data || !data._id) {
          console.error("Invalid quiz data:", data);
          setHasAttempted(false);
          return;
        }

        const quizId = isCommunityQuiz ? data._id : data.id;
        console.log("Quiz ID to check:", quizId);

        const response = await axios.get(
          `/community/quizzes/${quizId}/attempted`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setHasAttempted(response.data.attempted);
      } catch (e) {
        setHasAttempted(false);
      }
    };
    checkAttempted();
  }, [data._id]);

  // Timer for contest end
  useEffect(() => {
    const calculateEndTime = (endTime) => new Date(endTime);

    if (data && data.endTime) {
      const endDateTime = calculateEndTime(data.endTime);

      const updateCountdown = () => {
        const currentDateTime = new Date();

        if (currentDateTime >= endDateTime) {
          setTimeRemaining("Quiz has ended!");
          return;
        }

        const timeDiff = endDateTime - currentDateTime;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      };

      updateCountdown(); // Initial call
      const intervalId = setInterval(updateCountdown, 1000);

      return () => clearInterval(intervalId);
    }
  }, [data]);

  useEffect(() => {
    const checkBookmarked = async () => {
      try {
        // Use the correct itemType for your quiz
        const itemType = isCommunityQuiz
          ? "CommunityContest"
          : "GeneralContest";
        const res = await axios.get(`/bookmarks/user?itemType=${itemType}`);
        // res.data.bookmarks is an array of bookmark objects
        const found = Array.isArray(res.data.bookmarks)
          ? res.data.bookmarks.some(
            (bm) =>
              bm.bookmarkItem &&
              (bm.bookmarkItem._id === data._id ||
                bm.bookmarkItem.id === data._id)
          )
          : false;
        setBookmarked(found);
      } catch (err) {
        // Optionally handle error
      }
    };
    checkBookmarked();
    // eslint-disable-next-line
  }, [data._id, isCommunityQuiz]);

  const handleBookmark = async () => {
    setBookmarkLoading(true);
    const itemType = isCommunityQuiz ? "CommunityContest" : "GeneralContest";
    try {
      if (!bookmarked) {
        await axios.post(`/bookmarks/${itemType}/${data._id}`);
        setBookmarked(true);
        toast.success("Contest bookmarked!");
      } else {
        await axios.delete(`/bookmarks/${itemType}/${data._id}`);
        setBookmarked(false);
        toast.success("Bookmark removed!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Bookmark action failed");
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/community/contests/${data._id}`;
    if (navigator.share) {
      navigator.share({
        title: data.title,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Contest link copied!");
    }
  };

  const url = `${window.location.origin}/community/contests/${data._id}`;
  const title = data.title;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        setShowShareOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!data || !data.endTime) {
    return <div>Loading...</div>;
  }

  const eventDate = new Date(data.startTime).toLocaleDateString("en-GB");
  const eventTime = new Date(data.startTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const eventendtime = new Date(data.endTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const closeStartModal = () => {
    setIsStartModalOpen(false);
  };

  const handleStartQuiz = () => {
    closeStartModal();
    router.push(
      `/contest-question/${data._id}?isCommunityQuiz=${isCommunityQuiz}`
    );
  };

  // Time logic
  const now = Date.now();
  const quizStart = new Date(data.startTime).getTime();
  const quizEnd = new Date(data.endTime).getTime();

  return (
    <div className={styles["commoncd-container"]}>
      <div className={styles["commoncd-left"]}>
        <div className={styles["commoncd-left-heading"]}>
          <p>{data.title || "No Title"}</p>
          <div className={styles["heading-extras"]}>
            <div className={styles["remaining-time"]}>
              <StopWatchIcon />
              <span>
                {now >= quizStart &&
                  now <= quizEnd &&
                  `You can give Contest in: ${timeRemaining}`}
                {now < quizStart &&
                  (() => {
                    const diffInMs = quizStart - now;
                    const diffInDays = Math.floor(
                      diffInMs / (1000 * 60 * 60 * 24)
                    );
                    const diffInHrs = Math.floor(
                      (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                    );
                    const diffInMins = Math.floor(
                      (diffInMs % (1000 * 60 * 60)) / (1000 * 60)
                    );
                    const diffInSecs = Math.floor(
                      (diffInMs % (1000 * 60)) / 1000
                    );

                    return diffInDays > 0
                      ? `Contest will start in: ${diffInDays} day${diffInDays > 1 ? "s" : ""
                      } ${diffInHrs}hr ${diffInMins}min ${diffInSecs}s`
                      : `Contest will start in: ${diffInHrs}hr ${diffInMins}min ${diffInSecs}s`;
                  })()}
                {now > quizEnd && "Contest has ended"}
              </span>
            </div>
            <div className={styles.iconRow} ref={shareRef}>
              <button
                className={styles.iconButton}
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                title={bookmarked ? "Remove Bookmark" : "Bookmark"}
              >
                <BookmarkIcon filled={bookmarked} />
              </button>
              <button
                className={styles.iconButton}
                onClick={() => setShowShareOptions((prev) => !prev)}
                title="Share"
              >
                <ShareArrowIcon />
              </button>
              {showShareOptions && (
                <div className={styles.shareDropdown}>
                  <button
                    className={styles.copyLinkButton}
                    onClick={handleShare}
                    type="button"
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#24b2b4"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                    </svg>
                  </button>
                  <WhatsappShareButton url={url} title={title}>
                    <WhatsappIcon size={32} round />
                  </WhatsappShareButton>
                  <TwitterShareButton url={url} title={title}>
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>
                  <LinkedinShareButton url={url} title={title}>
                    <LinkedinIcon size={32} round />
                  </LinkedinShareButton>
                  <TelegramShareButton url={url} title={title}>
                    <TelegramIcon size={32} round />
                  </TelegramShareButton>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles["commoncd-left-details"]}>
          <span
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              fontWeight: "semibold",
            }}
          >
            <img src={CALENDAR} alt="" />
            {new Date(data.startTime).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            | {eventTime}
          </span>
          <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <img src={QUESTIONS} alt="" />
            No of Questions:{" "}
            <span>{data.questions ? data.questions.length : "N/A"}</span>
          </span>
          <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <img src={MARKS} alt="" />
            Total Marks:
            <span>{parseInt(data.questions.length) * 10 || "N/A"}</span>
          </span>
          <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <img src={DURATION} alt="" />
            Duration:{" "}
            <span>
              {(() => {
                if (data.timerMode === "full") {
                  if (typeof data.duration === "number" && !isNaN(data.duration)) {
                    const totalSeconds = data.duration * 60;
                    return totalSeconds > 90
                      ? `${data.duration} ${data.duration > 1 ? "minutes" : "minute"}`
                      : `${totalSeconds} ${totalSeconds > 1 ? "seconds" : "second"}`;
                  }
                  return "N/A";
                } else if (data.timerMode === "rapid") {
                  if (data.questions?.length > 0) {
                    const total = data.questions.reduce((sum, q) => sum + (q.timeLimit || 0), 0);
                    return total > 90
                      ? `${Math.round(total / 60)} ${Math.round(total / 60) > 1 ? "minutes" : "minute"}`
                      : `${total} ${total > 1 ? "seconds" : "second"}`;
                  }
                  return "N/A";
                } else {
                  // Fallback for other timer modes
                  if (typeof data.duration === "number" && !isNaN(data.duration)) {
                    const totalSeconds = data.duration * 60;
                    return totalSeconds > 90
                      ? `${data.duration} ${data.duration > 1 ? "minutes" : "minute"}`
                      : `${totalSeconds} ${totalSeconds > 1 ? "seconds" : "second"}`;
                  } else if (data.questions?.length > 0) {
                    const total = data.questions.reduce((sum, q) => sum + (q.timeLimit || 0), 0);
                    return total > 90
                      ? `${Math.round(total / 60)} ${Math.round(total / 60) > 1 ? "minutes" : "minute"}`
                      : `${total} ${total > 1 ? "seconds" : "second"}`;
                  }
                  return "N/A";
                }
              })()}
            </span>
          </span>

          <div className={styles["contesttotalregistered"]}>
            <div className={styles.contestavatarGroup}>
              {Array.from({ length: 3 }).map((_, index) => {
                const img = data.User_profile_Image?.[index];
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

              {data.User_profile_Image?.length > 3 && (
                <div
                  className={styles.contestavatarWrapper}
                  style={{ zIndex: 0 }}
                >
                  <div className={styles.moreCount}>
                    +{data.User_profile_Image.length - 3}
                  </div>
                </div>
              )}
            </div>
            <p className={styles.contestjoined}>
              +{data.totalRegistered - data.User_profile_Image.length} Joined
            </p>
          </div>
        </div>

        <div className={styles["commoncd-left-button"]}>
          {/* Contest Ended */}
          {now > quizEnd ? (
            <button disabled>Contest Ended</button>
          ) : now < quizStart ? (
            // Before contest starts
            <button
              onClick={handleRegister}
              disabled={userRegistered || registerLoading}
            >
              {registerLoading ? (
                <>
                  <span className={styles.loader}></span>
                  Registering...
                </>
              ) : userRegistered ? (
                "Already Registered!"
              ) : (
                "Register Now"
              )}
            </button>
          ) : hasAttempted ? (
            // During contest, but user already attempted
            <button
              className={styles["start-now-btn"]}
              disabled
              style={{ opacity: 0.7, cursor: "not-allowed" }}
            >
              Already Attempted
            </button>
          ) : userRegistered ? (
            // During contest, registered, not attempted
            <button
              className={styles["start-now-btn"]}
              onClick={() => router.push(`/start-contest/${data._id}`)}
            >
              Start Now
            </button>
          ) : (
            <button disabled className={styles["registration-closed-btn"]}>
              Registration Closed
            </button>
          )}
        </div>
      </div>
      <div className={styles["commoncd-right"]}>
        <div className={styles["commoncd-right-image"]}>
          {data.image ? (
            <img src={data.image} alt="" />
          ) : (
            <img src={contestBanner} alt="" />
          )}
        </div>
      </div>{" "}
      <Modal
        isOpen={isStartModalOpen}
        onRequestClose={closeStartModal}
        className={styles["enhancedModal"]}
        overlayClassName={styles["enhancedOverlay"]}
      >
        <div className={styles["modalHeader"]}>
          <div className={styles["modalIcon"]}>
            <Play size={32} color="#24b2b4" />
          </div>
          <button
            className={styles["closeButton"]}
            onClick={closeStartModal}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className={styles["modalContent"]}>
          <h2 className={styles["modalTitle"]}>Ready to Start Contest?</h2>
          <p className={styles["modalSubtitle"]}>
            {data.title || "Contest Challenge"}
          </p>

          <div className={styles["contestDetails"]}>
            <div className={styles["detailItem"]}>
              <Clock size={20} color="#24b2b4" />
              <div className={styles["detailText"]}>
                <span className={styles["detailLabel"]}>Duration</span>
                <span className={styles["detailValue"]}>
                  {typeof data.duration === "number" && !isNaN(data.duration)
                    ? data.duration > 90
                      ? `${Math.round(data.duration / 60)} ${Math.round(data.duration / 60) > 1
                        ? "minutes"
                        : "minute"
                      }`
                      : `${data.duration} ${data.duration > 1 ? "seconds" : "second"
                      }`
                    : data.questions && data.questions.length > 0
                      ? (() => {
                        const total = data.questions.reduce(
                          (sum, q) => sum + (q.timeLimit || 0),
                          0
                        );
                        return total > 90
                          ? `${Math.round(total / 60)} ${Math.round(total / 60) > 1 ? "minutes" : "minute"
                          }`
                          : `${total} ${total > 1 ? "seconds" : "second"}`;
                      })()
                      : "N/A"}
                </span>
              </div>
            </div>

            <div className={styles["detailItem"]}>
              <Trophy size={20} color="#24b2b4" />
              <div className={styles["detailText"]}>
                <span className={styles["detailLabel"]}>Questions</span>
                <span className={styles["detailValue"]}>
                  {data.questions?.length || data.numberOfQuestions || "N/A"}
                </span>
              </div>
            </div>

            <div className={styles["detailItem"]}>
              <Users size={20} color="#24b2b4" />
              <div className={styles["detailText"]}>
                <span className={styles["detailLabel"]}>Participants</span>
                <span className={styles["detailValue"]}>
                  {data.totalRegistered || 0}
                </span>
              </div>
            </div>

            {data.category && (
              <div className={styles["detailItem"]}>
                <Info size={20} color="#24b2b4" />
                <div className={styles["detailText"]}>
                  <span className={styles["detailLabel"]}>Category</span>
                  <span className={styles["detailValue"]}>{data.category}</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles["modalRules"]}>
            <h3 className={styles["rulesTitle"]}>Contest Rules</h3>
            <ul className={styles["rulesList"]}>
              <li className={styles["ruleItem"]}>
                <CheckCircle size={16} color="#22c55e" />
                Complete all questions within the time limit
              </li>
              <li className={styles["ruleItem"]}>
                <CheckCircle size={16} color="#22c55e" />
                You can only attempt this contest once
              </li>
              <li className={styles["ruleItem"]}>
                <AlertCircle size={16} color="#f59e0b" />
                Make sure you have stable internet connection
              </li>
            </ul>
          </div>
        </div>

        <div className={styles["modalFooter"]}>
          {hasAttempted ? (
            <div className={styles["attemptedMessage"]}>
              <AlertCircle size={20} color="#ef4444" />
              <span>You have already attempted this contest</span>
            </div>
          ) : (
            <>
              <button
                className={styles["cancelButton"]}
                onClick={closeStartModal}
              >
                Cancel
              </button>
              <button
                className={styles["startButton"]}
                onClick={handleStartQuiz}
              >
                <Play size={18} />
                Start Contest
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Commoncd;
