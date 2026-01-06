"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import api from "../../lib/axios";
import {
  Calendar,
  Clock,
  Users,
  FileEdit,
  PlusCircle,
  BookOpen,
  Info,
  AlertCircle,
  Share2,
  Download,
  Sparkle,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// styles
import styles from "./Quiz.module.css";

import Question from "../../components/Question/Question";
import AddQuestion from "../../components/AddQuestion/AddQuestion";
import BackButton from "../../components/BackButton/BackButton";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import RewardModal from "../../components/RewardModal/RewardModal";
import { toast } from "sonner";

// Skeleton components for quiz details
const QuizDetailSkeleton = () => (
  <div className={styles.detailsWrapper}>
    {/* Title & Category Skeleton */}
    <div className={styles.header}>
      <div
        className={`${styles.shimmer}`}
        style={{ width: "60%", height: "36px", borderRadius: "6px" }}
      ></div>
      <div
        className={`${styles.shimmer}`}
        style={{ width: "90px", height: "32px", borderRadius: "20px" }}
      ></div>
    </div>

    {/* Description Card Skeleton */}
    <div className={`${styles.card} ${styles.skeletonCard}`}>
      <div
        className={`${styles.shimmer}`}
        style={{
          width: "160px",
          height: "26px",
          marginBottom: "18px",
          borderRadius: "4px",
        }}
      ></div>
      <div
        className={`${styles.shimmer}`}
        style={{
          width: "100%",
          height: "20px",
          marginBottom: "12px",
          borderRadius: "4px",
        }}
      ></div>
      <div
        className={`${styles.shimmer}`}
        style={{
          width: "92%",
          height: "20px",
          marginBottom: "12px",
          borderRadius: "4px",
        }}
      ></div>
      <div
        className={`${styles.shimmer}`}
        style={{
          width: "95%",
          height: "20px",
          marginBottom: "22px",
          borderRadius: "4px",
        }}
      ></div>

      <div
        className={`${styles.shimmer}`}
        style={{
          width: "140px",
          height: "22px",
          marginBottom: "12px",
          marginLeft: "8px",
          borderRadius: "4px",
        }}
      ></div>
      {[1, 2, 3].map((_, i) => (
        <div
          key={i}
          className={`${styles.shimmer}`}
          style={{
            width: `${80 - i * 7}%`,
            height: "16px",
            marginBottom: "10px",
            marginLeft: "32px",
            borderRadius: "4px",
          }}
        ></div>
      ))}
    </div>

    {/* Rules Card Skeleton */}
    <div className={`${styles.card} ${styles.skeletonCard}`}>
      <div
        className={`${styles.shimmer}`}
        style={{
          width: "120px",
          height: "26px",
          marginBottom: "18px",
          borderRadius: "4px",
        }}
      ></div>
      {[1, 2, 3, 4].map((_, i) => (
        <div
          key={i}
          className={`${styles.shimmer}`}
          style={{
            width: `${95 - i * 5}%`,
            height: "16px",
            marginBottom: "12px",
            marginLeft: "12px",
            borderRadius: "4px",
          }}
        ></div>
      ))}
    </div>

    {/* Info Grid Skeleton */}
    <div
      className={`${styles.infoGrid} ${styles.skeletonInfoGrid}`}
      style={{ background: "#e6f4f4" }}
    >
      {[1, 2, 3, 4, 5, 6].map((_, i) => (
        <div key={i} className={styles.skeletonInfoItem}>
          <div
            className={`${styles.shimmer}`}
            style={{
              width: "28px",
              height: "28px",
              display: "inline-block",
              borderRadius: "50%",
              verticalAlign: "middle",
            }}
          ></div>
          <div
            className={`${styles.shimmer}`}
            style={{
              width: "120px",
              height: "18px",
              marginLeft: "12px",
              display: "inline-block",
              borderRadius: "4px",
              verticalAlign: "middle",
            }}
          ></div>
        </div>
      ))}
    </div>

    {/* Action Buttons Skeleton */}
    <div className={styles.actionButtons}>
      {[1, 2, 3, 4, 5].map((_, i) => (
        <div
          key={i}
          className={`${styles.shimmer}`}
          style={{
            width: "140px",
            height: "40px",
            borderRadius: "10px",
            flex: "0 0 auto",
          }}
        ></div>
      ))}
    </div>
  </div>
);

// Skeleton component for questions
const QuestionsSkeleton = () => (
  <div className={styles.container}>
    <div className={styles.skeletonHeader}>
      <div
        className={`${styles.heading} ${styles.shimmer}`}
        style={{ width: "180px", height: "28px", marginBottom: "20px" }}
      ></div>
    </div>
    {[1, 2, 3].map((_, i) => (
      <div
        key={i}
        className={styles.questionSkeleton}
        style={{
          padding: "20px",
          marginBottom: "20px",
          border: "1px solid #e6e6e6",
          borderRadius: "12px",
          backgroundColor: "white",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          className={`${styles.shimmer}`}
          style={{ width: "85%", height: "22px", marginBottom: "20px" }}
        ></div>
        <div
          className={`${styles.shimmer}`}
          style={{ width: "65%", height: "18px", marginBottom: "16px" }}
        ></div>
        {[1, 2, 3, 4].map((_, j) => (
          <div
            key={j}
            className={`${styles.shimmer}`}
            style={{
              width: `${40 - j * 5}%`,
              height: "16px",
              marginBottom: "12px",
              marginLeft: "20px",
            }}
          ></div>
        ))}
        <div
          className={`${styles.shimmer}`}
          style={{
            width: "120px",
            height: "22px",
            marginTop: "16px",
            borderRadius: "4px",
          }}
        ></div>
      </div>
    ))}
  </div>
);

const Quiz = () => {
  const params = useParams();
  const id = params?.id;
  const pathname = usePathname();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allQuestions, setAllQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState(null);

  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [participantsError, setParticipantsError] = useState(null);

  const [addQuestion, setAddQuestion] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAddReward, setShowAddReward] = useState(false);

  // New state for tabs and export functionality
  const [activeTab, setActiveTab] = useState("overview");
  const [isExporting, setIsExporting] = useState(false);

  // New states for improved UX
  const [isSendingUpdate, setIsSendingUpdate] = useState(false);
  const [isCalculatingResult, setIsCalculatingResult] = useState(false);

  // Remove overviewLoading since we'll use per-tab loading states

  const convertToIST = (dateString, includeDate = true) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: includeDate ? "numeric" : undefined,
      month: includeDate ? "long" : undefined,
      day: includeDate ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/community/quizzes/${id}`, {
        withCredentials: true,
      });

      const quizData = response.data.quiz;
      console.log("data", response.data);

      if (quizData.rules && typeof quizData.rules[0] === "string") {
        try {
          quizData.rules = JSON.parse(quizData.rules[0]);
        } catch (error) {
          console.error("Failed to parse rules:", error);
        }
      }

      // Ensure misc is properly assigned
      quizData.misc = Array.isArray(quizData.misc) ? quizData.misc : [];

      setQuiz(quizData);
      console.log(quizData);
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
      setError("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchQuestions = useCallback(async () => {
    setQuestionsLoading(true);
    try {
      const response = await api.get(`/community/creator/${id}/questions`, {
        withCredentials: true,
      });
      setAllQuestions(response.data.questions);
      console.log("questions", response.data);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setQuestionsError("Failed to load questions");
    } finally {
      setQuestionsLoading(false);
    }
  }, [id]);

  const fetchParticipants = useCallback(async () => {
    setParticipantsLoading(true);
    try {
      const response = await api.get(
        `/community/quizzes/${id}/participants`,
        {
          withCredentials: true,
        }
      );
      setParticipants(response.data.participants || []);
      console.log("participants", response.data);
    } catch (error) {
      console.error("Failed to fetch participants:", error);
      setParticipantsError("Failed to load participants");
    } finally {
      setParticipantsLoading(false);
    }
  }, [id]);

  const calculateResult = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      setIsCalculatingResult(true);
      const response = await api.post(
        `/community/quizzes/${id}/leaderboard`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast.success("Result calculated successfully", {
          description: "The contest leaderboard has been updated.",
        });
        fetchParticipants(); // Refresh participants data
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to calculate result:", error);
      toast.error("Failed to calculate result", {
        description: "An error occurred. Please try again.",
      });
    } finally {
      setShowConfirmation(false);
      setIsCalculatingResult(false);
    }
  };

  const handleEditQuiz = () => {
    router.push(`/contest/edit/${id}`);
  };

  // Share quiz functionality
  const shareQuiz = () => {
    const shareUrl = `${window.location.origin}/community/contests/${id}`;

    if (navigator.share && navigator.canShare({ url: shareUrl })) {
      // Use native sharing if available (mobile devices)
      navigator
        .share({
          title: quiz?.title || "Quiz",
          text: `Check out this quiz: ${quiz?.title || "Quiz"}`,
          url: shareUrl,
        })
        .then(() => {
          toast.success("Shared successfully!");
        })
        .catch((error) => {
          console.error("Error sharing:", error);
        });
    } else {
      // Fallback to copying link
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          toast.success("Link copied to clipboard!");
        })
        .catch((err) => {
          toast.error("Failed to copy link");
          console.error("Failed to copy:", err);
        });
    }
  };

  // Handle export
  const handleExport = () => {
    try {
      setIsExporting(true);

      // Create CSV header
      let csvContent = "NameStatus,Score\n";
      // let csvContent = "Name,Registration Date,Status,Score,Completion Time\n";

      // Add data rows
      participants.forEach((participant) => {
        const name = participant.name || participant.username || "Unknown";
        // const registrationDate = participant.registrationDate
        //   ? new Date(participant.registrationDate).toLocaleDateString()
        //   : "N/A";
        const status =
          participant.status === "in-progress"
            ? "In Progress"
            : participant.status === "completed"
              ? "Completed"
              : "Registered";
        const score = participant.score || "N/A";
        // const completionTime = participant.completionTime || "N/A";

        // Escape fields that might contain commas
        const escapedName = name.includes(",") ? `"${name}"` : name;

        // csvContent += `${escapedName},${registrationDate},${status},${score},${completionTime}\n`;
        csvContent += `${escapedName},${status},${score}\n`;
      });

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${quiz.title || "quiz"}_participants.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle sending update to participants
  const handleSendUpdate = async () => {
    try {
      setIsSendingUpdate(true);
      // Add API call here when implemented
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Update sent to participants");
    } catch {
      toast.error("Failed to send update");
    } finally {
      setIsSendingUpdate(false);
    }
  };

  function formatDuration(quiz, questions) {
    if (!quiz) return "N/A";
    if (
      quiz.timerMode === "rapid" &&
      Array.isArray(questions) &&
      questions.length > 0
    ) {
      const totalSeconds = questions.reduce(
        (sum, q) => sum + (q.timeLimit || 0),
        0
      );
      if (totalSeconds >= 60) {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return secs === 0 ? `${mins} min` : `${mins} min ${secs} sec`;
      } else {
        return `${totalSeconds} sec`;
      }
    } else if (quiz.timerMode === "full") {
      if (quiz.duration >= 60) {
        const hours = Math.floor(quiz.duration / 60);
        const mins = quiz.duration % 60;
        return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`;
      }
      return `${quiz.duration} min`;
    }
    return "N/A";
  }

  useEffect(() => {
    // Fetch all data on component mount
    fetchQuiz();
    fetchQuestions();
    fetchParticipants();
  }, [fetchQuiz, fetchQuestions, fetchParticipants]);

  // Time variables removed

  return (
    <div className={styles.main}>
      <div className={styles.backNav}>
        <div
          className="border rounded-lg hover:bg-accent text-sm w-fit"
          style={{ padding: "3px 10px" }}
        >
          <BackButton
            onClick={() => router.back()}
            showText={true}
            smallText={true}
          />
        </div>
      </div>

      <div className={styles.container}>
        {
          // loading ? (
          //   <QuizDetailSkeleton />
          // ) :
          error ? (
            <div className={styles.errorBox}>
              <div className={styles.errorContent}>
                <AlertCircle className={styles.errorIcon} />
                <div>
                  <h3 className={styles.errorTitle}>Failed to load quiz</h3>
                  <p className={styles.errorMessage}>{error}</p>
                  <Button
                    onClick={fetchQuiz}
                    variant="outline"
                    className={styles.retryButton}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            quiz && (
              <>
                <div className={styles.detailsWrapper}>
                  {/* Title, Category and Action buttons */}
                  <div
                    className={`${styles.header} w-full flex-col md:flex-row`}
                  >
                    <div className="w-full">
                      <h1 className={styles.title}>
                        {quiz.title || "Azure Fundamentals Quiz"}
                      </h1>
                      <p className={styles.subtitle}>
                        Contest management and details
                      </p>
                    </div>
                    <div
                      className={`${styles.headerButtons} mt-2 md:mt-0 self-start md:self-auto`}
                    >
                      <button
                        className={styles.shareButton}
                        onClick={shareQuiz}
                      >
                        <Share2 size={18} />
                        Share
                      </button>
                      <button
                        className={styles.editButton}
                        onClick={handleEditQuiz}
                      >
                        <Edit size={18} />
                        Edit Contest
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div
                    className={`${styles.tabsContainer} overflow-x-auto flex-nowrap py-2`}
                  >
                    <button
                      className={`${styles.tabButton} ${activeTab === "overview" ? styles.activeTab : ""
                        } flex-shrink-0`}
                      onClick={() => setActiveTab("overview")}
                    >
                      <Info size={16} />
                      Overview
                    </button>{" "}
                    <button
                      className={`${styles.tabButton} ${activeTab === "questions" ? styles.activeTab : ""
                        } flex-shrink-0`}
                      onClick={() => setActiveTab("questions")}
                    >
                      <BookOpen size={16} />
                      Questions ({allQuestions.length || 0})
                    </button>
                    <button
                      className={`${styles.tabButton} ${activeTab === "participants" ? styles.activeTab : ""
                        } flex-shrink-0`}
                      onClick={() => setActiveTab("participants")}
                    >
                      <Users size={16} />
                      Participants ({quiz.totalRegistered || 0})
                    </button>
                  </div>

                  {/* Content based on active tab */}
                  {activeTab === "overview" && (
                    <div className={styles.tabContent}>
                      <div className={`${styles.card}`}>
                        <div className={styles.infoHeader}>
                          <h2 className={styles.cardTitle}>
                            Contest Information
                          </h2>
                          <div className={styles.badgeContainer}>
                            <span className={styles.statusBadge}>
                              {(() => {
                                const now = new Date();
                                const startTime = quiz.startTime
                                  ? new Date(quiz.startTime)
                                  : null;
                                const endTime = quiz.endTime
                                  ? new Date(quiz.endTime)
                                  : null;

                                if (!startTime) return "Unscheduled";
                                if (startTime > now) return "Upcoming";
                                if (!endTime || now < endTime) return "Active";
                                return "Completed";
                              })()}
                            </span>
                            {quiz.category && (
                              <span className={styles.categoryBadge}>
                                {quiz.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className={styles.contestDescription}>
                          {quiz.description || "No description provided."}
                        </p>

                        <div
                          className={`${styles.infoGrid} mt-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4`}
                        >
                          <div className={styles.infoItem}>
                            <div>
                              <h3>
                                <Calendar size={15} className="inline" /> Start
                                Date
                              </h3>
                              <p>
                                {quiz.startTime
                                  ? new Date(
                                    quiz.startTime
                                  ).toLocaleDateString()
                                  : "N/A"}
                              </p>
                              <p className={styles.infoSubtext}>
                                {quiz.startTime
                                  ? convertToIST(quiz.startTime, false)
                                  : "Not specified"}
                              </p>
                            </div>
                          </div>

                          <div className={styles.infoItem}>
                            <div>
                              <h3>
                                <Clock size={15} className="inline" /> Duration
                              </h3>
                              <p>{formatDuration(quiz, allQuestions)}</p>
                              <p className={styles.infoSubtext}>
                                Total time limit
                              </p>
                            </div>
                          </div>

                          <div className={styles.infoItem}>
                            <div>
                              <h3>
                                <Users size={15} className="inline" />{" "}
                                Participants
                              </h3>
                              <p>{quiz.totalRegistered || "0"}</p>
                              <p className={styles.infoSubtext}>
                                {quiz.maxParticipants
                                  ? `of ${quiz.maxParticipants} max`
                                  : "No limit defined"}
                              </p>
                            </div>
                          </div>

                          <div className={styles.infoItem}>
                            <div>
                              <h3>
                                <BookOpen size={15} className="inline" />{" "}
                                Questions
                              </h3>
                              <p>{allQuestions.length || "0"}</p>
                              <p className={styles.infoSubtext}>
                                Total questions
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={`${styles.card}`}>
                        <h2 className={styles.cardTitle}>
                          Rules & Regulations
                        </h2>
                        <ol className={styles.rulesList}>
                          {quiz.rules &&
                            Array.isArray(quiz.rules) &&
                            quiz.rules.length > 0 ? (
                            quiz.rules.map((rule, index) => (
                              <li key={index} className="flex items-center">
                                <div className={styles.ruleIndex}>
                                  {index + 1}
                                </div>{" "}
                                {rule}
                              </li>
                            ))
                          ) : (
                            <>
                              <li>
                                Each participant must complete the quiz in one
                                sitting. No backtracking is allowed.
                              </li>
                              <li>
                                Only one attempt per participant is permitted.
                              </li>
                              <li>
                                Use of external resources (e.g., Google, books)
                                is not allowed.
                              </li>
                              <li>
                                Each correct answer awards 1 point. No negative
                                marking for incorrect answers.
                              </li>
                              <li>
                                In case of a tie, quiz time taken will be used
                                to decide the winner.
                              </li>
                            </>
                          )}
                        </ol>
                      </div>
                      {/* 
                      {quiz.rewards && (
                        <div className={`${styles.card}`}>
                          <h2 className={styles.cardTitle}>
                            <Trophy size={20} className={styles.icon} />
                            Rewards & Prizes
                          </h2>
                          <p>{quiz.rewards || "N/A"}</p>
                        </div>
                      )} */}

                      {/* Miscellaneous Section - Each item in its own card */}
                      {quiz.misc?.length > 0 &&
                        quiz.misc.map((item, index) => (
                          <div className={styles.card} key={index}>
                            <h2 className={styles.cardTitle}>
                              <Sparkle className={styles.icon} />
                              {item.fieldName}
                            </h2>
                            <div className={styles.imageGallery}>
                              {Array.isArray(item.fieldValue) ? (
                                item.fieldValue.map((url, i) => (
                                  <img
                                    key={i}
                                    src={url}
                                    alt={`${item.fieldName} ${i}`}
                                    className={styles.miscImage}
                                  />
                                ))
                              ) : (
                                <p>No images available</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {activeTab === "questions" && (
                    <div className={styles.tabContent}>
                      <div className={styles.questionsHeader}>
                        <div>
                          <h2 className={styles.questionsTitle}>
                            Questions ({allQuestions.length})
                          </h2>
                          <p className={styles.questionsSubtitle}>
                            Manage contest questions and answers
                          </p>
                        </div>
                        <Button
                          onClick={() => setAddQuestion(true)}
                          className={styles.addQuestionButton}
                        >
                          <PlusCircle size={16} />
                          Add Question
                        </Button>
                      </div>

                      {questionsLoading ? (
                        <QuestionsSkeleton />
                      ) : questionsError ? (
                        <div className={styles.errorBox}>
                          <div className={styles.errorContent}>
                            <AlertCircle className={styles.errorIcon} />
                            <div>
                              <h3 className={styles.errorTitle}>
                                Failed to load questions
                              </h3>
                              <p className={styles.errorMessage}>
                                {questionsError}
                              </p>
                              <Button
                                onClick={fetchQuestions}
                                variant="outline"
                                className={styles.retryButton}
                              >
                                Retry
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : allQuestions.length > 0 ? (
                        <div className={styles.questionsList}>
                          {allQuestions.map((question, index) => {
                            // Add question index before passing to Question component
                            const questionWithIndex = {
                              ...question,
                              index: index + 1,
                            };
                            return (
                              <Question
                                key={question._id}
                                question={questionWithIndex}
                                quizId={id}
                                fetchAllQuestions={fetchQuestions}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div className={styles.noQuestions}>
                          <div className={styles.emptyStateContent}>
                            <FileEdit className={styles.emptyStateIcon} />
                            <p>No questions available yet</p>
                            <Button
                              onClick={() => setAddQuestion(true)}
                              variant="outline"
                              className={styles.emptyStateButton}
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Add your first question
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "participants" && (
                    <div className={styles.tabContent}>
                      <div className={styles.participantsHeader}>
                        <h2>
                          Participants (
                          {participants.length || quiz.totalRegistered || 0})
                        </h2>
                        <p>Manage contest participants and their progress</p>
                        <div className={styles.participantActions}>
                          <Button
                            onClick={calculateResult}
                            disabled={
                              isCalculatingResult || participants.length === 0
                            }
                            className={`${styles.calcButton} mb-2 sm:mb-0 mr-2 bg-[#24b2b4] text-white hover:bg-[#1a8f90]`}
                          >
                            {isCalculatingResult ? (
                              "Calculating..."
                            ) : (
                              <>
                                <FileEdit size={16} />
                                Calculate Result
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={handleExport}
                            disabled={isExporting || participants.length === 0}
                            className={`${styles.exportButton} mb-2 sm:mb-0`}
                          >
                            {isExporting ? (
                              "Exporting..."
                            ) : (
                              <>
                                <Download size={16} />
                                Export
                              </>
                            )}
                          </Button>
                          {/* <Button
                            onClick={handleSendUpdate}
                            disabled={
                              isSendingUpdate || participants.length === 0
                            }
                            className={styles.updateButton}
                          >
                            {isSendingUpdate ? (
                              "Sending..."
                            ) : (
                              <>
                                <Send size={16} />
                                Send Update
                              </>
                            )}
                          </Button> */}
                        </div>
                      </div>

                      {participantsLoading ? (
                        <div className={styles.participantsTableSkeleton}>
                          {[1, 2, 3].map((_, idx) => (
                            <div
                              key={idx}
                              className={styles.participantRowSkeleton}
                            >
                              <div
                                className={styles.shimmer}
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                }}
                              ></div>
                              <div
                                className={styles.shimmer}
                                style={{ width: "120px", height: "20px" }}
                              ></div>
                              <div
                                className={styles.shimmer}
                                style={{ width: "80px", height: "20px" }}
                              ></div>
                              <div
                                className={styles.shimmer}
                                style={{
                                  width: "90px",
                                  height: "24px",
                                  borderRadius: "12px",
                                }}
                              ></div>
                              <div
                                className={styles.shimmer}
                                style={{ width: "40px", height: "20px" }}
                              ></div>
                              <div
                                className={styles.shimmer}
                                style={{ width: "60px", height: "20px" }}
                              ></div>
                              <div
                                className={styles.shimmer}
                                style={{ width: "24px", height: "24px" }}
                              ></div>
                            </div>
                          ))}
                        </div>
                      ) : participantsError ? (
                        <div className={styles.errorBox}>
                          <div className={styles.errorContent}>
                            <AlertCircle className={styles.errorIcon} />
                            <div>
                              <h3 className={styles.errorTitle}>
                                Failed to load participants
                              </h3>
                              <p className={styles.errorMessage}>
                                {participantsError}
                              </p>
                              <Button
                                onClick={fetchParticipants}
                                variant="outline"
                                className={styles.retryButton}
                              >
                                Retry
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`${styles.participantsTable} overflow-scroll max-w-full`}
                        >
                          <div
                            className={`${styles.participantsTableHeader} min-w-[650px]`}
                          >
                            <div className={styles.participantColumn}>
                              Participant
                            </div>
                            {/* <div className={styles.dateColumn}>
                              Registration Date
                            </div> */}
                            <div className={styles.statusColumn}>Status</div>
                            <div className={styles.scoreColumn}>Score</div>
                            {/* <div className={styles.timeColumn}>
                              Completion Time
                            </div> */}
                            {/* <div className={styles.actionsColumn}>Actions</div> */}
                          </div>

                          {participants.length > 0 ? (
                            participants.map((participant) => {
                              console.log("participant", participant);
                              console.log("pfp", participant.profileImage);
                              return (
                                <div
                                  key={participant._id || participant.id}
                                  className={styles.participantRow}
                                >
                                  <div className={styles.participantColumn}>
                                    <div className={styles.participantInfo}>
                                      <img
                                        src={
                                          participant.avatar ||
                                          participant.profileImage ||
                                          "https://via.placeholder.com/32"
                                        }
                                        alt={
                                          participant.name ||
                                          participant.username
                                        }
                                        className={styles.participantAvatar}
                                      />
                                      <span>
                                        {participant.name ||
                                          participant.username}
                                      </span>
                                    </div>
                                  </div>
                                  {/* <div className={styles.dateColumn}>
                                  {participant.registrationDate
                                    ? new Date(
                                        participant.registrationDate
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </div> */}
                                  <div className={styles.statusColumn}>
                                    <span
                                      className={`${styles.statusBadge} ${styles[participant.status] || ""
                                        }`}
                                    >
                                      {participant.status === "in-progress"
                                        ? "In Progress"
                                        : participant.status === "completed"
                                          ? "Completed"
                                          : "Registered"}
                                    </span>
                                  </div>
                                  <div className={styles.scoreColumn}>
                                    {participant.score || "N/A"}
                                  </div>
                                  {/* <div className={styles.timeColumn}>
                                  {participant.completionTime || "N/A"}
                                </div> */}
                                  {/* <div className={styles.actionsColumn}>
                                  <button className={styles.actionButton}>
                                    ⋯
                                  </button>
                                </div> */}
                                </div>
                              );
                            })
                          ) : (
                            <div className={styles.noParticipantsMessage}>
                              <p>
                                No participants have registered for this quiz
                                yet.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )
          )
        }

        {showConfirmation && (
          <ConfirmationModal
            setShowConfirmationModel={setShowConfirmation}
            title="Are you sure you want to calculate results?"
            message="This action will calculate all the scores and display the leaderboard."
            onConfirm={calculateResult}
            isLoading={isCalculatingResult}
            confirmText={
              isCalculatingResult ? "Calculating..." : "Calculate Results"
            }
          />
        )}

        {showAddReward && <RewardModal setShowAddReward={setShowAddReward} />}
      </div>

      {addQuestion && (
        <div className={styles.addQueModal}>
          <AddQuestion
            quizId={id}
            communityId={communityId}
            setAddQuestion={setAddQuestion}
            quizData={quiz}
            fetchAllQuestions={fetchQuestions}
          />
        </div>
      )}
    </div>
  );
};

export default Quiz;
