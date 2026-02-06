"use client";
// Enhanced challenge viewing functionality
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../lib/axios";
import MetaTags from "../../components/MetaTags/MetaTags";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  CustomTimeline,
  CustomTimelineItem,
} from "../../components/CustomTimeline/CustomTimeline";
import BackButton from "../../components/BackButton/BackButton";

// UI components
import {
  App,
  Button,
  Progress,
  Empty,
  Timeline,
  Upload,
  Card,
  Tag,
  Avatar,
  Spin,
  Skeleton,
  Table,
  Alert,
  Space,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  UploadOutlined,
  UserOutlined,
  SettingOutlined,
  LoadingOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { formatDistanceToNow } from "date-fns";

// images
import Back from "./assets/ArrowLeft.svg";
import info from "./assets/WarningCircle.svg";
import setDate from "./assets/setDate.svg";
import schedule from "./assets/schedule.svg";
import checkpoint from "./assets/checkPoint.svg";
import edit from "./assets/edit2.svg";
import trophy from "./assets/trophyImage.svg";
import calender from "./assets/calender.svg";
import participants from "./assets/participants.svg";

// styles
import styles from "./SingleChallenge.module.css";
import {
  Trophy,
  Hand,
  FileEdit,
  PartyPopper,
  Medal,
  CheckCircle,
  XCircle,
  RotateCcw,
  Target,
  TrendingUp,
  Bookmark,
} from "lucide-react";

const LoadingState = () => (
  <div className={styles.loadingContainer}>
    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
    <p>Loading content...</p>
  </div>
);

const SubmissionHistory = ({ submissions, challenge, loading }) => {
  if (loading) {
    return (
      <Card title="Your Submissions" className={styles.submissionHistory}>
        <div className={styles.loadingContainer}>
          <Spin size="small" />
          <span>Loading submissions...</span>
        </div>
      </Card>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card title="Your Submissions" className={styles.submissionHistory}>
        <Empty description="No submissions yet" />
      </Card>
    );
  }

  return (
    <Card title="Your Submissions" className={styles.submissionHistory}>
      <div className={styles.submissionList}>
        {submissions.map((submission) => {
          const dailyTask = challenge?.dailyTasks?.find(
            (task) => task.day === submission.day
          );
          return (
            <div key={submission._id} className={styles.submissionItem}>
              <div className={styles.submissionHeader}>
                <div>
                  <strong>Day {submission.day}</strong>
                  {dailyTask && <span> - {dailyTask.title}</span>}
                </div>
                <Tag
                  color={
                    submission.status === "approved"
                      ? "success"
                      : submission.status === "rejected"
                        ? "error"
                        : submission.status === "needs_revision"
                          ? "warning"
                          : "processing"
                  }
                >
                  {submission.status.replace("_", " ").toUpperCase()}
                </Tag>
              </div>
              <div className={styles.submissionContent}>
                {submission.submissionType === "text" && (
                  <p>{submission.content}</p>
                )}
                {submission.submissionType === "image" &&
                  submission.imageUrl && (
                    <img
                      src={submission.imageUrl}
                      alt={`Day ${submission.day} submission`}
                      className={styles.submissionImage}
                    />
                  )}
                {submission.submissionType === "file" && submission.fileUrl && (
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.submissionFile}
                  >
                    📎 View submitted file
                  </a>
                )}
              </div>
              {submission.feedback && (
                <div className={styles.submissionFeedback}>
                  <strong>Feedback:</strong>{" "}
                  {typeof submission.feedback === "string"
                    ? submission.feedback
                    : typeof submission.feedback === "object" &&
                      submission.feedback.comment
                      ? submission.feedback.comment
                      : "Feedback provided"}
                </div>
              )}
              <div className={styles.submissionMeta}>
                <small>
                  Submitted: {new Date(submission.submittedAt).toLocaleString()}
                </small>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const CheckpointSubmissionForm = ({
  dailyTask,
  challengeId,
  day,
  onSubmit,
  submissions = [], // Add submissions prop
}) => {
  const [submissionContent, setSubmissionContent] = useState("");
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [optimisticSuccess, setOptimisticSuccess] = useState(false);

  // Check if user has already submitted for this day (memoized for performance)
  const { hasSubmittedToday, todaysSubmission } = useMemo(() => {
    const today = new Date();

    // Find if user has submitted today for this specific day
    const hasSubmitted = submissions.some((submission) => {
      const submissionDay = submission.day;
      const submissionDate = new Date(submission.submittedAt);

      // Check if submission is for the current day and was made today
      // This ensures users can only submit once per calendar day
      return (
        submissionDay === day &&
        submissionDate.toDateString() === today.toDateString()
      );
    });

    // Get today's submission if it exists
    const todaySubmission = submissions.find((submission) => {
      const submissionDay = submission.day;

      // Show most recent submission for this day
      return submissionDay === day;
    });

    return {
      hasSubmittedToday: hasSubmitted,
      todaysSubmission: todaySubmission,
    };
  }, [submissions, day]);

  const handleSubmit = async () => {
    // Double-check to prevent duplicate submissions
    if (hasSubmittedToday) {
      message.warning("You have already submitted for this day!");
      return;
    }

    try {
      setSubmitting(true);

      // Prepare submission payload based on submissionType
      const formData = new FormData();

      if (dailyTask.submissionType === "text") {
        formData.append("content", submissionContent);
      } else if (
        (dailyTask.submissionType === "image" ||
          dailyTask.submissionType === "file") &&
        fileList.length > 0
      ) {
        const file = fileList[0].originFileObj || fileList[0];
        formData.append("attachment", file);
      }

      // Optimistic UI update - show success immediately
      setOptimisticSuccess(true);
      message.loading({
        content: "Submitting daily task...",
        key: "submission",
      });

      // Make actual API call to new endpoint
      await api.post(
        `/challenge/${challengeId}/submit/${day}`,
        formData,
        {},
        {
          withCredentials: true,
        }
      );

      message.success({
        content: "Daily task submission successful!",
        key: "submission",
        duration: 2,
      });

      // Clear form after successful submission
      setSubmissionContent("");
      setFileList([]);

      // Refresh user progress and submissions
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error("Error submitting daily task:", error);
      setOptimisticSuccess(false);

      // Handle specific error cases
      const errorMessage = error.response?.data?.message;

      if (errorMessage && errorMessage.includes("already submitted")) {
        message.error({
          content:
            "You have already submitted for this day. You can only submit once per day.",
          key: "submission",
          duration: 4,
        });
      } else {
        message.error({
          content: errorMessage || "Failed to submit daily task",
          key: "submission",
          duration: 3,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // If user has already submitted today, show submission status
  if (hasSubmittedToday && todaysSubmission) {
    return (
      <div className={styles.submissionAlreadyMade}>
        <CheckCircleOutlined className={styles.successIcon} />
        <p>✅ You have already submitted for Day {day} today!</p>
        <p>
          <small>
            You can only submit once per day. Come back tomorrow for the next
            task.
          </small>
        </p>
        <div className={styles.submissionPreview}>
          <p>
            <strong>Your Submission:</strong>
          </p>
          <p>
            <strong>Submitted:</strong>{" "}
            {new Date(todaysSubmission.submittedAt).toLocaleString()}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <Tag
              color={
                todaysSubmission.status === "approved"
                  ? "success"
                  : todaysSubmission.status === "rejected"
                    ? "error"
                    : todaysSubmission.status === "needs_revision"
                      ? "warning"
                      : "processing"
              }
            >
              {(todaysSubmission.status || "pending")
                .replace("_", " ")
                .toUpperCase()}
            </Tag>
          </p>
          {todaysSubmission.content && (
            <p>
              <strong>Content:</strong> {todaysSubmission.content}
            </p>
          )}
          {todaysSubmission.attachment && (
            <p>
              <strong>File:</strong> {todaysSubmission.attachment.originalName}
            </p>
          )}
        </div>
      </div>
    );
  }

  // If we're showing optimistic success, render a different UI
  if (optimisticSuccess) {
    return (
      <div className={styles.submissionSuccess}>
        <CheckCircleOutlined className={styles.successIcon} />
        <p>Your submission has been sent!</p>
      </div>
    );
  }

  return (
    <div className={styles.submissionForm}>
      <div className={styles.submissionNote}>
        <p>
          <small>
            📝 Note: You can only submit once per day for each task.
          </small>
        </p>
      </div>

      {dailyTask.submissionType === "text" && (
        <div className={styles.textSubmission}>
          <textarea
            value={submissionContent}
            className="w-full rounded-lg"
            style={{
              padding: "0.5rem",
            }}
            onChange={(e) => setSubmissionContent(e.target.value)}
            placeholder={
              dailyTask.submissionPrompt || "Enter your submission text here"
            }
            rows={4}
          />
        </div>
      )}

      {(dailyTask.submissionType === "image" ||
        dailyTask.submissionType === "file") && (
          <Upload
            beforeUpload={() => false} // Prevent auto upload
            listType={
              dailyTask.submissionType === "image" ? "picture-card" : "text"
            }
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            accept={dailyTask.submissionType === "image" ? "image/*" : "*"}
            maxCount={1}
          >
            {fileList.length === 0 && (
              <div>
                <UploadOutlined />
                <div>
                  {dailyTask.submissionType === "image"
                    ? "Upload Image"
                    : "Upload File"}
                </div>
              </div>
            )}
          </Upload>
        )}

      <Button
        type="primary"
        onClick={handleSubmit}
        loading={submitting}
        disabled={
          (dailyTask.submissionType === "text" && !submissionContent.trim()) ||
          ((dailyTask.submissionType === "image" ||
            dailyTask.submissionType === "file") &&
            fileList.length === 0)
        }
        className={styles.submitButton}
      >
        Submit
      </Button>
    </div>
  );
};

const Checkpoints = ({ challenge, userProgress, fetchUserProgress }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Fetch user submissions
  const fetchSubmissions = useCallback(async () => {
    if (!challenge?._id) return;

    try {
      setLoadingSubmissions(true);
      const response = await api.get(
        `/challenge/${challenge._id}/progress`,
        {},
        {
          withCredentials: true,
        }
      );
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoadingSubmissions(false);
    }
  }, [challenge?._id]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  if (!challenge) return <LoadingState />;

  // Get daily tasks from challenge
  const dailyTasks = challenge.dailyTasks || [];

  // Find completed submissions from user progress
  const completedDays = userProgress?.completedDays || [];

  return (
    <div className={styles.checkpointsDiv}>
      <div>
        {/* <img src={checkpoint} alt="Checkpoint" /> */}
        <p
          className="font-semibold"
          style={{ marginBottom: "0.5rem", fontSize: "1.25rem" }}
        >
          Daily Tasks Progress ({dailyTasks.length} days)
        </p>
        <p className="text-sm text-muted-foreground">
          Track your daily progress through the challenge
        </p>
      </div>

      {userProgress && (
        <div className={styles.progressIndicator}>
          <Progress percent={userProgress?.progress || 0} status="active" />
          <p className=" text-nowrap">
            Day {userProgress?.currentDay || 1} of {challenge.duration} (
            {userProgress?.progress || 0}% complete)
          </p>
        </div>
      )}

      <div className={styles.checkpointsList}>
        {dailyTasks.length > 0 ? (
          <CustomTimeline>
            {dailyTasks.map((task) => {
              const dayNumber = task.day;
              const isCompleted = completedDays.includes(dayNumber);
              const isMissed = userProgress?.missedDays?.includes(dayNumber);

              // For new users with no submissions, day 1 should be current
              // For users with submissions, use the calculated current day
              const hasSubmissions = submissions && submissions.length > 0;
              const isCurrentDay = hasSubmissions
                ? userProgress?.currentDay === dayNumber
                : dayNumber === 1; // First day is current for new users

              const canSubmit =
                userProgress && isCurrentDay && !isCompleted && !isMissed;
              const isLocked = hasSubmissions
                ? dayNumber > (userProgress?.currentDay || 1)
                : dayNumber > 1; // Only day 1 available for new users

              return (
                <CustomTimelineItem
                  key={task.day}
                  dot={
                    isCompleted ? (
                      <CheckCircleOutlined className={styles.completedIcon} />
                    ) : isMissed ? (
                      <CloseCircleOutlined className={styles.missedIcon} />
                    ) : undefined
                  }
                  color={
                    isCompleted
                      ? "green"
                      : isMissed
                        ? "red"
                        : isLocked
                          ? "gray"
                          : isCurrentDay
                            ? "blue"
                            : "gray"
                  }
                  label={`Day ${task.day}`}
                >
                  <div className={styles.checkpointItem}>
                    <div className={styles.checkpointHeader}>
                      <h3>{task.title}</h3>
                      {isCompleted && <Tag color="success">Completed</Tag>}
                      {isMissed && <Tag color="error">Missed</Tag>}
                      {isCurrentDay && !isCompleted && !isMissed && (
                        <Tag color="processing">Current</Tag>
                      )}
                      {isLocked && <Tag color="default">Locked</Tag>}
                    </div>
                    <p>{task.description}</p>

                    {/* Show submission form if user can submit */}
                    {canSubmit && (
                      <CheckpointSubmissionForm
                        dailyTask={task}
                        challengeId={challenge._id}
                        day={dayNumber}
                        submissions={submissions}
                        onSubmit={() => {
                          fetchUserProgress();
                          fetchSubmissions();
                        }}
                      />
                    )}

                    {/* Show missed day message */}
                    {isMissed && (
                      <div className={styles.missedDay}>
                        <p>
                          ❌ This day was missed - you can no longer submit for
                          this day
                        </p>
                      </div>
                    )}

                    {/* Show locked state message */}
                    {isLocked && (
                      <div className={styles.lockedDay}>
                        <p>
                          🔒 This task will unlock when it becomes available
                        </p>
                      </div>
                    )}
                  </div>
                </CustomTimelineItem>
              );
            })}

            {/* Challenge completion milestone */}
            <CustomTimelineItem
              dot={<TrophyOutlined />}
              color="gold"
              label="Finish"
            >
              <div className={styles.challengeCompletion}>
                <h3>Challenge Completion</h3>
                {userProgress?.progress === 100 ? (
                  <div>
                    <p>🎉 Congratulations on completing this challenge!</p>
                    {challenge.checkpointRewards?.length > 0 && (
                      <div className={styles.completedRewardsSection}>
                        <h4>🎉 Your Earned Rewards</h4>
                        <div className={styles.completedRewardsGrid}>
                          {challenge.checkpointRewards.map((reward, idx) => (
                            <div
                              key={idx}
                              className={styles.completedRewardCard}
                            >
                              <div className={styles.rewardIcon}>
                                {reward.rewardType === "badge" && "🏅"}
                                {reward.rewardType === "certificate" && "📜"}
                                {reward.rewardType === "points" && "⭐"}
                                {reward.rewardType === "custom" && "🎁"}
                                {!reward.rewardType && "🎯"}
                              </div>
                              <div className={styles.rewardContent}>
                                <div className={styles.rewardDay}>
                                  Day {reward.checkpointDay}
                                </div>
                                <div className={styles.rewardValue}>
                                  {reward.rewardValue}
                                </div>
                                <div className={styles.rewardDescription}>
                                  {reward.rewardDescription}
                                </div>
                              </div>
                              <div className={styles.earnedBadge}>
                                ✅ Earned
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>
                    Complete all daily tasks to finish the challenge and earn
                    your rewards!
                  </p>
                )}
              </div>
            </CustomTimelineItem>
          </CustomTimeline>
        ) : (
          <div className={styles.checkpointsDivContent}>
            <div>
              <img src={calender?.src || calender} alt="Calendar" />
              <span>No daily tasks configured yet</span>
            </div>
          </div>
        )}
      </div>

      {/* Show checkpoint rewards preview */}
      {challenge.checkpointRewards &&
        challenge.checkpointRewards.length > 0 && (
          <div className={styles.rewardsSection}>
            <div className={styles.rewardsSectionHeader}>
              <h3 className="flex items-center gap-2">
                <Trophy className="inline text-orange-400" />
                Upcoming Checkpoint Rewards
              </h3>
              <div className={styles.rewardsCount}>
                {challenge.checkpointRewards.length} Rewards Available
              </div>
            </div>
            <div className={styles.rewardsGrid}>
              {challenge.checkpointRewards.map((reward, index) => (
                <div key={index} className={styles.rewardCard}>
                  <div className={styles.rewardIcon}>
                    {reward.rewardType === "badge" && "🏅"}
                    {reward.rewardType === "certificate" && "📜"}
                    {reward.rewardType === "points" && "⭐"}
                    {reward.rewardType === "custom" && "🎁"}
                    {!reward.rewardType && "🎯"}
                  </div>
                  <div className={styles.rewardContent}>
                    <div className={styles.rewardDay}>
                      Day {reward.checkpointDay}
                    </div>
                    <div className={styles.rewardValue}>
                      {reward.rewardValue}
                    </div>
                    <div className={styles.rewardDescription}>
                      {reward.rewardDescription}
                    </div>
                  </div>
                  <div className={styles.rewardBadge}>
                    <span className={styles.rewardType}>
                      {reward.rewardType || "Reward"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* User's Submission History */}
      {userProgress && (
        <SubmissionHistory
          submissions={submissions}
          challenge={challenge}
          loading={loadingSubmissions}
        />
      )}
    </div>
  );
};

const Participants = ({ challenge }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [loading, setLoading] = useState(true);
  const [optimisticData, setOptimisticData] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);

      // Use functional update to avoid dependency on leaderboard state
      setOptimisticData((prevLeaderboard) =>
        prevLeaderboard && prevLeaderboard.length > 0
          ? [...prevLeaderboard]
          : null
      );

      const response = await api.get(
        `/challenge/${challenge._id}/leaderboard`
      );
      setLeaderboard(response.data.leaderboard || []);
      setTotalParticipants(response.data.totalParticipants || 0);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      message.error("Failed to load leaderboard data");
    } finally {
      setLoading(false);
      setOptimisticData(null);
    }
  }, [challenge._id]);

  useEffect(() => {
    if (challenge?._id) {
      fetchLeaderboard();
    }
  }, [challenge, fetchLeaderboard]);

  // If loading and no optimistic data, show loading state
  if (loading && !optimisticData) return <LoadingState />;

  // Display data (either real or optimistic)
  const displayData = optimisticData || leaderboard;

  // Enrich with joined date and computed values to match design
  const totalTasks = challenge?.dailyTasks?.length || challenge?.duration || 0;

  const enrichedData = (() => {
    if (!displayData?.length) return [];
    const participantIndex = new Map(
      (challenge?.participants || []).map((p) => [
        (p.user?._id || p.user || "").toString(),
        p,
      ])
    );
    return displayData.map((entry) => {
      const uid = (entry.user?._id || entry.user || "").toString();
      const p = participantIndex.get(uid);
      const joinedDate = p?.enrolledAt ? new Date(p.enrolledAt) : null;
      const status =
        entry.isCompleted || entry.progress === 100
          ? "completed"
          : entry.progress > 0
            ? "active"
            : "not_started";
      return { ...entry, joinedDate, status };
    });
  })();

  if (!totalParticipants && !challenge?.participants?.length) {
    return (
      <div className={styles.participantsDiv}>
        <img src={participants?.src || participants} alt="Participants" />
        <div className={styles.participantsDivContent1}>
          No participants yet
        </div>
        <div className={styles.participantsDivContent2}>
          Complete setup and publish the Challenge to share
        </div>
      </div>
    );
  }

  // Calculate completion rate from leaderboard data (for potential future use)
  // derived values if needed later
  // const completedParticipants = displayData.filter(
  //   (entry) => entry.isCompleted || entry.progress === 100
  // ).length;
  // keep available if we want to show later
  // const completionRate =
  //   totalParticipants > 0
  //     ? Math.round((completedParticipants / totalParticipants) * 100)
  //     : 0;

  // Export list as CSV
  const exportToCSV = () => {
    try {
      const headers = [
        "Participant",
        "Username",
        "Joined Date",
        "Progress %",
        "Tasks Completed",
        "Status",
      ];
      const rows = enrichedData.map((r) => [
        r.user?.name || r.user?.username || "",
        r.user?.username || "",
        r.joinedDate ? r.joinedDate.toISOString().split("T")[0] : "",
        r.progress ?? 0,
        `${r.completedDays || 0}/${totalTasks}`,
        r.status === "completed"
          ? "completed"
          : r.status === "active"
            ? "active"
            : "not started",
      ]);
      const csv = [headers, ...rows]
        .map((line) =>
          line.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")
        )
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `challenge-participants-${challenge?._id || "list"}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("CSV export failed", e);
      message.error("Failed to export list");
    }
  };

  // Define table columns per design
  const columns = [
    {
      title: "Participant",
      key: "participant",
      render: (_, record) => {
        const initials = (record.user?.name || record.user?.username || "")
          .split(" ")
          .map((s) => s[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase();
        return (
          <div className={styles.participantInfo}>
            <Avatar
              src={record.user?.picture}
              icon={!record.user?.picture && <UserOutlined />}
              size="large"
              className={styles.participantAvatar}
            >
              {!record.user?.picture && initials}
            </Avatar>
            <div className={styles.participantDetails}>
              <div className={styles.participantName}>
                {record.user?.name || record.user?.username}
              </div>
              <div className={styles.participantUsername}>
                @{record.user?.username}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Joined Date",
      dataIndex: "joinedDate",
      key: "joinedDate",
      width: 150,
      render: (date) => (
        <span>{date ? date.toISOString().split("T")[0] : "-"}</span>
      ),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      width: 220,
      render: (progress, record) => {
        // Dynamic stroke color based on progress level
        const getStrokeColor = (progress) => {
          if (progress === 0) return { "0%": "#d9d9d9", "100%": "#f0f0f0" };
          if (progress < 25) return { "0%": "#ff4d4f", "100%": "#ff7875" };
          if (progress < 50) return { "0%": "#faad14", "100%": "#ffc53d" };
          if (progress < 75) return { "0%": "#52c41a", "100%": "#73d13d" };
          if (progress < 100) return { "0%": "#1890ff", "100%": "#40a9ff" };
          return { "0%": "#722ed1", "100%": "#9254de" }; // Completed
        };

        return (
          <div className={styles.progressCell}>
            <span className={styles.progressPercentInline}>{progress}%</span>
            <Progress
              percent={progress}
              showInfo={false}
              size="small"
              status={record.isCompleted ? "success" : "active"}
              strokeColor={getStrokeColor(progress)}
            />
          </div>
        );
      },
    },
    {
      title: "Tasks Completed",
      key: "tasksCompleted",
      width: 160,
      align: "center",
      render: (_, record) => (
        <span className={styles.tasksCompletedValue}>
          {(record.completedDays || 0) + "/" + totalTasks}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status) => (
        <Tag
          color={status === "completed" ? "success" : "success"}
          className={styles.statusTag}
        >
          {status === "completed"
            ? "completed"
            : status === "active"
              ? "active"
              : "not started"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      align: "right",
      render: (_, record) => (
        <span
          className={styles.viewProfileLink}
          onClick={() => {
            try {
              if (record.user?.username) {
                window.open(`/explore/${record.user.username}`, "_blank");
              }
            } catch {
              // ignore
            }
          }}
        >
          View Profile
        </span>
      ),
    },
  ];

  return (
    <div className={styles.participantsContainer}>
      <div className={styles.participantsHeader}>
        <div>
          <h2>Challenge Participants</h2>
          <div className={styles.participantsSubtitle}>
            {totalParticipants} participants currently enrolled
          </div>
        </div>
        <div className={styles.participantsHeaderActions}>
          <Button
            icon={<DownloadOutlined />}
            onClick={exportToCSV}
            size="middle"
          >
            Export List
          </Button>
          <Button onClick={fetchLeaderboard} loading={loading} size="middle">
            Refresh
          </Button>
        </div>
      </div>

      <div className={styles.leaderboardTable}>
        <Table
          columns={columns}
          dataSource={enrichedData}
          rowKey={(record) => record.user._id}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} participants`,
          }}
          className={styles.participantsTable}
          locale={{
            emptyText: <Empty description="No participants data yet" />,
          }}
        />
      </div>
    </div>
  );
};

const ActivityFeed = ({ challenge, isCreator, currentUserId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [activityStats, setActivityStats] = useState({
    total: 0,
    submissions: 0,
    enrollments: 0,
    completions: 0,
    approvals: 0,
    rewards: 0,
  });

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);

      let endpoint = `/challenge/${challenge._id}/activity`;

      // If not creator, fetch only user's activities
      if (!isCreator && currentUserId) {
        endpoint = `/challenge/${challenge._id}/user/${currentUserId}/activity`;
      }

      const response = await api.get(
        endpoint,
        {},
        {
          withCredentials: true,
        }
      );

      const fetchedActivities = response.data.activities || [];
      setActivities(fetchedActivities);

      // Calculate enhanced activity statistics
      const stats = {
        total: fetchedActivities.length,
        submissions: fetchedActivities.filter(
          (a) => a.activityType === "submitted"
        ).length,
        enrollments: fetchedActivities.filter(
          (a) => a.activityType === "enrolled"
        ).length,
        completions: fetchedActivities.filter(
          (a) => a.activityType === "completed"
        ).length,
        approvals: fetchedActivities.filter(
          (a) => a.activityType === "approved"
        ).length,
        rewards: fetchedActivities.filter(
          (a) => a.activityType === "reward_earned"
        ).length,
      };
      setActivityStats(stats);
    } catch (error) {
      console.error("Error fetching activities:", error);
      message.error("Failed to load activity data");
    } finally {
      setLoading(false);
    }
  }, [challenge._id, isCreator, currentUserId]);

  useEffect(() => {
    if (challenge?._id) {
      fetchActivities();
    }
  }, [challenge, fetchActivities]);

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case "enrolled":
        return "#1890ff4d"; // blue with 30% opacity
      case "submitted":
        return "#1890ff4d"; // processing blue with 30% opacity
      case "completed":
        return "#52c41a4d"; // success green with 30% opacity
      case "reward_earned":
        return "#faad144d"; // gold with 30% opacity
      case "approved":
        return "#52c41a4d"; // green with 30% opacity
      case "rejected":
        return "#f5222d4d"; // red with 30% opacity
      case "needs_revision":
        return "#fa8c164d"; // orange with 30% opacity
      case "day_completed":
        return "#722ed14d"; // purple with 30% opacity
      case "milestone_reached":
        return "#13c2c24d"; // teal with 30% opacity
      default:
        return "#d9d9d94d"; // gray with 30% opacity
    }
  };

  const getActivityIconColor = (activityType) => {
    switch (activityType) {
      case "enrolled":
        return "#1890ff"; // blue with 30% opacity
      case "submitted":
        return "#1890ff"; // processing blue with 30% opacity
      case "completed":
        return "#52c41a"; // success green with 30% opacity
      case "reward_earned":
        return "#faad14"; // gold with 30% opacity
      case "approved":
        return "#52c41a"; // green with 30% opacity
      case "rejected":
        return "#f5222d"; // red with 30% opacity
      case "needs_revision":
        return "#fa8c16"; // orange with 30% opacity
      case "day_completed":
        return "#722ed1"; // purple with 30% opacity
      case "milestone_reached":
        return "#13c2c2"; // teal with 30% opacity
      default:
        return "#d9d9d9"; // gray with 30% opacity
    }
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case "enrolled":
        return <Hand size={20} color={getActivityIconColor(activityType)} />;
      case "submitted":
        return (
          <FileEdit size={20} color={getActivityIconColor(activityType)} />
        );
      case "completed":
        return (
          <PartyPopper size={20} color={getActivityIconColor(activityType)} />
        );
      case "reward_earned":
        return <Medal size={20} color={getActivityIconColor(activityType)} />;
      case "approved":
        return (
          <CheckCircle size={20} color={getActivityIconColor(activityType)} />
        );
      case "rejected":
        return <XCircle size={20} color={getActivityIconColor(activityType)} />;
      case "needs_revision":
        return (
          <RotateCcw size={20} color={getActivityIconColor(activityType)} />
        );
      case "day_completed":
        return <Target size={20} color={getActivityIconColor(activityType)} />;
      case "milestone_reached":
        return (
          <TrendingUp size={20} color={getActivityIconColor(activityType)} />
        );
      default:
        return (
          <Bookmark size={20} color={getActivityIconColor(activityType)} />
        );
    }
  };

  const getActivityMessage = (activity) => {
    const userName = activity.user?.name || activity.user?.username || "User";
    const isCurrentUser = activity.user?._id === currentUserId;
    const displayName = isCreator ? userName : isCurrentUser ? "You" : userName;

    switch (activity.activityType) {
      case "enrolled":
        return `<b>${displayName}</b> joined the challenge`;
      case "submitted":
        return `<b>${displayName}</b> submitted Day ${activity.day || "N/A"
          } task`;
      case "completed":
        return `<b>${displayName}</b> completed the entire challenge! 🎉`;
      case "reward_earned":
        return `<b>${displayName}</b> earned a reward: ${activity.details?.rewardType || "reward"
          }`;
      case "approved":
        return `<b>${displayName}</b>'s Day ${activity.day || "N/A"
          } submission was approved`;
      case "rejected":
        return `<b>${displayName}</b>'s Day ${activity.day || "N/A"
          } submission was rejected`;
      case "needs_revision":
        return `<b>${displayName}</b>'s Day ${activity.day || "N/A"
          } submission needs revision`;
      case "day_completed":
        return `<b>${displayName}</b> completed Day ${activity.day || "N/A"}`;
      case "milestone_reached":
        return `<b>${displayName}</b> reached ${activity.details?.milestone || "a milestone"
          }`;
      default: {
        // Ensure we always return a string, not an object
        const message = activity.details?.message;
        if (typeof message === "string") {
          return message;
        }
        return `${displayName} performed an action`;
      }
    }
  };

  const getDetailedActivityInfo = (activity) => {
    const details = [];

    // Add submission type information
    if (activity.details?.submissionType) {
      details.push({
        label: "Type",
        value: String(activity.details.submissionType),
        color: "blue",
      });
    }

    // Add progress information
    if (activity.details?.progress !== undefined) {
      details.push({
        label: "Progress",
        value: `${activity.details.progress}%`,
        color: "green",
      });
    }

    // Add day information
    if (activity.day) {
      details.push({
        label: "Day",
        value: String(activity.day),
        color: "purple",
      });
    }

    // Add reward information
    if (activity.details?.rewardValue) {
      details.push({
        label: "Reward",
        value: String(activity.details.rewardValue),
        color: "gold",
      });
    }

    return details;
  };

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true;
    return activity.activityType === filter;
  });

  if (loading) return <LoadingState />;

  return (
    <div className={styles.activityFeed}>
      <div className={styles.activityHeader}>
        <div className={styles.activityTitle}>
          <h2>{isCreator ? "All Challenge Activity" : "Your Activity"}</h2>
          <p>
            {isCreator
              ? "Monitor all participant activities and track challenge progress"
              : "Track your challenge progress and see your activity history"}
          </p>
        </div>

        {/* Enhanced Activity Statistics */}
        {isCreator && (
          <div className={styles.activityStats}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{activityStats.total}</span>
              <span className={styles.statLabel}>Total Activities</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>
                {activityStats.enrollments}
              </span>
              <span className={styles.statLabel}>Enrollments</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>
                {activityStats.submissions}
              </span>
              <span className={styles.statLabel}>Submissions</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>
                {activityStats.approvals}
              </span>
              <span className={styles.statLabel}>Approvals</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>
                {activityStats.completions}
              </span>
              <span className={styles.statLabel}>Completions</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{activityStats.rewards}</span>
              <span className={styles.statLabel}>Rewards</span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Activity Filters - Only for creators */}
      {isCreator && (
        <div className={styles.activityFilters}>
          <Space.Compact className="gap-4">
            <Button
              style={{
                borderRadius: "50px",
                padding: "8px 16px",
                height: "30px",
              }}
              type={filter === "all" ? "primary" : "default"}
              onClick={() => setFilter("all")}
              size="small"
            >
              All Activities ({activityStats.total})
            </Button>
            <Button
              style={{
                borderRadius: "50px",
                padding: "8px 16px",
                height: "30px",
              }}
              type={filter === "enrolled" ? "primary" : "default"}
              onClick={() => setFilter("enrolled")}
              size="small"
            >
              👋 Enrollments ({activityStats.enrollments})
            </Button>
            <Button
              style={{
                borderRadius: "50px",
                padding: "8px 16px",
                height: "30px",
              }}
              type={filter === "submitted" ? "primary" : "default"}
              onClick={() => setFilter("submitted")}
              size="small"
            >
              📝 Submissions ({activityStats.submissions})
            </Button>
            <Button
              style={{
                borderRadius: "50px",
                padding: "8px 16px",
                height: "30px",
              }}
              type={filter === "approved" ? "primary" : "default"}
              onClick={() => setFilter("approved")}
              size="small"
            >
              ✅ Approvals ({activityStats.approvals})
            </Button>
            <Button
              style={{
                borderRadius: "50px",
                padding: "8px 16px",
                height: "30px",
              }}
              type={filter === "completed" ? "primary" : "default"}
              onClick={() => setFilter("completed")}
              size="small"
            >
              🎉 Completions ({activityStats.completions})
            </Button>
          </Space.Compact>
        </div>
      )}

      {!filteredActivities.length ? (
        <Empty
          description={
            filter === "all"
              ? isCreator
                ? "No activities yet in this challenge"
                : "You haven't started any activities yet"
              : `No ${filter} activities yet`
          }
          className={styles.emptyState}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        // <div className={styles.activityTimeline}>
        //   <Timeline>
        //     {filteredActivities.map((activity) => {
        //       const activityDetails = getDetailedActivityInfo(activity);

        //       return (
        //         <Timeline.Item
        //           key={activity._id}
        //           color={getActivityColor(activity.activityType)}
        //           dot={
        //             <div
        //               // className={styles.activityDot}
        //               style={{
        //                 backgroundColor: getActivityColor(
        //                   activity.activityType
        //                 ),
        //                 borderRadius: "50%",
        //                 width: "40px",
        //                 height: "40px",
        //                 display: "flex",
        //                 alignItems: "center",
        //                 justifyContent: "center",
        //               }}
        //             >
        //               {getActivityIcon(activity.activityType)}
        //             </div>
        //           }
        //         >
        //           <div className={styles.activityItem}>
        //             <div className={styles.activityContent}>
        //               <div className={styles.activityMain}>
        //                 <span className={styles.activityMessage}>
        //                   {getActivityMessage(activity)}
        //                 </span>
        //               </div>

        //               <div className={styles.activityMeta}>
        //                 <span className={styles.activityTime}>
        //                   {new Date(activity.timestamp).toLocaleString()}
        //                 </span>

        //                 {/* Progress Bar */}
        //                 {activity.details?.progress !== undefined && (
        //                   <div className={styles.activityProgress}>
        //                     <Progress
        //                       percent={activity.details.progress}
        //                       size="small"
        //                       showInfo={true}
        //                       status={
        //                         activity.details.progress === 100
        //                           ? "success"
        //                           : "active"
        //                       }
        //                     />
        //                   </div>
        //                 )}
        //               </div>

        //               {/* Enhanced Additional Details */}
        //               {activity.details?.feedback && (
        //                 <div className={styles.activityFeedback}>
        //                   <strong>💬 Feedback:</strong>{" "}
        //                   {(() => {
        //                     const feedback = activity.details.feedback;
        //                     if (typeof feedback === "string") {
        //                       return feedback;
        //                     } else if (
        //                       typeof feedback === "object" &&
        //                       feedback.comment
        //                     ) {
        //                       return feedback.comment;
        //                     } else {
        //                       return "Feedback provided";
        //                     }
        //                   })()}
        //                   {activity.details?.reviewedBy && (
        //                     <div className={styles.reviewInfo}>
        //                       <small>Reviewed by admin</small>
        //                     </div>
        //                   )}
        //                 </div>
        //               )}

        //               {activity.details?.rewardValue && (
        //                 <div className={styles.activityReward}>
        //                   <TrophyOutlined style={{ color: "#faad14" }} />
        //                   <span>
        //                     <strong>Reward Earned:</strong>{" "}
        //                     {String(activity.details.rewardValue)}
        //                   </span>
        //                   {activity.details.rewardDescription && (
        //                     <div className={styles.rewardDescription}>
        //                       {String(activity.details.rewardDescription)}
        //                     </div>
        //                   )}
        //                 </div>
        //               )}

        //               {/* Show submission content preview for creators */}
        //               {isCreator && activity.details?.submissionPreview && (
        //                 <div className={styles.submissionPreview}>
        //                   <strong>📋 Submission Preview:</strong>
        //                   <p>{String(activity.details.submissionPreview)}</p>
        //                 </div>
        //               )}
        //             </div>

        //             {/* User Avatar and Actions - Only for creators */}
        //             {isCreator && (
        //               <div className={styles.activityActions}>
        //                 <Avatar
        //                   src={activity.user?.picture}
        //                   icon={!activity.user?.picture && <UserOutlined />}
        //                   size="small"
        //                   title={activity.user?.name || activity.user?.username}
        //                 />
        //               </div>
        //             )}
        //           </div>
        //         </Timeline.Item>
        //       );
        //     })}
        //   </Timeline>
        // </div>
        <div
          className="flex flex-col gap-12"
          style={{
            marginBottom: "80px",
          }}
        >
          {filteredActivities.map((activity, index) => {
            return (
              <div key={activity._id || activity.id || `activity-${index}`} className="flex gap-4 items-center w-full">
                <div
                  style={{
                    backgroundColor: getActivityColor(activity.activityType),
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className=" flex-1">
                  <div>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: getActivityMessage(activity),
                      }}
                    />
                  </div>
                  <span className={styles.activityTimestamp}>
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {/* Enhanced Additional Details */}
                  {activity.details?.feedback && (
                    <div className={styles.activityFeedback}>
                      <strong>💬 Feedback:</strong>{" "}
                      {(() => {
                        const feedback = activity.details.feedback;
                        if (typeof feedback === "string") {
                          return feedback;
                        } else if (
                          typeof feedback === "object" &&
                          feedback.comment
                        ) {
                          return feedback.comment;
                        } else {
                          return "Feedback provided";
                        }
                      })()}
                      {activity.details?.reviewedBy && (
                        <div className={styles.reviewInfo}>
                          <small>Reviewed by admin</small>
                        </div>
                      )}
                    </div>
                  )}

                  {activity.details?.rewardValue && (
                    <div className={styles.activityReward}>
                      <TrophyOutlined style={{ color: "#faad14" }} />
                      <span>
                        <strong>Reward Earned:</strong>{" "}
                        {String(activity.details.rewardValue)}
                      </span>
                      {activity.details.rewardDescription && (
                        <div className={styles.rewardDescription}>
                          {String(activity.details.rewardDescription)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show submission content preview for creators */}
                  {isCreator && activity.details?.submissionPreview && (
                    <div className={styles.submissionPreview}>
                      <strong>📋 Submission Preview:</strong>
                      <p>{String(activity.details.submissionPreview)}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Summary for Participants */}
      {!isCreator && filteredActivities.length > 0 && (
        <div className={styles.activitySummary}>
          <h4>📊 Your Progress Summary</h4>
          <div className={styles.progressSummary}>
            <div className={styles.summaryItem}>
              <span>Total Days Active:</span>
              <strong>
                {
                  new Set(
                    filteredActivities.filter((a) => a.day).map((a) => a.day)
                  ).size
                }
              </strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Submissions Made:</span>
              <strong>{activityStats.submissions}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Completion Rate:</span>
              <strong>
                {challenge?.dailyTasks?.length
                  ? Math.round(
                    (activityStats.submissions /
                      challenge.dailyTasks.length) *
                    100
                  )
                  : 0}
                %
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Summary = ({ challenge, onPublish, userProgress }) => {
  const [isPublishing, setIsPublishing] = useState(false);

  if (!challenge) return <LoadingState />;

  const startDate = new Date(challenge.startDate).toLocaleDateString();
  const endDate = new Date(challenge.endDate).toLocaleDateString();

  const handlePublish = async () => {
    try {
      setIsPublishing(true);

      // Optimistic UI update
      message.loading({ content: "Publishing challenge...", key: "publish" });

      await api.put(`/challenge/${challenge._id}/status`, {
        status: "published",
      });

      message.success({
        content: "Challenge successfully published!",
        key: "publish",
        duration: 2,
      });

      if (onPublish) onPublish();
    } catch (error) {
      console.error("Error publishing challenge:", error);
      message.error({
        content: "Failed to publish challenge",
        key: "publish",
        duration: 3,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={styles.summaryDiv}>
      {challenge.status === "draft" && (
        <div className={styles.summaryDivInfo}>
          <img src={info?.src || info} alt="Info" />
          <span>Add timeline & goals to publish this challenges...</span>
        </div>
      )}

      <div className={styles.summaryDivMain}>
        <div className={styles.challengeDetails}>
          <div className={styles.trophyImg}>
            {challenge.coverImage ? (
              <img
                src={challenge.coverImage}
                alt="Challenge"
                width="232px"
                height="133px"
              />
            ) : (
              <img src={trophy?.src || trophy} alt="Trophy" width="232px" height="133px" />
            )}
          </div>

          <div className={styles.challengeInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Description:</span>
              <p>{challenge.description || challenge.challengeDescription}</p>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Duration:</span>
              <p>
                {startDate} to {endDate}
              </p>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Status:</span>
              <Tag
                color={
                  challenge.status === "draft"
                    ? "default"
                    : challenge.status === "published"
                      ? "green"
                      : challenge.status === "completed"
                        ? "blue"
                        : "red"
                }
              >
                {challenge.status?.toUpperCase()}
              </Tag>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Checkpoints:</span>
              <p>{challenge.checkpoints?.length || 0} checkpoints</p>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Participants:</span>
              <p>{challenge.participants?.length || 0} participants</p>
            </div>

            {challenge.frequency && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Frequency:</span>
                <p>{challenge.frequency}</p>
              </div>
            )}

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Step-by-Step:</span>
              <p>{challenge.isStepbyStep ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>

        {userProgress && (
          <div className={styles.userProgressCard}>
            <div className={styles.progressHeader}>
              <h3>📊 Your Progress Dashboard</h3>
              <div className={styles.progressHeaderActions}>
                <Tag
                  color={
                    userProgress.progress === 100
                      ? "success"
                      : userProgress.progress > 0
                        ? "processing"
                        : "default"
                  }
                  className={styles.statusBadge}
                >
                  {userProgress.progress === 100
                    ? "🎉 Completed"
                    : userProgress.progress > 0
                      ? "🚀 In Progress"
                      : "📚 Just Started"}
                </Tag>
              </div>
            </div>

            <div className={styles.progressStatsEnhanced}>
              <div className={styles.progressCircleSection}>
                <div className={styles.progressCircleContainer}>
                  <Progress
                    type="circle"
                    percent={userProgress.progress}
                    size={[140, 10]}
                    status={
                      userProgress.progress === 100 ? "success" : "active"
                    }
                    strokeColor={{
                      "0%": "#24b2b4",
                      "100%": "#1e9597",
                    }}
                    format={(percent) => (
                      <div className={styles.progressCircleContent}>
                        <span className={styles.progressPercent}>
                          {percent}%
                        </span>
                        <span className={styles.progressLabel}>Complete</span>
                      </div>
                    )}
                  />
                </div>

                {/* Progress Milestone Indicators */}
                <div className={styles.progressMilestones}>
                  <div
                    className={`${styles.milestone} ${userProgress.progress >= 25
                      ? styles.milestoneCompleted
                      : ""
                      }`}
                  >
                    <span className={styles.milestoneIcon}>🎯</span>
                    <span className={styles.milestoneLabel}>25%</span>
                  </div>
                  <div
                    className={`${styles.milestone} ${userProgress.progress >= 50
                      ? styles.milestoneCompleted
                      : ""
                      }`}
                  >
                    <span className={styles.milestoneIcon}>🚀</span>
                    <span className={styles.milestoneLabel}>50%</span>
                  </div>
                  <div
                    className={`${styles.milestone} ${userProgress.progress >= 75
                      ? styles.milestoneCompleted
                      : ""
                      }`}
                  >
                    <span className={styles.milestoneIcon}>⭐</span>
                    <span className={styles.milestoneLabel}>75%</span>
                  </div>
                  <div
                    className={`${styles.milestone} ${userProgress.progress >= 100
                      ? styles.milestoneCompleted
                      : ""
                      }`}
                  >
                    <span className={styles.milestoneIcon}>🏆</span>
                    <span className={styles.milestoneLabel}>100%</span>
                  </div>
                </div>
              </div>

              <div className={styles.progressDetailsSection}>
                <div className={styles.progressMetrics}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>📅</div>
                    <div className={styles.metricContent}>
                      <div className={styles.metricLabel}>Joined Date</div>
                      <div className={styles.metricValue}>
                        {new Date(userProgress.enrolledAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>✅</div>
                    <div className={styles.metricContent}>
                      <div className={styles.metricLabel}>Days Completed</div>
                      <div className={styles.metricValue}>
                        {userProgress.completedDays?.length || 0}
                        <span className={styles.metricTotal}>
                          {" "}
                          / {challenge.dailyTasks?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>🎯</div>
                    <div className={styles.metricContent}>
                      <div className={styles.metricLabel}>Current Day</div>
                      <div className={styles.metricValue}>
                        Day {userProgress.currentDay || 1}
                      </div>
                    </div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>🔥</div>
                    <div className={styles.metricContent}>
                      <div className={styles.metricLabel}>Current Streak</div>
                      <div className={styles.metricValue}>
                        {userProgress.streak || 0}
                        <span className={styles.metricUnit}> days</span>
                      </div>
                    </div>
                  </div>

                  {userProgress?.missedDays &&
                    userProgress.missedDays.length > 0 && (
                      <div className={styles.metricCard}>
                        <div className={styles.metricIcon}>❌</div>
                        <div className={styles.metricContent}>
                          <div className={styles.metricLabel}>Missed Days</div>
                          <div className={styles.metricValue}>
                            {userProgress.missedDays.length}
                            <span className={styles.metricUnit}> days</span>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                {/* Enhanced Progress Bar */}
                <div className={styles.progressBarSection}>
                  <div className={styles.progressBarHeader}>
                    <span className={styles.progressBarLabel}>
                      Overall Progress
                    </span>
                    <span className={styles.progressBarPercent}>
                      {userProgress.progress}%
                    </span>
                  </div>
                  <Progress
                    percent={userProgress.progress}
                    status={
                      userProgress.progress === 100 ? "success" : "active"
                    }
                    strokeColor={{
                      from: "#24b2b4",
                      to: "#1e9597",
                    }}
                    size={[-1, 12]}
                    showInfo={false}
                    className={styles.enhancedProgressBar}
                  />
                  <div className={styles.progressBarLabels}>
                    <span>Start</span>
                    <span>Quarter</span>
                    <span>Half</span>
                    <span>Nearly Done</span>
                    <span>Complete</span>
                  </div>
                </div>

                {/* Display earned rewards */}
                {userProgress.earnedRewards &&
                  userProgress.earnedRewards.length > 0 && (
                    <div className={styles.earnedRewards}>
                      <div className={styles.rewardsHeader}>
                        <h4>🏆 Earned Rewards</h4>
                        <span className={styles.rewardsCount}>
                          {userProgress.earnedRewards.length} rewards
                        </span>
                      </div>
                      <div className={styles.rewardsList}>
                        {userProgress.earnedRewards.map((reward, index) => (
                          <div key={index} className={styles.rewardCard}>
                            <div className={styles.rewardIcon}>
                              {reward.rewardType === "badge" && "🏅"}
                              {reward.rewardType === "certificate" && "📜"}
                              {reward.rewardType === "points" && "⭐"}
                              {reward.rewardType === "custom" && "🎁"}
                            </div>
                            <div className={styles.rewardInfo}>
                              <div className={styles.rewardType}>
                                {reward.rewardType === "badge" && "Badge"}
                                {reward.rewardType === "certificate" &&
                                  "Certificate"}
                                {reward.rewardType === "points" && "Points"}
                                {reward.rewardType === "custom" && "Reward"}
                              </div>
                              <div className={styles.rewardDay}>
                                Day {reward.checkpointDay}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={styles.rewardsFooter}>
                        <small>
                          Latest earned:{" "}
                          {new Date(
                            userProgress.earnedRewards[
                              userProgress.earnedRewards.length - 1
                            ]?.earnedAt
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </small>
                      </div>
                    </div>
                  )}

                {/* Next Milestone Teaser */}
                {userProgress.progress < 100 && (
                  <div className={styles.nextMilestone}>
                    <div className={styles.nextMilestoneHeader}>
                      <span className={styles.nextMilestoneIcon}>🎯</span>
                      <span className={styles.nextMilestoneTitle}>
                        Next Milestone
                      </span>
                    </div>
                    <div className={styles.nextMilestoneContent}>
                      {userProgress.progress < 25 &&
                        "Complete 25% to unlock your first achievement!"}
                      {userProgress.progress >= 25 &&
                        userProgress.progress < 50 &&
                        "You're doing great! Reach 50% to level up!"}
                      {userProgress.progress >= 50 &&
                        userProgress.progress < 75 &&
                        "Over halfway there! Push to 75%!"}
                      {userProgress.progress >= 75 &&
                        userProgress.progress < 100 &&
                        "So close! Complete the challenge for the ultimate reward!"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {challenge.status === "draft" && (
          <div className={styles.summaryDivActions}>
            <div>
              <img src={setDate?.src || setDate} alt="Set Date" />
              <span>Set date</span>
            </div>
            <div>
              <img src={schedule?.src || schedule} alt="Schedule" />
              <span>Schedule</span>
            </div>
            <div>
              <img src={checkpoint?.src || checkpoint} alt="Checkpoint" />
              <span>Checkpoints</span>
            </div>
            <div>
              <img src={edit?.src || edit} alt="Edit" />
              <span>Edit</span>
            </div>

            <Button
              type="primary"
              className={styles.publishButton}
              onClick={handlePublish}
              disabled={!challenge.checkpoints?.length || isPublishing}
              loading={isPublishing}
            >
              Publish Challenge
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const SingleChallenge = () => {
  const router = useRouter();
  const { message } = App.useApp();
  const [challenge, setChallenge] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joiningChallenge, setJoiningChallenge] = useState(false);
  const { id } = useParams();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const isCreator = challenge?.creator?._id === userId;

  const isCommunityOwner = challenge?.community?.owner?.toString() === userId;

  const isEventAdmin = (challenge?.community?.moderators || []).some(
    (mod) =>
      (mod.user?.toString?.() ?? mod.user) === userId &&
      mod.role === "event-admin"
  );

  const canAdmin = isCreator || isCommunityOwner || isEventAdmin;

  const fetchUserProgress = useCallback(async () => {
    try {
      const user = localStorage.getItem("user");
      if (!user) return;

      const response = await api.get(
        `/challenge/${id}/progress`,
        {},
        {
          withCredentials: true,
        }
      );
      setUserProgress(response.data.participant);
      console.log("User progress fetched:", response.data.participant);
    } catch (error) {
      // User might not be a participant yet
      console.log(
        "User progress not available:",
        error.response?.data?.message
      );

      if (
        error.response?.status === 403 &&
        error.response?.data?.message ===
        "You are not enrolled in this challenge"
      ) {
        // This is an expected case for non-enrolled users
        setUserProgress(null);
      } else {
        // Handle unexpected errors
        message.error(
          error.response?.data?.message || "Failed to fetch user progress"
        );
      }
    }
  }, [id]);

  const fetchChallenge = useCallback(async () => {
    try {
      setLoading(true);
      // Use the new public API endpoint to get challenge details
      const response = await api.get(`/challenge/public/${id}`);
      if (!response.data.challenge) {
        message.error("Challenge not found");
        router.push("/");
        return;
      }

      setChallenge(response.data.challenge);
      console.log("Challenge fetched:", response.data.challenge);

      // Fetch user progress if the user is logged in
      const user = localStorage.getItem("user");
      if (user) {
        fetchUserProgress();
      }
    } catch (error) {
      console.error("Error fetching challenge:", error);
      if (error.response?.status === 404) {
        message.error("Challenge not found");
        router.push("/");
      } else {
        message.error(
          error.response?.data?.message || "Failed to load challenge details"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id, fetchUserProgress, router]);

  useEffect(() => {
    if (id) {
      fetchChallenge();
    }
  }, [id, fetchChallenge]);

  const handleJoinChallenge = async () => {
    try {
      setJoiningChallenge(true);

      const user = localStorage.getItem("user");

      if (!user) {
        message.error("Please log in to join the challenge");
        return;
      }

      // Optimistic UI update
      message.loading({ content: "Joining challenge...", key: "joining" });

      await api.post(
        `/challenge/enroll/${id}`,
        {},
        {
          withCredentials: true,
        }
      );

      message.success({
        content: "Successfully joined the challenge!",
        key: "joining",
        duration: 2,
      });

      // Refresh challenge data to show updated participant status
      fetchChallenge();
    } catch (error) {
      console.error("Error joining challenge:", error);
      message.error({
        content: error.response?.data?.message || "Failed to join challenge",
        key: "joining",
        duration: 3,
      });
    } finally {
      setJoiningChallenge(false);
    }
  };

  const handlePublishChallenge = async () => {
    try {
      const response = await api.put(`/challenge/${id}/status`, {
        status: "ongoing",
      });

      if (response.data.success) {
        message.success("Challenge published successfully!");
      }
    } catch (error) {
      console.error("Error updating challenge status:", error);
      message.error(
        error.response?.data?.message || "Failed to update challenge status"
      );
    }
    fetchChallenge();
  };

  // The renderComponent function has been removed as we now use the TabsContent directly

  return (
    <div className={styles.container}>
      {challenge && (
        <MetaTags
          title={`${challenge.title || "Challenge"} | GeeksClash`}
          description={
            challenge.description ||
            "Join this exciting coding challenge on GeeksClash!"
          }
          contentId={id}
          contentType="challenge"
          type="article"
        />
      )}
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

      {loading ? (
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: "300px" }} />
      ) : (
        <div className={styles.challengNameDiv}>
          <div className="flex items-center gap-2">
            <span className={styles.challengeTitle}>
              {challenge?.title || "Challenge Name"}
            </span>
            {challenge?.status && (
              <span
                className={styles.challengeStatus}
                style={{
                  backgroundColor:
                    challenge.status === "ongoing"
                      ? "rgba(82, 196, 26, 0.1)"
                      : challenge.status === "draft"
                        ? "rgba(250, 173, 20, 0.1)"
                        : challenge.status === "completed"
                          ? "rgba(24, 144, 255, 0.1)"
                          : "rgba(245, 34, 45, 0.1)",
                  color:
                    challenge.status === "ongoing"
                      ? "#52c41a"
                      : challenge.status === "draft"
                        ? "#faad14"
                        : challenge.status === "completed"
                          ? "#1890ff"
                          : "#f5222d",
                  border:
                    challenge.status === "ongoing"
                      ? "1px solid #52c41a"
                      : challenge.status === "draft"
                        ? "1px solid #faad14"
                        : challenge.status === "completed"
                          ? "1px solid #1890ff"
                          : "1px solid #f5222d",
                }}
              >
                {challenge.status.toUpperCase()}
              </span>
            )}
          </div>
          <div className={styles.settingsAndPublishDiv}>
            {/* Admin dashboard link for challenge creators */}
            {canAdmin && (
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => router.push(`/admin/challenge/${id}`)}
                title="Admin Dashboard"
              />
            )}

            {challenge?.status === "ongoing" && !userProgress && (
              <button
                onClick={handleJoinChallenge}
                className={styles.joinButton}
                disabled={joiningChallenge}
              >
                {joiningChallenge ? "Joining..." : "Join Challenge"}
              </button>
            )}

            {challenge?.status === "unpublished" && isCreator && (
              <button onClick={handlePublishChallenge}>Publish</button>
            )}
          </div>
        </div>
      )}

      {/* <div className={styles.activeDiv}>
        <div
          onClick={() => setActiveComponent("Summary")}
          className={activeComponent === "Summary" ? styles.activeCompo : ""}
        >
          Summary
        </div>
        <div
          onClick={() => setActiveComponent("Checkpoints")}
          className={
            activeComponent === "Checkpoints" ? styles.activeCompo : ""
          }
        >
          Checkpoints
        </div>
        <div
          onClick={() => setActiveComponent("Participants")}
          className={
            activeComponent === "Participants" ? styles.activeCompo : ""
          }
        >
          Participants
        </div>
        <div
          onClick={() => setActiveComponent("Activity")}
          className={activeComponent === "Activity" ? styles.activeCompo : ""}
        >
          Activity
        </div>
      </div> */}

      {loading ? (
        <LoadingState />
      ) : (
        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="checkpoints">Checkpoints</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            {!challenge ? (
              <LoadingState />
            ) : (
              <Summary
                challenge={challenge}
                onPublish={handlePublishChallenge}
                userProgress={userProgress}
              />
            )}
          </TabsContent>
          <TabsContent value="checkpoints">
            {userProgress === null && challenge?.status === "ongoing" ? (
              <div className={styles.notEnrolledMessage || "p-8 text-center"}>
                <Alert
                  message="Not Enrolled"
                  description="You are not enrolled in this challenge. Please join the challenge to view checkpoints."
                  type="info"
                  showIcon
                  action={
                    <Button
                      type="primary"
                      onClick={handleJoinChallenge}
                      loading={joiningChallenge}
                    >
                      Join Challenge
                    </Button>
                  }
                />
              </div>
            ) : (
              <Checkpoints
                challenge={challenge}
                userProgress={userProgress}
                fetchUserProgress={fetchUserProgress}
              />
            )}
          </TabsContent>
          <TabsContent value="participants">
            <Participants challenge={challenge} />
          </TabsContent>
          <TabsContent value="activity">
            {!userId ? (
              <div className={styles.notEnrolledMessage || "p-8 text-center"}>
                <Alert
                  message="Login Required"
                  description="Please login to view activity feed."
                  type="info"
                  showIcon
                />
              </div>
            ) : (
              <ActivityFeed
                challenge={challenge}
                isCreator={isCreator}
                currentUserId={userId}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default SingleChallenge;
