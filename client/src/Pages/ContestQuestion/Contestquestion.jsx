import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Contestquestion.module.css";
import { Link, useParams } from "react-router-dom";
import logo from "./assets/NexFellowLogo.svg";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { MdGridView } from "react-icons/md";
import Skeleton from "../../components/Skeleton/Skeleton";
import Modal from "react-modal";
import { Timer } from "lucide-react";
import { useScreenSize } from "../../hooks/useScreenSize";

const RenderQuestion = ({ question, index }) => {
  return (
    <pre className="whitespace-pre-wrap disableSelection" key={index}>
      <code>{question?.text}</code>
    </pre>
  );
};

// Skeleton Loading Component for Questions
const QuestionSkeleton = () => {
  return (
    <div className={styles.questionSkeletonContainer}>
      <Skeleton type="questionText" />
      <Skeleton type="option" count={4} />
    </div>
  );
};

const ContestQuestion = () => {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const userId = JSON.parse(localStorage.getItem("user"))?.userId || null;
  const [timer, setTimer] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [responses, setResponses] = useState([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const timerInterval = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [timerMode, setTimerMode] = useState("full"); // "full" or "rapid"
  const [quizDuration, setQuizDuration] = useState(null); // Store quiz duration
  const [completedQuestions, setCompletedQuestions] = useState(new Set()); // Track completed questions in rapid mode  const [jumpQuestion, setJumpQuestion] = useState("");
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const popoverRef = useRef(null);
  const { isMobile } = useScreenSize();
  const defaultQuestionTime = 60; // 60 seconds default for questions without timeLimit
  const [showAutoSubmitModal, setShowAutoSubmitModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [perQuestionTimes, setPerQuestionTimes] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const isCommunityQuiz =
    new URLSearchParams(window.location.search).get("isCommunityQuiz") ===
    "true";
  useEffect(() => {
    const getQuestions = async () => {
      try {
        setLoading(true);
        const endpoint = isCommunityQuiz
          ? `/community/user/${id}/questions`
          : `/quiz/getQuestions/${id}`;

        const response = await axios.get(endpoint);
        console.log(response);
        const { questions, duration } = response.data; // Determine timer mode
        const hasQuestionTimeLimits = questions.some((q) => q.timeLimit);
        const mode = duration
          ? "full"
          : hasQuestionTimeLimits
            ? "rapid"
            : "full";
        setTimerMode(mode);
        setQuizDuration(duration);

        if (mode === "full") {
          // Full quiz timer mode
          const storedTimer = sessionStorage.getItem(
            `quizTimer_${userId}_${id}`
          );
          if (storedTimer) {
            const startTime = parseInt(storedTimer);
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, duration - elapsed);
            setTimer(remaining);
          } else {
            setTimer(duration);
          }
        } else {
          // Rapid mode - set timer for current question
          const currentQuestion = questions[0];
          const questionTime =
            currentQuestion?.timeLimit || defaultQuestionTime;
          setTimer(questionTime);
        }

        setQuestions(questions);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    getQuestions();
  }, [id, isCommunityQuiz, userId, defaultQuestionTime]);
  const startRapidTimer = useCallback((initialTime) => {
    clearInterval(timerInterval.current);
    setTimer(initialTime);
    timerInterval.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(timerInterval.current);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  }, []);

  const initializeRapidTimer = useCallback(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentIndex];
      const questionTime = currentQuestion?.timeLimit || defaultQuestionTime;
      setQuestionStartTime(Date.now()); // <-- Add this
      startRapidTimer(questionTime);
    }
  }, [questions, currentIndex, defaultQuestionTime, startRapidTimer]);

  const startTimer = useCallback((startTime, totalDuration) => {
    clearInterval(timerInterval.current);
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, totalDuration - elapsed);
    setTimer(remaining);

    timerInterval.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(timerInterval.current);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  }, []);
  const initializeQuiz = useCallback(
    (duration) => {
      setCurrentIndex(0);
      if (timerMode === "full") {
        const startTime = Date.now();
        sessionStorage.setItem(
          `quizTimer_${userId}_${id}`,
          startTime.toString()
        );
        startTimer(startTime, duration);
      } else {
        initializeRapidTimer();
      }
    },
    [timerMode, userId, id, startTimer, initializeRapidTimer]
  );
  useEffect(() => {
    const storedFormSubmitted = localStorage.getItem(
      `quizFormSubmitted_${userId}_${id}`
    );

    if (storedFormSubmitted === "true") {
      setFormSubmitted(true);
      setTimer(0);
      return;
    }

    // Only initialize timer when we have questions and haven't submitted yet
    if (questions.length > 0 && !formSubmitted && timerMode) {
      if (timerMode === "full" && quizDuration) {
        // Full quiz timer mode
        const storedTimer = sessionStorage.getItem(`quizTimer_${userId}_${id}`);
        if (storedTimer) {
          const startTime = parseInt(storedTimer);
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          const remaining = Math.max(0, quizDuration - elapsed);
          setTimer(remaining);
          if (remaining > 0) {
            startTimer(startTime, quizDuration);
          }
        } else {
          initializeQuiz(quizDuration);
        }
      } else if (timerMode === "rapid") {
        // Rapid mode - start timer for current question
        initializeRapidTimer();
      }
    }

    return () => clearInterval(timerInterval.current);
  }, [
    id,
    timerMode,
    questions.length,
    userId,
    formSubmitted,
    quizDuration,
    startTimer,
    initializeQuiz,
    initializeRapidTimer,
  ]);
  // const handleOptionChange = (e) => {
  //   const index = parseInt(e.target.name.split("-")[1]);
  //   const optionText = e.target.value;
  //   const updatedResponses = [...responses];
  //   updatedResponses[index] = optionText;
  //   setResponses(updatedResponses);
  // };

  // const handleCheckboxChange = (e, index) => {
  //   const { value, checked } = e.target;
  //   setResponses((prevResponses) => {
  //     const updatedResponses = [...prevResponses];
  //     if (!Array.isArray(updatedResponses[index])) {
  //       updatedResponses[index] = [];
  //     }

  //     if (checked) {
  //       updatedResponses[index] = [...updatedResponses[index], value];
  //     } else {
  //       updatedResponses[index] = updatedResponses[index].filter(
  //         (response) => response !== value
  //       );
  //     }
  //     return updatedResponses;
  //   });
  // };

  // const handleTextChange = (e) => {
  //   const index = parseInt(e.target.name.split("-")[1]);
  //   const text = e.target.value;

  //   setResponses((prevResponses) => {
  //     const updatedResponses = [...prevResponses];
  //     updatedResponses[index] = [text];
  //     return updatedResponses;
  //   });
  // };
  const handleSubmit = useCallback(async () => {
    if (timerMode === "rapid") {
      setCompletedQuestions((prev) => new Set([...prev, currentIndex]));
    }

    setFormSubmitted(true);
    localStorage.setItem(`quizFormSubmitted_${userId}_${id}`, "true");
    sessionStorage.removeItem(`quizTimer_${userId}_${id}`);
    setTimer(0);

    const formattedResponses = questions.map((question, index) => ({
      questionId: question._id,
      response: responses[index],
    }));

    // Calculate timeTaken
    let updatedPerQuestionTimes = [...perQuestionTimes];
    if (timerMode === "rapid") {
      updatedPerQuestionTimes[currentIndex] = (updatedPerQuestionTimes[currentIndex] || 0) + Math.floor((Date.now() - questionStartTime) / 1000);
    }
    let timeTaken = timerMode === "rapid"
      ? updatedPerQuestionTimes.reduce((a, b) => a + (b || 0), 0)
      : (quizDuration - timer);

    try {
      const endpoint = isCommunityQuiz
        ? `/community/quizzes/${id}/submit`
        : `/quiz/submitQuiz/${id}`;

      const response = await axios.post(endpoint, {
        answers: formattedResponses,
        timeTaken,
      });

      if (response.status === 200) {
        toast.success("Quiz submitted successfully", {
          position: "top-left",
          autoClose: 2000,
          hideProgressBar: true,
        });
        setTimeout(() => {
          if (document.exitFullscreen) document.exitFullscreen();
          navigate(`/contest-completed/${id}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error(error.response?.data, {
        position: "top-left",
        autoClose: 2000,
        hideProgressBar: true,
      });
      setTimeout(() => {
        navigate(`/contest-completed/${id}`);
      }, 2000);
    }
  }, [
    userId,
    id,
    questions,
    responses,
    isCommunityQuiz,
    navigate,
    timerMode,
    currentIndex,
    quizDuration,
    timer,
    perQuestionTimes,
    questionStartTime,
  ]);

  const handleClickAfter = useCallback(() => {
    if (timerMode === "rapid") {
      setPerQuestionTimes(prev => {
        const newTimes = [...prev];
        newTimes[currentIndex] = (newTimes[currentIndex] || 0) + Math.floor((Date.now() - questionStartTime) / 1000);
        return newTimes;
      });
      setQuestionStartTime(Date.now()); // <-- Add this
      setCompletedQuestions((prev) => new Set([...prev, currentIndex]));
    }

    const newIndex = Math.min(questions.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex);

    if (timerMode === "rapid" && newIndex < questions.length) {
      const question = questions[newIndex];
      const questionTime = question?.timeLimit || defaultQuestionTime;
      startRapidTimer(questionTime);
    }
  }, [
    questions,
    currentIndex,
    timerMode,
    defaultQuestionTime,
    startRapidTimer,
    questionStartTime,
  ]);

  const handleQuestionNavigation = useCallback(
    (index) => {
      if (timerMode === "rapid" && completedQuestions.has(index)) {
        return;
      }

      if (timerMode === "rapid") {
        setPerQuestionTimes(prev => {
          const newTimes = [...prev];
          newTimes[currentIndex] = (newTimes[currentIndex] || 0) + Math.floor((Date.now() - questionStartTime) / 1000);
          return newTimes;
        });
        setQuestionStartTime(Date.now());
      }

      setCurrentIndex(index);

      if (timerMode === "rapid") {
        const question = questions[index];
        const questionTime = question?.timeLimit || defaultQuestionTime;
        startRapidTimer(questionTime);
      }
    },
    [
      timerMode,
      questions,
      defaultQuestionTime,
      startRapidTimer,
      completedQuestions,
      currentIndex,
      questionStartTime,
    ]
  );

  const handleClick = useCallback(() => {
    // In rapid mode, prevent going back to previous questions
    if (timerMode === "rapid") {
      return; // Block backward navigation in rapid mode
    }

    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);

    if (timerMode === "rapid") {
      // Reset timer for the new question
      const question = questions[newIndex];
      const questionTime = question?.timeLimit || defaultQuestionTime;
      startRapidTimer(questionTime);
    }
  }, [
    currentIndex,
    timerMode,
    questions,
    defaultQuestionTime,
    startRapidTimer,
  ]);

  useEffect(() => {
    if (timer <= 0 && !formSubmitted) {
      clearInterval(timerInterval.current);

      if (timerMode === "rapid" && currentIndex < questions.length - 1) {
        setPerQuestionTimes(prev => {
          const newTimes = [...prev];
          newTimes[currentIndex] = (newTimes[currentIndex] || 0) + Math.floor((Date.now() - questionStartTime) / 1000);
          return newTimes;
        });
        setQuestionStartTime(Date.now());
        handleClickAfter();
      } else if (timerMode === "full" || currentIndex === questions.length - 1) {
        setShowAutoSubmitModal(true);
        setCountdown(5);
      }
    }
  }, [
    timer,
    formSubmitted,
    timerMode,
    currentIndex,
    questions.length,
    handleClickAfter,
    handleSubmit,
    questionStartTime,
  ]);

  useEffect(() => {
    if (!showAutoSubmitModal) return;

    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setShowAutoSubmitModal(false);
          handleSubmit();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [showAutoSubmitModal, handleSubmit]);

  useEffect(() => {
    if (formSubmitted) {
      navigate(`/contest-completed/${id}`);
    }
  }, [formSubmitted, navigate]);
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      handleSubmit();
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [handleSubmit]);

  const confirmEndTest = () => {
    setShowModal(true);
  };

  const cancelEndTest = () => {
    setShowModal(false);
  };

  const confirmSubmit = () => {
    setShowModal(false);
    handleSubmit(); // original submit function
  };

  const confirmClearAll = () => {
    setShowClearAllModal(true);
  };

  const cancelClearAll = () => {
    setShowClearAllModal(false);
  };

  const clearAllResponses = () => {
    setShowClearAllModal(false);
    setResponses(new Array(questions.length).fill(""));
    toast.success("All responses cleared successfully!");
  };

  // Check if there are any responses to clear
  const hasAnyResponses = responses.some(
    (response) => response && response.length > 0
  );

  // const [jumpQuestion, setJumpQuestion] = useState("");
  const togglePopover = () => {
    setShowAllQuestions((prev) => !prev);
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowAllQuestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // const handleJumpToQuestion = (e) => {
  //   e.preventDefault();
  //   const questionNumber = parseInt(jumpQuestion);
  //   if (
  //     !isNaN(questionNumber) &&
  //     questionNumber >= 1 &&
  //     questionNumber <= questions.length
  //   ) {
  //     const newIndex = questionNumber - 1;
  //     // In rapid mode, prevent navigation to completed questions
  //     if (timerMode === "rapid" && completedQuestions.has(newIndex)) {
  //       toast.warn("Cannot revisit completed questions in rapid mode");
  //       return;
  //     }
  //     handleQuestionNavigation(newIndex);
  //     setJumpQuestion("");
  //   } else {
  //     toast.error("Invalid question number");
  //   }
  // };

  // Handle tab switching with 2 warnings and submission on the 3rd switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setTabSwitchCount((prevCount) => {
          const newCount = prevCount + 1;
          if (newCount === 1 || newCount === 2) {
            toast.warn(
              `Warning: You have switched tabs ${newCount} times! Stay on the quiz.`
            );
          } else if (newCount >= 3) {
            toast.error("Quiz auto-submitted after 3 tab switches.");
            handleSubmit(); // Auto-submit after the third tab switch
          }
          return newCount;
        });
      }
    };

    const enterFullscreen = () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    };

    const handleFullscreenChange = () => {
      if (
        !document.fullscreenElement &&
        !document.webkitFullscreenElement &&
        !document.mozFullScreenElement &&
        !document.msFullscreenElement
      ) {
        // User exited fullscreen, re-enter it
        enterFullscreen();
      }
    };

    // Enter fullscreen when component mounts
    enterFullscreen();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, [handleSubmit]);

  if (
    loading ||
    !Array.isArray(questions) ||
    currentIndex >= questions.length
  ) {
    return <Skeleton active />;
  }

  const currentQuestion = questions[currentIndex];
  const answeredQuestions = responses.filter(
    (response) => response && response.length !== 0
  ).length;
  const progressPercentage = (answeredQuestions / questions.length) * 100;

  return (
    <main className={styles.main}>
      <nav className={styles.navbar}>
        <div className={styles.logoContainer}>
          <Link to="/">
            <img src={logo} alt="Logo" className={styles.logo} />
          </Link>
        </div>
        <div className={styles.timerSection}>
          {" "}
          <p className={styles.timerText}>
            <Timer size={isMobile ? 16 : 20} />
            {Math.floor(timer / 60)}:{timer % 60 < 10 ? "0" : ""}
            {timer % 60} {timerMode === "rapid" ? "sec" : "Min"}
          </p>
          {/* {timerMode === "rapid" && (
            <p
              className={styles.rapidModeIndicator}
              style={{ fontSize: "12px", color: "#ff6b6b", marginTop: "4px" }}
            >
              ⚡ Rapid Mode: No going back!
            </p>
          )} */}
          <button
            onClick={confirmEndTest}
            className={styles.endTestButton}
            disabled={formSubmitted}
          >
            Submit Contest
          </button>
        </div>
      </nav>

      <div
        className={`max-w-7xl w-full px-4 sm:px-6 lg:px-8`}
        style={{ margin: "0 auto", paddingTop: "20px" }}
      >
        {/* <aside className={styles.sidebar}>
          <h4 className={styles.sidebarTitle}>Questions</h4>
          <div className={styles.questionNavScroll}>
            {loading ? (
              <Skeleton type="circular" count={5} />
            ) : (
              <ul className={styles.questionNavList}>
                {questions.map((_, index) => (
                  <li key={index}>
                    <button
                      className={
                        (
                          timerMode === "rapid"
                            ? completedQuestions.has(index)
                            : index < currentIndex
                        )
                          ? styles.navDone
                          : index === currentIndex
                          ? styles.navActive
                          : styles.navPending
                      }
                      onClick={() => handleQuestionNavigation(index)}
                      disabled={
                        formSubmitted ||
                        (timerMode === "rapid" && completedQuestions.has(index))
                      }
                      title={
                        timerMode === "rapid" && completedQuestions.has(index)
                          ? "Cannot revisit completed questions in rapid mode"
                          : ""
                      }
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside> */}
        <section className={styles.questionSection}>
          {loading ? (
            <>
              <div className={styles.loadingProgress}>
                <Skeleton type="progressBar" />
                <div className={styles.loadingText}>Loading...</div>
              </div>
              <QuestionSkeleton />
            </>
          ) : (
            <>
              <div className={styles.progressHeader}>
                <div className={styles.progressDetails}>
                  <span
                    className={
                      responses[currentIndex]
                        ? styles.questionNumber
                        : styles.questionNumberIncomplete
                    }
                  >
                    Question {currentIndex + 1}
                    {/* of {questions.length} */}
                  </span>
                  <span>{progressPercentage.toFixed(0)}% Completed</span>
                </div>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className={styles.questionContent}>
                <RenderQuestion
                  question={currentQuestion}
                  index={currentIndex + 1}
                />
              </div>
              <div className={styles.optionsContainer}>
                {currentQuestion?.type === "radio" &&
                  currentQuestion.options.map((option, idx) => (
                    <button
                      key={option._id}
                      type="button"
                      className={`${styles.option} ${responses[currentIndex] === option.text
                        ? styles.optionSelected
                        : ""
                        }`}
                      onClick={() => {
                        if (!formSubmitted) {
                          const updatedResponses = [...responses];
                          updatedResponses[currentIndex] = option.text;
                          setResponses(updatedResponses);
                        }
                      }}
                      disabled={formSubmitted}
                    >
                      <span className={`opNo ${styles.counterLabel}`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option.text}</span>
                    </button>
                  ))}

                {currentQuestion?.type === "checkbox" &&
                  currentQuestion.options.map((option) => (
                    <button
                      key={option._id}
                      type="button"
                      className={`${styles.option} ${responses[currentIndex]?.includes(option.text)
                        ? styles.optionSelected
                        : ""
                        }`}
                      onClick={() => {
                        if (!formSubmitted) {
                          setResponses((prevResponses) => {
                            const updatedResponses = [...prevResponses];
                            if (
                              !Array.isArray(updatedResponses[currentIndex])
                            ) {
                              updatedResponses[currentIndex] = [];
                            }
                            if (
                              updatedResponses[currentIndex].includes(
                                option.text
                              )
                            ) {
                              updatedResponses[currentIndex] = updatedResponses[
                                currentIndex
                              ].filter((response) => response !== option.text);
                            } else {
                              updatedResponses[currentIndex] = [
                                ...updatedResponses[currentIndex],
                                option.text,
                              ];
                            }
                            return updatedResponses;
                          });
                        }
                      }}
                      disabled={formSubmitted}
                    >
                      <span>{option.text}</span>
                    </button>
                  ))}

                {/* {currentQuestion?.type === "text" && (
                              <input
                              type="text"
                              value={responses[currentIndex] || ""}
                              onChange={handleTextChange}
                              disabled={formSubmitted}
                              className={styles.textInput}
                              placeholder="Type your answer..."
                              />
                            )} */}
              </div>
              {timerMode === "rapid" && (
                <div className={styles.navigationButtons}>
                  <button
                    onClick={handleClick}
                    className={styles.navBtn}
                    disabled={currentIndex === 0 || timerMode === "rapid"}
                    title={
                      timerMode === "rapid"
                        ? "Cannot go back to previous questions in rapid mode"
                        : currentIndex === 0
                          ? "This is the first question"
                          : ""
                    }
                  >
                    <MdOutlineKeyboardArrowLeft />
                    Previous
                  </button>
                  <div
                    className={`${isMobile
                      ? "w-full flex flex-col gap-2"
                      : "w-fit flex items-center gap-2"
                      }`}
                  >
                    {" "}
                    {responses[currentIndex] && (
                      <button
                        className={styles.navBtn}
                        onClick={() => {
                          const updatedResponses = [...responses];
                          updatedResponses[currentIndex] = "";
                          setResponses(updatedResponses);
                        }}
                        disabled={formSubmitted}
                      >
                        Clear Answer
                      </button>
                    )}
                    {responses.some(
                      (response) => response && response.length > 0
                    ) && (
                        <button
                          className={`${styles.navBtn} ${styles.clearAllBtn}`}
                          onClick={confirmClearAll}
                          disabled={formSubmitted}
                          title="Clear all responses in the quiz"
                        >
                          Clear All Responses
                        </button>
                      )}
                    {currentIndex === questions.length - 1 ? (
                      <button
                        onClick={confirmEndTest}
                        className={`${styles.navBtn} ${styles.submitBtn}`}
                        disabled={formSubmitted}
                      >
                        Submit
                      </button>
                    ) : (
                      <button
                        onClick={handleClickAfter}
                        className={styles.navBtn}
                        disabled={currentIndex === questions.length - 1}
                      >
                        Next
                        <MdOutlineKeyboardArrowRight />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
        {timerMode !== "rapid" && (
          <section className={styles.questionNavigation}>
            <div className={styles.navigationControls}>
              <div className={styles.navBtnContainer}>
                <button
                  onClick={handleClick}
                  className={styles.navBtn}
                  disabled={currentIndex === 0 || timerMode === "rapid"}
                  title={
                    timerMode === "rapid"
                      ? "Cannot go back to previous questions in rapid mode"
                      : currentIndex === 0
                        ? "This is the first question"
                        : ""
                  }
                >
                  <MdOutlineKeyboardArrowLeft />
                  Previous
                </button>
              </div>
              <div className={styles.questionNavScroll}>
                {loading ? (
                  <Skeleton type="circular" count={5} />
                ) : (
                  <ul className={styles.questionNavList}>
                    {questions
                      .slice(
                        Math.max(
                          0,
                          Math.min(
                            currentIndex - (isMobile ? 1 : 5),
                            questions.length - (isMobile ? 3 : 10)
                          )
                        ),
                        Math.max(
                          isMobile ? 3 : 10,
                          Math.min(
                            questions.length,
                            currentIndex + (isMobile ? 2 : 5)
                          )
                        )
                      )
                      .map((_, idx) => {
                        const index =
                          Math.max(
                            0,
                            Math.min(
                              currentIndex - (isMobile ? 1 : 5),
                              questions.length - (isMobile ? 3 : 10)
                            )
                          ) + idx;
                        return (
                          <li key={index}>
                            <button
                              className={
                                timerMode === "rapid" &&
                                  completedQuestions.has(index)
                                  ? styles.navDone
                                  : index === currentIndex
                                    ? styles.navActive
                                    : styles.navPending
                              }
                              onClick={() => handleQuestionNavigation(index)}
                              disabled={
                                formSubmitted ||
                                (timerMode === "rapid" &&
                                  completedQuestions.has(index))
                              }
                              title={
                                timerMode === "rapid" &&
                                  completedQuestions.has(index)
                                  ? "Cannot revisit completed questions in rapid mode"
                                  : ""
                              }
                            >
                              {index + 1}
                            </button>
                          </li>
                        );
                      })}
                    {questions.length > (isMobile ? 3 : 10) && (
                      <li className={styles.popoverContainer} ref={popoverRef}>
                        <button
                          className={styles.allQuestionsButton}
                          onClick={togglePopover}
                          title="Show all questions"
                        >
                          <MdGridView size={20} />
                        </button>
                        {showAllQuestions && (
                          <div
                            className={styles.popover}
                            style={{ width: 480 }}
                          >
                            <div className={styles.popoverTitle}>
                              Questions Overview
                            </div>
                            <div
                              className={styles.popoverGrid}
                              style={{
                                gridTemplateColumns: "repeat(6, 1fr)",
                                marginBottom: 16,
                              }}
                            >
                              {questions.map((_, index) => {
                                const isAnswered =
                                  !!responses[index] &&
                                  responses[index].length !== 0;
                                return (
                                  <button
                                    key={index}
                                    className={
                                      index === currentIndex
                                        ? styles.navCurrent
                                        : isAnswered
                                          ? styles.navActive // Use navActive for answered (teal)
                                          : styles.navPending // Use navPending for not answered (cyan)
                                    }
                                    style={{ margin: 2, borderRadius: 8 }}
                                    onClick={() => {
                                      handleQuestionNavigation(index);
                                      setShowAllQuestions(false);
                                    }}
                                    disabled={
                                      formSubmitted ||
                                      (timerMode === "rapid" &&
                                        completedQuestions.has(index))
                                    }
                                  >
                                    {index + 1}
                                  </button>
                                );
                              })}
                            </div>
                            <div className={styles.popoverLegend}>
                              <div className={styles.legendItem}>
                                <div
                                  className={`${styles.legendDot} ${styles.answeredDot}`}
                                ></div>
                                <span>
                                  Answered:{" "}
                                  {
                                    responses.filter((r) => r && r.length !== 0)
                                      .length
                                  }
                                </span>
                              </div>
                              <div className={styles.legendItem}>
                                <div
                                  className={`${styles.legendDot} ${styles.notAnsweredDot}`}
                                ></div>
                                <span>
                                  Not Answered:{" "}
                                  {questions.length -
                                    responses.filter((r) => r && r.length !== 0)
                                      .length}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    )}
                  </ul>
                )}
              </div>{" "}
              <div className={styles.navBtnContainer}>
                {responses.some(
                  (response) => response && response.length > 0
                ) && (
                    <button
                      className={`${styles.navBtn} ${styles.clearAllBtn}`}
                      onClick={confirmClearAll}
                      disabled={formSubmitted}
                      title="Clear all responses in the quiz"
                    >
                      Clear All Responses
                    </button>
                  )}
                <button
                  onClick={handleClickAfter}
                  className={styles.navBtn}
                  disabled={currentIndex === questions.length - 1}
                >
                  Next
                  <MdOutlineKeyboardArrowRight />
                </button>
              </div>
            </div>
            {/* 
                  <form className={styles.jumpContainer} onSubmit={handleJumpToQuestion}>
                    <input
                      type="text"
                      value={jumpQuestion}
                      onChange={(e) => setJumpQuestion(e.target.value)}
                      placeholder="20"
                      className={styles.jumpInput}
                      disabled={formSubmitted}
                      aria-label="Jump to question number"
                    />
                    <button 
                      type="submit" 
                      className={styles.jumpIcon}
                      disabled={formSubmitted}
                    >
                      <MdGridView size={20} />
                    </button>
                    </form> */}
          </section>
        )}
      </div>

      {showAutoSubmitModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Time&apos;s Up!</h3>
            <p>Your quiz will be auto-submitted in {countdown}...</p>
          </div>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onRequestClose={cancelEndTest}
        className={styles.modal}
        overlayClassName={styles.modalOverlay}
        contentLabel="Confirm Submit"
        ariaHideApp={false}
      >
        <h3 className={styles.modalTitle}>
          Are you sure you want to end the test?
        </h3>
        <p className={styles.modalBody}>All responses will be submitted.</p>
        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={cancelEndTest}>
            Cancel
          </button>
          <button className={styles.modalConfirmBtn} onClick={confirmSubmit}>
            Submit Test
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showClearAllModal}
        onRequestClose={cancelClearAll}
        className={styles.modal}
        overlayClassName={styles.modalOverlay}
        contentLabel="Confirm Clear All Responses"
        ariaHideApp={false}
      >
        <h3 className={styles.modalTitle}>Clear All Responses</h3>
        <p className={styles.modalBody}>
          Are you sure you want to clear all responses? This action cannot be
          undone.
        </p>
        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={cancelClearAll}>
            Cancel
          </button>
          <button
            className={styles.modalConfirmBtn}
            onClick={clearAllResponses}
          >
            Clear All
          </button>
        </div>
      </Modal>

      <ToastContainer />
    </main>
  );
};

export default ContestQuestion;
