"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../lib/axios";
import {
  Tabs,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  App,
  Card,
  Statistic,
  Row,
  Col,
  DatePicker,
  Divider,
  Space,
  Progress,
  Skeleton,
  Switch,
} from "antd";
import {
  CloseCircleOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  FileOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  Users,
  CircleCheck,
  FileText,
  Clock,
  AlertCircle,
  BarChart3,
  Search,
  Download,
  Calendar,
  Eye,
  Check,
  X,
  Filter,
  FileCode,
  ChevronDown,
  SquarePen,
  Globe,
  CalendarDays,
  Settings,
  Shield,
} from "lucide-react";
import moment from "moment";

import {
  CheckpointCompletionChart,
  DailyActivityChart,
} from "../../components/Analytics/AnalyticsCharts";
import BackButton from "../../components/BackButton/BackButton";
import styles from "./AdminChallengeDashboard.module.css";

const { Option } = Select;
const { TextArea } = Input;

const AdminChallengeDashboard = () => {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { message } = App.useApp();

  // Core state
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data state
  const [challenge, setChallenge] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [stats, setStats] = useState({
    totalParticipants: 0,
    completedCount: 0,
    submissionCount: 0,
    pendingReviewCount: 0,
    completionRate: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });

  // UI state
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Modal states
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [editChallengeModalVisible, setEditChallengeModalVisible] =
    useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  // Forms
  const [form] = Form.useForm();
  const [rewardForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Table selection state
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [submissionSearch, setSubmissionSearch] = useState("");
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState("all");
  const [submissionBulkAction, setSubmissionBulkAction] = useState("");

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    let filtered = submissions || [];
    if (submissionSearch) {
      const search = submissionSearch.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          (s.user?.name || "").toLowerCase().includes(search) ||
          (s.user?.username || "").toLowerCase().includes(search)
      );
    }
    if (submissionStatusFilter && submissionStatusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === submissionStatusFilter);
    }
    return filtered;
  }, [submissions, submissionSearch, submissionStatusFilter]);

  // Derived KPIs for Overview
  const activeToday = useMemo(() => {
    if (!submissions?.length) return 0;
    const today = moment().startOf("day");
    const setIds = new Set(
      submissions
        .filter((s) => moment(s.submittedAt).isSame(today, "day"))
        .map((s) => s.user?._id)
        .filter(Boolean)
    );
    return setIds.size;
  }, [submissions]);

  // Calculate active today percentage
  const activeTodayPercentage = useMemo(() => {
    if (!activeToday || !stats.totalParticipants) return 0;
    const percentage = (activeToday / stats.totalParticipants) * 100;
    return parseFloat(percentage.toFixed(1));
  }, [activeToday, stats.totalParticipants]);

  const dailyEngagement = useMemo(() => {
    return stats.totalParticipants
      ? Math.round((activeToday / stats.totalParticipants) * 100)
      : 0;
  }, [activeToday, stats.totalParticipants]);

  // Calculate weekly growth rate for participants
  const participantGrowthRate = useMemo(() => {
    if (!participants?.length || !analyticsData?.dailyData?.participants)
      return 2.5; // Default fallback value

    // Get participant counts from the last 14 days
    const today = moment().startOf("day");
    const oneWeekAgo = moment().subtract(7, "days").startOf("day");
    const twoWeeksAgo = moment().subtract(14, "days").startOf("day");

    // Use analytics data if available, or calculate from participants
    let currentWeekCount = 0;
    let previousWeekCount = 0;

    if (analyticsData?.dailyData?.participants) {
      // If we have daily data, use it
      const dailyData = analyticsData.dailyData.participants;

      currentWeekCount = Object.entries(dailyData)
        .filter(
          ([date]) =>
            moment(date).isSameOrAfter(oneWeekAgo) &&
            moment(date).isBefore(today)
        )
        .reduce((sum, [, count]) => sum + count, 0);

      previousWeekCount = Object.entries(dailyData)
        .filter(
          ([date]) =>
            moment(date).isSameOrAfter(twoWeeksAgo) &&
            moment(date).isBefore(oneWeekAgo)
        )
        .reduce((sum, [, count]) => sum + count, 0);
    } else {
      // Fallback to participant join dates if available
      currentWeekCount = participants.filter(
        (p) =>
          moment(p.joinedAt).isSameOrAfter(oneWeekAgo) &&
          moment(p.joinedAt).isBefore(today)
      ).length;

      previousWeekCount = participants.filter(
        (p) =>
          moment(p.joinedAt).isSameOrAfter(twoWeeksAgo) &&
          moment(p.joinedAt).isBefore(oneWeekAgo)
      ).length;
    }

    // Calculate growth rate
    if (previousWeekCount === 0) return currentWeekCount > 0 ? 100 : 0;
    const growthRate =
      ((currentWeekCount - previousWeekCount) / previousWeekCount) * 100;
    return parseFloat(growthRate.toFixed(1));
  }, [participants, analyticsData?.dailyData?.participants]);

  // Calculate average submissions per participant
  const avgSubmissionsPerParticipant = useMemo(() => {
    if (!stats.totalParticipants || !stats.submissionCount) return 0;
    const average = stats.submissionCount / stats.totalParticipants;
    return parseFloat(average.toFixed(1));
  }, [stats.totalParticipants, stats.submissionCount]);

  // Calculate dynamic completion rate
  const dynamicCompletionRate = useMemo(() => {
    if (!stats.totalParticipants || !challenge?.totalTasks) return 0;

    // Get the total number of completed tasks across all participants
    const totalCompletedTasks =
      submissions?.reduce((total, submission) => {
        // Count only approved submissions as completed
        return submission.status === "approved" ? total + 1 : total;
      }, 0) || 0;

    // Calculate what percentage of all possible tasks have been completed
    // Formula: (completedTasks / (totalParticipants * totalTasks)) * 100
    const totalPossibleTasks =
      stats.totalParticipants * (challenge?.totalTasks || 1);
    const completionRate = (totalCompletedTasks / totalPossibleTasks) * 100;

    return parseFloat(completionRate.toFixed(1));
  }, [stats.totalParticipants, challenge?.totalTasks, submissions]);

  const timelineProgress = useMemo(() => {
    if (!challenge?.startDate || !challenge?.endDate) return null;
    const start = moment(challenge.startDate);
    const end = moment(challenge.endDate);
    const now = moment();
    if (now.isBefore(start)) return 0;
    if (now.isAfter(end)) return 100;
    const total = end.diff(start);
    const done = now.diff(start);
    return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
  }, [challenge?.startDate, challenge?.endDate]);

  const timeLeft = useMemo(() => {
    if (!challenge?.endDate) return null;
    const now = moment();
    const end = moment(challenge.endDate);
    if (now.isAfter(end)) return "Ended";
    const dur = moment.duration(end.diff(now));
    const days = Math.floor(dur.asDays());
    if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
    const hours = dur.hours();
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
    const mins = dur.minutes();
    return `${mins} min`;
  }, [challenge?.endDate]);

  // Helper function to handle API errors
  const handleApiError = useCallback(
    (error, context = "operation") => {
      console.error(`Error in ${context}:`, error);

      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || "Unknown error";

        switch (status) {
          case 401:
            message.error("You are not authenticated. Please log in again.");
            router.push("/login");
            break;
          case 403:
            message.error("You don't have permission to perform this action.");
            break;
          case 404:
            message.error("Resource not found. It may have been deleted.");
            break;
          case 500:
            message.error("Server error. Please try again later.");
            break;
          default:
            message.error(`Error: ${errorMessage}`);
        }
      } else if (error.request) {
        message.error("Network error. Please check your connection.");
      } else {
        message.error(`An unexpected error occurred during ${context}.`);
      }
    },
    [router]
  );

  // Fetch challenge details
  const fetchChallenge = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/challenge/${id}/admin`, {
        withCredentials: true,
      });

      if (response.data?.challenge) {
        const challengeData = response.data.challenge;
        setChallenge(challengeData);

        // Set participants from challenge data (already enriched by backend)
        const participantsData = challengeData.participants || [];
        setParticipants(participantsData);

        // Update stats with participants data
        setStats((prev) => ({
          ...prev,
          totalParticipants: participantsData.length,
          completedCount: participantsData.filter((p) => p.progress >= 100).length,
          completionRate:
            participantsData.length > 0
              ? Math.round(
                (participantsData.filter((p) => p.progress >= 100).length /
                  participantsData.length) *
                100
              )
              : 0,
        }));
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      setError("Failed to load challenge details");
      handleApiError(error, "loading challenge");
    } finally {
      setLoading(false);
    }
  }, [id, handleApiError]);

  // Fetch participants - uses challenge data which already includes enriched participants
  const fetchParticipants = useCallback(async () => {
    // If challenge already has participants, use that data
    if (challenge?.participants) {
      setParticipantsLoading(true);
      const participantsData = challenge.participants || [];
      setParticipants(participantsData);

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalParticipants: participantsData.length,
        completedCount: participantsData.filter((p) => p.progress >= 100).length,
        completionRate:
          participantsData.length > 0
            ? Math.round(
              (participantsData.filter((p) => p.progress >= 100).length /
                participantsData.length) *
              100
            )
            : 0,
      }));
      setParticipantsLoading(false);
      return;
    }

    // Fallback: refetch challenge to get participants
    try {
      setParticipantsLoading(true);

      const response = await api.get(`/challenge/${id}/admin`, {
        withCredentials: true,
      });

      const participantsData = response.data?.challenge?.participants || [];
      setParticipants(participantsData);

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalParticipants: participantsData.length,
        completedCount: participantsData.filter((p) => p.progress >= 100).length,
        completionRate:
          participantsData.length > 0
            ? Math.round(
              (participantsData.filter((p) => p.progress >= 100).length /
                participantsData.length) *
              100
            )
            : 0,
      }));
    } catch (error) {
      handleApiError(error, "loading participants");
      setParticipants([]);
    } finally {
      setParticipantsLoading(false);
    }
  }, [id, challenge, handleApiError]);

  // Fetch submissions
  const fetchSubmissions = useCallback(async () => {
    try {
      setSubmissionsLoading(true);

      const response = await api.get(`/challenge/${id}/submissions`, {
        withCredentials: true,
      });

      const submissionsData = response.data?.submissions || [];
      setSubmissions(submissionsData);

      // Update stats
      setStats((prev) => ({
        ...prev,
        submissionCount: submissionsData.length,
        pendingReviewCount: submissionsData.filter(
          (s) => s.status === "pending"
        ).length,
        approvedCount: submissionsData.filter((s) => s.status === "approved")
          .length,
        rejectedCount: submissionsData.filter((s) => s.status === "rejected")
          .length,
      }));
    } catch (error) {
      handleApiError(error, "loading submissions");
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  }, [id, handleApiError]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);

      const response = await api.get(`/challenge/${id}/analytics`, {
        withCredentials: true,
      });

      setAnalyticsData(response.data);
    } catch (error) {
      handleApiError(error, "loading analytics");
      setAnalyticsData({
        participation: {
          totalParticipants: 0,
          completedCount: 0,
          completionRate: 0,
        },
        checkpointCompletion: [],
        submissions: { total: 0, pending: 0, approved: 0, rejected: 0 },
        dailyActivity: [],
      });
    } finally {
      setAnalyticsLoading(false);
    }
  }, [id, handleApiError]);

  // Initial data loading
  useEffect(() => {
    if (!id) {
      setError("Invalid challenge ID");
      setLoading(false);
      return;
    }

    fetchChallenge();
  }, [fetchChallenge, id]);

  // Load tab-specific data
  useEffect(() => {
    if (challenge && !loading) {
      switch (activeTab) {
        case "submissions":
          fetchSubmissions();
          break;
        case "participants":
          fetchParticipants();
          break;
        case "analytics":
          fetchAnalytics();
          break;
        default:
          // Load basic data for overview
          if (participants.length === 0) fetchParticipants();
          if (submissions.length === 0) fetchSubmissions();
      }
    }
  }, [
    activeTab,
    challenge,
    loading,
    fetchSubmissions,
    fetchParticipants,
    fetchAnalytics,
    participants.length,
    submissions.length,
  ]);

  // Review submission
  const handleReviewSubmission = (submission) => {
    setCurrentSubmission(submission);
    setReviewModalVisible(true);
    form.resetFields();
  };

  const submitReview = async (values) => {
    if (!currentSubmission) return;

    try {
      message.loading({ content: "Submitting review...", key: "review" });

      await api.put(
        `/challenge/${id}/submissions/${currentSubmission._id}/review`,
        {
          status: values.status,
          comment: values.comment || "",
          rating: values.rating,
        },
        { withCredentials: true }
      );

      message.success({
        content: "Review submitted successfully!",
        key: "review",
      });
      setReviewModalVisible(false);
      setCurrentSubmission(null);
      form.resetFields();

      // Refresh submissions
      fetchSubmissions();
    } catch (error) {
      handleApiError(error, "submitting review");
    }
  };

  // Award reward
  const handleAwardReward = (participant) => {
    setSelectedParticipant(participant);
    setRewardModalVisible(true);
    rewardForm.resetFields();
  };

  const submitRewardAssignment = async (values) => {
    if (!selectedParticipant) return;

    try {
      message.loading({ content: "Assigning reward...", key: "reward" });

      const rewardData = {
        userId: selectedParticipant.user._id,
        rewardType: values.rewardType,
        rank: values.rank || null,
      };

      // Add type-specific data
      switch (values.rewardType) {
        case "cash":
          rewardData.amount = parseFloat(values.amount);
          break;
        case "prize":
          rewardData.prizeDetails = {
            name: values.prizeDetails,
            value: values.prizeValue ? parseFloat(values.prizeValue) : null,
          };
          break;
        case "badge":
          rewardData.badgeDetails = { name: values.badgeName };
          break;
        case "certificate":
          rewardData.certificateDetails = { title: values.certificateName };
          break;
      }

      await api.post(
        `/challenge/${id}/rewards`,
        {
          rewards: [rewardData],
        },
        { withCredentials: true }
      );

      message.success({
        content: "Reward assigned successfully!",
        key: "reward",
      });
      setRewardModalVisible(false);
      setSelectedParticipant(null);
      rewardForm.resetFields();

      // Refresh participants
      fetchParticipants();
    } catch (error) {
      handleApiError(error, "assigning reward");
    }
  };

  // Bulk actions
  const handleBulkApprove = async () => {
    if (selectedSubmissions.length === 0) {
      message.warning("Please select submissions to approve");
      return;
    }

    try {
      message.loading({ content: "Approving submissions...", key: "bulk" });

      await api.post(
        `/challenge/${id}/bulk-approve`,
        {
          submissionIds: selectedSubmissions,
        },
        { withCredentials: true }
      );

      message.success({
        content: `${selectedSubmissions.length} submissions approved!`,
        key: "bulk",
      });

      setSelectedSubmissions([]);
      fetchSubmissions();
    } catch (error) {
      handleApiError(error, "bulk approving submissions");
    }
  };

  const handleBulkReject = async () => {
    if (selectedSubmissions.length === 0) {
      message.warning("Please select submissions to reject");
      return;
    }

    try {
      message.loading({ content: "Rejecting submissions...", key: "bulk" });

      await api.post(
        `/challenge/${id}/bulk-reject`,
        {
          submissionIds: selectedSubmissions,
        },
        { withCredentials: true }
      );

      message.success({
        content: `${selectedSubmissions.length} submissions rejected!`,
        key: "bulk",
      });

      setSelectedSubmissions([]);
      fetchSubmissions();
    } catch (error) {
      handleApiError(error, "bulk rejecting submissions");
    }
  };

  // Challenge management
  const handleStatusChange = () => {
    setStatusModalVisible(true);
    statusForm.setFieldsValue({ status: challenge?.status });
  };

  const submitStatusChange = async (values) => {
    try {
      message.loading({ content: "Updating status...", key: "status" });

      await api.put(
        `/challenge/${id}/status`,
        {
          status: values.status,
        },
        { withCredentials: true }
      );

      message.success({
        content: "Status updated successfully!",
        key: "status",
      });
      setStatusModalVisible(false);
      fetchChallenge();
    } catch (error) {
      handleApiError(error, "updating challenge status");
    }
  };

  const handleEditChallenge = () => {
    setEditChallengeModalVisible(true);
    editForm.setFieldsValue({
      title: challenge?.title,
      category: challenge?.category || challenge?.categoryName,
      description: challenge?.description,
      difficulty: challenge?.difficulty || "Intermediate",
      duration: challenge?.actualDuration || challenge?.duration,
      dailyTimeCommitment: challenge?.dailyTimeCommitment || challenge?.settings?.dailyTimeCommitment,
      startDate: challenge?.startDate ? moment(challenge.startDate) : null,
      endDate: challenge?.endDate ? moment(challenge.endDate) : null,
      maxParticipants: challenge?.maxParticipants,
      allowLateSubmissions: challenge?.settings?.allowLateSubmissions,
      autoApproveSubmissions: challenge?.settings?.autoApproveSubmissions,
      publicLeaderboard: challenge?.settings?.publicLeaderboard,
      enableDiscussions: challenge?.settings?.discussionsEnabled,
      requireApprovalForRewards: challenge?.settings?.requireApprovalForRewards,
    });
  };

  const submitChallengeEdit = async (values) => {
    try {
      message.loading({ content: "Updating challenge...", key: "edit" });

      const updateData = {
        title: values.title,
        category: values.category,
        description: values.description,
        difficulty: values.difficulty,
        duration: values.duration,
        dailyTimeCommitment: values.dailyTimeCommitment,
        startDate: values.startDate?.toISOString(),
        endDate: values.endDate?.toISOString(),
        maxParticipants: values.maxParticipants,
        settings: {
          allowLateSubmissions: values.allowLateSubmissions,
          autoApproveSubmissions: values.autoApproveSubmissions,
          publicLeaderboard: values.publicLeaderboard,
          discussionsEnabled: values.enableDiscussions,
          requireApprovalForRewards: values.requireApprovalForRewards,
        },
      };

      await api.put(`/challenge/${id}`, updateData, {
        withCredentials: true,
      });

      message.success({
        content: "Challenge updated successfully!",
        key: "edit",
      });
      setEditChallengeModalVisible(false);
      fetchChallenge();
    } catch (error) {
      handleApiError(error, "updating challenge");
    }
  };

  const handleDeleteChallenge = () => {
    setDeleteConfirmVisible(true);
  };

  const confirmDeleteChallenge = async () => {
    try {
      message.loading({ content: "Deleting challenge...", key: "delete" });

      await api.delete(`/challenge/${id}`, {
        withCredentials: true,
      });

      message.success({
        content: "Challenge deleted successfully!",
        key: "delete",
      });
      router.back();
    } catch (error) {
      handleApiError(error, "deleting challenge");
    } finally {
      setDeleteConfirmVisible(false);
    }
  };

  // Export data
  const handleExportData = async () => {
    try {
      message.loading({ content: "Preparing export...", key: "export" });

      const exportData = {
        challenge: {
          title: challenge?.title,
          description: challenge?.description,
          status: challenge?.status,
          duration: challenge?.actualDuration || challenge?.duration,
          startDate: challenge?.startDate,
          endDate: challenge?.endDate,
          createdAt: challenge?.createdAt,
        },
        participants: participants.map((p) => ({
          username: p.user?.username || p.user?.name,
          joinedAt: p.joinedAt,
          progress: p.progress,
          completedCheckpoints: p.completedCheckpoints?.length || 0,
          hasReward: !!p.reward?.earned,
        })),
        submissions: submissions.map((s) => ({
          user: s.user?.username || s.user?.name,
          day: s.day,
          status: s.status,
          submittedAt: s.submittedAt,
          type: s.submissionType,
        })),
        stats,
        exportedAt: new Date().toISOString(),
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${challenge?.title || "challenge"
        }_admin_data_${moment().format("YYYY-MM-DD")}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success({
        content: "Data exported successfully!",
        key: "export",
      });
    } catch (error) {
      handleApiError(error, "exporting data");
    }
  };

  // Table column definitions
  const submissionsColumns = [
    {
      title: "Participant",
      dataIndex: ["user", "name"],
      key: "participant",
      render: (text, record) => {
        const name = record.user?.name || record.user?.username || "Unknown User";
        const username = record.user?.username || "";
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        return (
          <div className={styles.participantCell}>
            <div className={styles.participantAvatar}>
              <span>{initials}</span>
            </div>
            <div className={styles.participantInfo}>
              <span className={styles.participantName}>{name}</span>
              {username && (
                <span className={styles.participantUsername}>@{username}</span>
              )}
            </div>
          </div>
        );
      },
      width: 180,
    },
    {
      title: "Challenge Day",
      dataIndex: "day",
      key: "day",
      render: (day) => <span className={styles.dayPill}>Day {day}</span>,
      width: 120,
    },
    {
      title: "Type",
      dataIndex: "submissionType",
      key: "submissionType",
      render: (type) => (
        <div className={styles.typeCell}>
          <FileCode size={15} />
          <span>{type || "Text"}</span>
        </div>
      ),
      width: 100,
    },
    {
      title: "Language",
      key: "language",
      render: (_, record) => {
        const lang = record.language || record.programmingLanguage || "N/A";
        return (
          <span className={`${styles.languagePill} ${styles.languagePillBlue}`}>
            {lang}
          </span>
        );
      },
      width: 110,
    },
    {
      title: "Difficulty",
      key: "difficulty",
      render: (_, record) => {
        const diff = record.difficulty || challenge?.dailyTasks?.find((t) => t.day === record.day)?.difficulty || "Medium";
        const diffLower = diff.toLowerCase();
        const diffClass =
          diffLower === "easy"
            ? styles.difficultyEasy
            : diffLower === "hard"
              ? styles.difficultyHard
              : styles.difficultyMedium;
        return (
          <span className={`${styles.difficultyPill} ${diffClass}`}>
            {diff}
          </span>
        );
      },
      width: 100,
    },
    {
      title: "Submitted",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date) => (
        <div className={styles.submittedDateCell}>
          <Calendar size={15} />
          <span>{moment(date).format("MMM DD, YYYY")}</span>
        </div>
      ),
      sorter: (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt),
      width: 140,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          pending: { label: "Pending", className: styles.statusPending, icon: <Clock size={12} /> },
          approved: { label: "Approved", className: styles.statusApproved, icon: <Check size={12} /> },
          rejected: { label: "Rejected", className: styles.statusRejected, icon: <X size={12} /> },
          needs_revision: { label: "Revision", className: styles.statusNeedsRevision, icon: <AlertCircle size={12} /> },
        };
        const config = statusMap[status] || statusMap.pending;
        return (
          <span className={`${styles.statusPill} ${config.className}`}>
            {config.icon}
            {config.label}
          </span>
        );
      },
      width: 120,
    },
    {
      title: "Score",
      key: "score",
      render: (_, record) => {
        if (record.status === "approved") {
          return <span className={styles.scoreApproved}>{record.score || 100}</span>;
        }
        if (record.status === "rejected") {
          return <span className={styles.scoreRejected}>{record.score || 0}</span>;
        }
        return <span className={styles.scorePending}>-</span>;
      },
      width: 70,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 110,
      render: (_, record) => (
        <div className={styles.actionButtons}>
          <button
            className={`${styles.submissionActionBtn} ${styles.submissionActionBtnView}`}
            onClick={() => handleReviewSubmission(record)}
            title="View"
          >
            <Eye size={15} />
          </button>
          <button
            className={`${styles.submissionActionBtn} ${styles.submissionActionBtnApprove}`}
            onClick={() => handleReviewSubmission(record)}
            disabled={record.status !== "pending"}
            title="Approve"
          >
            <Check size={15} />
          </button>
          <button
            className={`${styles.submissionActionBtn} ${styles.submissionActionBtnReject}`}
            onClick={() => handleReviewSubmission(record)}
            disabled={record.status !== "pending"}
            title="Reject"
          >
            <X size={15} />
          </button>
        </div>
      ),
    },
  ];

  const participantsColumns = [
    {
      title: "User",
      dataIndex: ["user", "name"],
      key: "user",
      render: (text, record) => (
        <div>
          <div>
            {record.user?.name || record.user?.username || "Unknown User"}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.user?.email}
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: "Joined",
      dataIndex: "joinedAt",
      key: "joinedAt",
      render: (date) => moment(date).format("MMM DD, YYYY"),
      sorter: (a, b) => new Date(a.joinedAt) - new Date(b.joinedAt),
      width: 120,
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (progress) => (
        <div>
          <Progress percent={progress} size="small" />
          <div style={{ fontSize: "12px", marginTop: 2 }}>
            {progress}% complete
          </div>
        </div>
      ),
      sorter: (a, b) => a.progress - b.progress,
      width: 150,
    },
    {
      title: "Checkpoints",
      key: "checkpoints",
      render: (_, record) => (
        <div>
          <div>
            {record.completedCheckpoints?.length || 0} /{" "}
            {challenge?.checkpoints?.length || 0}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>completed</div>
        </div>
      ),
      width: 120,
    },
    {
      title: "Submissions",
      key: "submissions",
      render: (_, record) => {
        const userSubmissions = submissions.filter(
          (s) => s.user?._id === record.user?._id
        );
        const approvedCount = userSubmissions.filter(
          (s) => s.status === "approved"
        ).length;

        return (
          <div>
            <div>{userSubmissions.length} total</div>
            <div style={{ fontSize: "12px", color: "#52c41a" }}>
              {approvedCount} approved
            </div>
          </div>
        );
      },
      width: 120,
    },
    {
      title: "Reward Status",
      key: "rewardStatus",
      render: (_, record) => {
        if (record.reward?.earned) {
          return (
            <Tag color="success" icon={<TrophyOutlined />}>
              {record.reward.rewardType?.toUpperCase()} AWARDED
            </Tag>
          );
        }

        if (record.progress >= 100) {
          return <Tag color="orange">ELIGIBLE FOR REWARD</Tag>;
        }

        return <Tag color="default">NOT ELIGIBLE</Tag>;
      },
      width: 160,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleAwardReward(record)}
          disabled={record.reward?.earned || record.progress < 100}
        >
          Award Reward
        </Button>
      ),
    },
  ];

  // Show loading spinner
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading challenge dashboard...</div>
      </div>
    );
  }

  // Show error state
  if (error && !challenge) {
    return (
      <div className={styles.errorContainer}>
        <div style={{ textAlign: "center", padding: "50px 20px" }}>
          <ExclamationCircleOutlined
            style={{ fontSize: 48, color: "#ff4d4f" }}
          />
          <h2 style={{ marginTop: 16 }}>Failed to Load Challenge</h2>
          <p style={{ color: "#666", marginBottom: 24 }}>{error}</p>
          <Space>
            <Button type="primary" onClick={fetchChallenge}>
              Retry
            </Button>
            <Button onClick={() => router.back()}>Go Back</Button>
          </Space>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <div className={styles.headerTop}>
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

        <div className={styles.headerTitleRow}>
          <div className={styles.headerTitleLeft}>
            <div className={styles.headerTitleWrap}>
              <h1>
                {challenge?.title || challenge?.challengeTitle} Admin Dashboard
                {challenge?.status && (
                  <span
                    className={`${styles.headerStatusBadge} ${challenge.status === "ongoing"
                      ? styles.statusBadgeOngoing
                      : challenge.status === "upcoming"
                        ? styles.statusBadgeUpcoming
                        : challenge.status === "completed"
                          ? styles.statusBadgeCompleted
                          : styles.statusBadgeUnpublished
                      }`}
                  >
                    {challenge.status.toUpperCase()}
                  </span>
                )}
              </h1>
              <p>Manage participants, submissions, and rewards</p>
            </div>
          </div>

          <div className={styles.managementButtons}>
            <button className={`${styles.actionBtn} ${styles.actionBtnEdit}`} onClick={handleEditChallenge}>
              <FileOutlined style={{ fontSize: 14 }} /> Edit Challenge
            </button>
            <button className={`${styles.actionBtn} ${styles.actionBtnStatus}`} onClick={handleStatusChange}>
              <CheckCircleOutlined style={{ fontSize: 14 }} /> Change Status
            </button>
            <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} onClick={handleDeleteChallenge}>
              <CloseCircleOutlined style={{ fontSize: 14 }} /> Delete
            </button>
            <button className={`${styles.actionBtn} ${styles.actionBtnExport}`} onClick={handleExportData}>
              <ExportOutlined style={{ fontSize: 14 }} /> Export
            </button>
          </div>
        </div>
      </div>

      <Row gutter={[12, 12]} className={styles.statsRow}>
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Col xs={24} sm={12} md={4} key={i}>
                <Card>
                  <Skeleton.Input
                    style={{ width: "100%", height: 14 }}
                    active
                  />
                  <Skeleton.Input
                    style={{ width: "60%", height: 28, marginTop: 16 }}
                    active
                  />
                </Card>
              </Col>
            ))}
          </>
        ) : (
          <>
            <Col xs={24} sm={12} md={4}>
              <Card
                style={{
                  background: "linear-gradient(155deg, #F6F8F8, #C4EDED)",
                  border: "1px solid #32A4A433",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.03)",
                  padding: 0,
                  height: "100%",
                }}
                styles={{
                  body: {
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }
                }}
              >
                <div
                  style={{
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      color: "#32A4A4",
                      fontSize: "13px",
                      fontWeight: 500,
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    Total Participants{" "}
                  </span>
                  <Users size={18} color="#32A4A4" />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    flexGrow: 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "24px",
                          lineHeight: "32px",
                          fontWeight: 600,
                          color: "#262626",
                          fontFamily:
                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {stats.totalParticipants.toLocaleString()}
                      </span>
                      <div
                        style={{
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#389E0D",
                          fontWeight: 500,
                          fontFamily:
                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          marginTop: "2px",
                        }}
                      >
                        {participantGrowthRate > 0 ? "+" : ""}
                        {participantGrowthRate}%{" "}
                        <span
                          style={{
                            color: "#8C8C8C",
                            fontWeight: 400,
                            fontFamily:
                              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          }}
                        >
                          from last week
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card
                style={{
                  background: "linear-gradient(155deg, #F6F8F8, #C4EDED)",
                  border: "1px solid #32A4A433",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.03)",
                  padding: 0,
                  height: "100%",
                }}
                styles={{
                  body: {
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  },
                }}
              >
                <div
                  style={{
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      color: "#32A4A4",
                      fontSize: "13px",
                      fontWeight: 500,
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    Completion Rate
                  </span>
                  <CircleCheck size={18} color="#32A4A4" />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    flexGrow: 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline" }}>
                    <span
                      style={{
                        fontSize: "24px",
                        lineHeight: "32px",
                        fontWeight: 600,
                        color: "#262626",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      }}
                    >
                      {dynamicCompletionRate}
                    </span>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#32A4A4",
                        marginLeft: "4px",
                        fontFamily:
                          "'Segoe UI', sans-serif",
                      }}
                    >
                      %
                    </span>
                  </div>
                </div>
                <Progress
                  percent={dynamicCompletionRate}
                  strokeColor="#32A4A4"
                  railColor="#F6F8F8"
                  style={{ flexGrow: 1 }}
                  showInfo={false}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card
                style={{
                  background: "linear-gradient(155deg, #F6F8F8, #C4EDED)",
                  border: "1px solid #32A4A433",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.03)",
                  padding: 0,
                  height: "100%",
                }}
                styles={{
                  body: {
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }
                }}
              >
                <div
                  style={{
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      color: "#32A4A4",
                      fontSize: "13px",
                      fontWeight: 500,
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    Total Submissions
                  </span>
                  <FileText size={18} color="#32A4A4" />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    flexGrow: 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "24px",
                          lineHeight: "32px",
                          fontWeight: 600,
                          color: "#262626",
                          fontFamily:
                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {stats.submissionCount.toLocaleString()}
                      </span>
                      <div
                        style={{
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#8C8C8C",
                          fontWeight: 400,
                          fontFamily:
                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          marginTop: "2px",
                        }}
                      >
                        Avg: {avgSubmissionsPerParticipant} per participant
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card
                style={{
                  background: "linear-gradient(155deg, #F6F8F8, #C4EDED)",
                  border: "1px solid #32A4A433",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.03)",
                  padding: 0,
                  height: "100%",
                }}
                styles={{
                  body: {
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }
                }}
              >
                <div
                  style={{
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      color: "#32A4A4",
                      fontSize: "13px",
                      fontWeight: 500,
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    Pending Reviews
                  </span>{" "}
                  <AlertCircle size={18} color="#32A4A4" />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    flexGrow: 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "24px",
                          lineHeight: "32px",
                          fontWeight: 600,
                          color: "#262626",
                          fontFamily:
                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {stats.pendingReviewCount}
                      </span>
                      <div
                        style={{
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#8C8C8C",
                          fontWeight: 400,
                          fontFamily:
                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          marginTop: "2px",
                        }}
                      >
                        Requires action
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card
                style={{
                  background: "linear-gradient(155deg, #F6F8F8, #C4EDED)",
                  border: "1px solid #32A4A433",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.03)",
                  padding: 0,
                  height: "100%",
                }}
                styles={{
                  body: {
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }
                }}
              >
                <div
                  style={{
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      color: "#32A4A4",
                      fontSize: "13px",
                      fontWeight: 500,
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    Active Today
                  </span>
                  <Clock size={18} color="#32A4A4" />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    flexGrow: 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "24px",
                          lineHeight: "32px",
                          fontWeight: 600,
                          color: "#262626",
                          fontFamily:
                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                      >
                        {activeToday}
                      </span>
                      <div
                        style={{
                          fontSize: "12px",
                          lineHeight: "18px",
                          color: "#8C8C8C",
                          fontWeight: 400,
                          fontFamily:
                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                          marginTop: "2px",
                        }}
                      >
                        {activeTodayPercentage}% of total
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Card
                style={{
                  background: "linear-gradient(155deg, #F6F8F8, #C4EDED)",
                  border: "1px solid #32A4A433",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.03)",
                  padding: 0,
                  height: "100%",
                }}
                styles={{
                  body: {
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }
                }}
              >
                <div
                  style={{
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      color: "#32A4A4",
                      fontSize: "13px",
                      fontWeight: 500,
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    Daily Engagement
                  </span>
                  <BarChart3 size={18} color="#32A4A4" />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    flexGrow: 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline" }}>
                    <span
                      style={{
                        fontSize: "24px",
                        lineHeight: "32px",
                        fontWeight: 600,
                        color: "#262626",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      }}
                    >
                      {dailyEngagement}
                    </span>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#32A4A4",
                        marginLeft: "4px",
                        fontFamily:
                          "'Segoe UI', sans-serif",
                      }}
                    >
                      %
                    </span>
                  </div>
                </div>
                <Progress
                  percent={dailyEngagement}
                  strokeColor="#32A4A4"
                  railColor="#F6F8F8"
                  style={{ flexGrow: 1 }}
                  showInfo={false}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className={styles.tabs}
        items={[
          {
            key: "overview",
            label: "Overview",
            children: (
              <div className={styles.tabContent}>
                <Row gutter={[24, 24]}>
                  {/* Left Column - Challenge Overview */}
                  <Col xs={24} lg={16}>
                    <div className={styles.challengeOverviewCard}>
                      <div className={styles.overviewCardHeader}>
                        <div className={styles.overviewCardHeaderTitle}>
                          <FileOutlined style={{ fontSize: 18 }} /> Challenge Overview
                        </div>
                        <div className={styles.overviewCardHeaderSubtitle}>
                          Comprehensive details about your challenge configuration
                        </div>
                      </div>
                      <div style={{ padding: 23 }}>
                        {/* Basic Information Section */}
                        <div className={styles.sectionTitle}>
                          <span className={styles.sectionTitleIcon}><FileOutlined /></span>
                          Basic Information
                        </div>
                        <div className={styles.basicInfoGrid}>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Title:</span>
                            <span className={styles.infoValueBold}>
                              {challenge?.title || "—"}
                            </span>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Duration:</span>
                            <span className={styles.infoValue}>
                              {challenge?.actualDuration || challenge?.duration || 30} days
                            </span>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Category:</span>
                            <span className={styles.categoryTag}>
                              {challenge?.category || challenge?.categoryName || "General"}
                            </span>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Community:</span>
                            <span className={styles.infoValue}>
                              {challenge?.community?.name || "Unknown"}
                            </span>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Difficulty:</span>
                            <span className={styles.difficultyTag}>
                              {challenge?.difficulty || "Intermediate"}
                            </span>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Created:</span>
                            <span className={styles.infoValue}>
                              {challenge?.createdAt
                                ? moment(challenge.createdAt).format("YYYY-MM-DD HH:mm")
                                : "Unknown"}
                            </span>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Est. Time:</span>
                            <span className={styles.infoValue}>
                              {challenge?.estimatedTime || "2-3 hours daily"}
                            </span>
                          </div>
                        </div>

                        {/* Timeline & Configuration Section */}
                        <div className={styles.timelineSection}>
                          <div className={styles.sectionTitle}>
                            <span className={styles.sectionTitleIcon}><CheckCircleOutlined /></span>
                            Timeline &amp; Configuration
                          </div>
                          <div className={styles.timelineGrid}>
                            <div className={`${styles.timelineItem} ${styles.timelineItemGreen}`}>
                              <div className={styles.timelineItemHeader}>
                                <div className={styles.timelineIconGreen}>
                                  <CheckCircleOutlined />
                                </div>
                                <span className={styles.timelineLabelGreen}>Start Date</span>
                              </div>
                              <span className={styles.timelineValueText}>
                                {challenge?.startDate
                                  ? moment(challenge.startDate).format("YYYY-MM-DD HH:mm")
                                  : "Not set"}
                              </span>
                            </div>
                            <div className={`${styles.timelineItem} ${styles.timelineItemRed}`}>
                              <div className={styles.timelineItemHeader}>
                                <div className={styles.timelineIconRed}>
                                  <CloseCircleOutlined />
                                </div>
                                <span className={styles.timelineLabelRed}>End Date</span>
                              </div>
                              <span className={styles.timelineValueText}>
                                {challenge?.endDate
                                  ? moment(challenge.endDate).format("YYYY-MM-DD HH:mm")
                                  : "Not set"}
                              </span>
                            </div>
                            <div className={`${styles.timelineItem} ${styles.timelineItemTeal}`}>
                              <div className={styles.timelineItemHeader}>
                                <div className={styles.timelineIconGold}>
                                  <FileOutlined />
                                </div>
                                <span className={styles.timelineLabelTeal}>Daily Tasks</span>
                              </div>
                              <span className={styles.timelineValueText}>
                                {challenge?.dailyTasks?.length || 0} tasks configured
                              </span>
                            </div>
                            <div className={`${styles.timelineItem} ${styles.timelineItemBlue}`}>
                              <div className={styles.timelineItemHeader}>
                                <div className={styles.timelineIconBlue}>
                                  <TrophyOutlined />
                                </div>
                                <span className={styles.timelineLabelBlue}>Rewards</span>
                              </div>
                              <span className={styles.timelineValueText}>
                                {challenge?.checkpointRewards?.length || 0} rewards configured
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>

                  {/* Right Column - Challenge Status & Recent Activity */}
                  <Col xs={24} lg={8}>
                    <div className={styles.statusCard}>
                      <div className={styles.statusCardHeader}>
                        <div className={styles.statusCardHeaderTitle}>
                          <CheckCircleOutlined style={{ fontSize: 16 }} /> Challenge Status
                        </div>
                      </div>
                      <div className={styles.statusCardBody}>
                        <div className={styles.statusHeader}>
                          <span className={styles.statusLabel}>Current Status:</span>
                          <span
                            className={`${styles.statusBadge} ${challenge?.status === "ongoing"
                              ? styles.statusBadgeOngoing
                              : challenge?.status === "upcoming"
                                ? styles.statusBadgeUpcoming
                                : challenge?.status === "completed"
                                  ? styles.statusBadgeCompleted
                                  : styles.statusBadgeUnpublished
                              }`}
                          >
                            {challenge?.status?.toUpperCase() || "UNPUBLISHED"}
                          </span>
                        </div>

                        <div className={styles.statusInfoBox}>
                          <div className={styles.statusInfoTitle}>
                            <CheckCircleOutlined style={{ fontSize: 14 }} />
                            Status Information
                          </div>
                          <div className={styles.statusInfoText}>
                            {challenge?.status === "unpublished" &&
                              "Challenge is not yet published and visible to participants. Use the 'Change Status' button to make it active."}
                            {challenge?.status === "upcoming" &&
                              "Challenge is published but has not started yet."}
                            {challenge?.status === "ongoing" &&
                              "Challenge is currently active and accepting submissions."}
                            {challenge?.status === "completed" &&
                              "Challenge has ended and no more submissions are accepted."}
                            {!challenge?.status &&
                              "Challenge is not yet published and visible to participants. Use the 'Change Status' button to make it active."}
                          </div>
                        </div>

                        <div className={styles.progressSection}>
                          <div className={styles.progressColumn}>
                            <span className={styles.progressLabel}>Progress</span>
                            <Progress
                              percent={timelineProgress ?? 0}
                              showInfo={false}
                              strokeColor="#32A4A4"
                              railColor="#F6F8F8"
                            />
                          </div>
                          <div>
                            <span className={styles.progressLabel}>Time Left</span>
                            <div className={styles.timeLeftValue}>{timeLeft ?? "—"}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.activityCard}>
                      <div className={styles.activityCardHeader}>
                        <div className={styles.activityCardHeaderTitle}>
                          <FileOutlined style={{ fontSize: 16 }} /> Recent Activity
                        </div>
                      </div>
                      <div className={styles.activityCardBody}>
                        {(() => {
                          const items = [];
                          const latestSubs = [...(submissions || [])]
                            .sort(
                              (a, b) =>
                                new Date(b.submittedAt) - new Date(a.submittedAt)
                            )
                            .slice(0, 3)
                            .map((s) => ({
                              key: `sub-${s._id}`,
                              type: "submit",
                              text: `${s.user?.name || s.user?.username || "User"} submitted Day ${s.day} ${s.submissionType || "submission"}`,
                              time: moment(s.submittedAt).fromNow(),
                            }));

                          const latestParticipants = [...(participants || [])]
                            .sort(
                              (a, b) => new Date(b.joinedAt) - new Date(a.joinedAt)
                            )
                            .slice(0, 2)
                            .map((p) => ({
                              key: `join-${p.user?._id}`,
                              type: "join",
                              text: `${p.user?.name || p.user?.username || "User"} joined the challenge`,
                              time: moment(p.joinedAt).fromNow(),
                            }));

                          items.push(...latestSubs, ...latestParticipants);
                          if (stats.totalParticipants && items.length < 5) {
                            items.push({
                              key: "milestone",
                              type: "milestone",
                              text: `${stats.totalParticipants} participants milestone reached`,
                              time: moment(
                                challenge?.updatedAt ||
                                challenge?.createdAt ||
                                new Date()
                              ).fromNow(),
                            });
                          }

                          return items.slice(0, 5).map((it) => (
                            <div key={it.key} className={styles.activityItem}>
                              <div
                                className={`${styles.activityIcon} ${it.type === "submit"
                                  ? styles.activityIconSubmit
                                  : it.type === "approve"
                                    ? styles.activityIconApprove
                                    : it.type === "join"
                                      ? styles.activityIconJoin
                                      : styles.activityIconMilestone
                                  }`}
                              >
                                {it.type === "submit" && <FileOutlined style={{ fontSize: 14 }} />}
                                {it.type === "approve" && <CheckCircleOutlined style={{ fontSize: 14 }} />}
                                {it.type === "join" && <Users size={14} />}
                                {it.type === "milestone" && <TrophyOutlined style={{ fontSize: 14 }} />}
                              </div>
                              <div className={styles.activityContent}>
                                <div className={styles.activityText}>{it.text}</div>
                                <div className={styles.activityTime}>{it.time}</div>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Challenge Configuration Card - Full Width at Bottom */}
                <div className={styles.configCard}>
                  <div className={styles.configCardHeader}>
                    <div className={styles.configCardHeaderTitle}>
                      <CheckCircleOutlined style={{ fontSize: 18 }} /> Challenge Configuration
                    </div>
                    <div className={styles.configCardHeaderSubtitle}>
                      Current settings and permissions for your challenge
                    </div>
                  </div>
                  <div style={{ padding: 23 }}>
                    <div className={styles.configGrid}>
                      <div className={styles.configColumn}>
                        <div className={styles.configColumnTitle}>Submission Settings</div>
                        <div className={styles.configItem}>
                          <span className={styles.configItemLabel}>Allow Late Submissions</span>
                          <span
                            className={
                              challenge?.settings?.allowLateSubmissions
                                ? styles.configEnabled
                                : styles.configDisabled
                            }
                          >
                            {challenge?.settings?.allowLateSubmissions ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <div className={styles.configItem}>
                          <span className={styles.configItemLabel}>Auto-approve Submissions</span>
                          <span
                            className={
                              challenge?.settings?.autoApproveSubmissions
                                ? styles.configEnabled
                                : styles.configDisabled
                            }
                          >
                            {challenge?.settings?.autoApproveSubmissions ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </div>
                      <div className={styles.configColumn}>
                        <div className={styles.configColumnTitle}>Community Features</div>
                        <div className={styles.configItem}>
                          <span className={styles.configItemLabel}>Public Leaderboard</span>
                          <span
                            className={
                              challenge?.settings?.publicLeaderboard
                                ? styles.configPublic
                                : styles.configDisabled
                            }
                          >
                            {challenge?.settings?.publicLeaderboard ? "Public" : "Private"}
                          </span>
                        </div>
                        <div className={styles.configItem}>
                          <span className={styles.configItemLabel}>Peer Reviews</span>
                          <span
                            className={
                              challenge?.settings?.peerReviews
                                ? styles.configEnabled
                                : styles.configDisabled
                            }
                          >
                            {challenge?.settings?.peerReviews ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </div>
                      <div className={styles.configColumn}>
                        <div className={styles.configColumnTitle}>Rewards & Permissions</div>
                        <div className={styles.configItem}>
                          <span className={styles.configItemLabel}>Approval for Rewards</span>
                          <span
                            className={
                              challenge?.settings?.requireApprovalForRewards
                                ? styles.configRequired
                                : styles.configDisabled
                            }
                          >
                            {challenge?.settings?.requireApprovalForRewards ? "Required" : "Not Required"}
                          </span>
                        </div>
                        <div className={styles.configItem}>
                          <span className={styles.configItemLabel}>Discussions</span>
                          <span
                            className={
                              challenge?.settings?.discussionsEnabled
                                ? styles.configEnabled
                                : styles.configDisabled
                            }
                          >
                            {challenge?.settings?.discussionsEnabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "submissions",
            label: "Submissions",
            children: (
              <div className={styles.tabContent}>
                {/* Submissions Management Header */}
                <div className={styles.submissionsManagementCard}>
                  <div className={styles.submissionsManagementHeader}>
                    <div className={styles.submissionsManagementTitle}>
                      <FileText size={22} />
                      <h2>Submissions Management</h2>
                    </div>
                    <button
                      className={styles.exportAllBtn}
                      onClick={handleExportData}
                    >
                      <Download size={15} />
                      Export All Data
                    </button>
                  </div>
                </div>

                {/* Filter Row */}
                <div className={styles.submissionsFilterRow}>
                  <div className={styles.searchInputWrapper}>
                    <Search size={15} />
                    <input
                      type="text"
                      className={styles.searchInput}
                      placeholder="Search submissions..."
                      value={submissionSearch}
                      onChange={(e) => setSubmissionSearch(e.target.value)}
                    />
                  </div>
                  <Select
                    className={styles.filterSelect}
                    value={submissionStatusFilter}
                    onChange={(val) => setSubmissionStatusFilter(val)}
                    suffixIcon={<ChevronDown size={14} />}
                  >
                    <Option value="all">All Status</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="approved">Approved</Option>
                    <Option value="rejected">Rejected</Option>
                    <Option value="needs_revision">Needs Revision</Option>
                  </Select>
                  <Select
                    className={styles.filterSelect}
                    value={submissionBulkAction}
                    onChange={(val) => setSubmissionBulkAction(val)}
                    placeholder="Bulk Actions"
                    suffixIcon={<ChevronDown size={14} />}
                  >
                    <Option value="">Bulk Actions</Option>
                    <Option value="approve">Approve Selected</Option>
                    <Option value="reject">Reject Selected</Option>
                  </Select>
                  <button
                    className={`${styles.applyBtn} ${selectedSubmissions.length > 0 ? styles.applyBtnActive : ""}`}
                    onClick={() => {
                      if (submissionBulkAction === "approve") handleBulkApprove();
                      if (submissionBulkAction === "reject") handleBulkReject();
                    }}
                    disabled={selectedSubmissions.length === 0}
                  >
                    Apply ({selectedSubmissions.length})
                  </button>
                </div>

                {/* Submission Details Table */}
                <div className={styles.submissionDetailsCard}>
                  <div className={styles.submissionDetailsHeader}>
                    <div>
                      <h2 className={styles.submissionDetailsTitle}>Submission Details</h2>
                      <p className={styles.submissionDetailsSubtitle}>
                        {filteredSubmissions.length} of {submissions.length} submissions
                      </p>
                    </div>
                  </div>
                  <div className={styles.submissionsTableWrapper}>
                    <Table
                      columns={submissionsColumns}
                      dataSource={filteredSubmissions}
                      rowKey="_id"
                      loading={submissionsLoading}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} submissions`,
                      }}
                      scroll={{ x: "max-content" }}
                      responsive={true}
                      size={window.innerWidth <= 768 ? "small" : "default"}
                      rowSelection={{
                        type: "checkbox",
                        selectedRowKeys: selectedSubmissions,
                        onChange: (selectedRowKeys) => {
                          setSelectedSubmissions(selectedRowKeys);
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "participants",
            label: "Participants",
            children: (
              <div className={styles.tabContent}>
                <Table
                  columns={participantsColumns}
                  dataSource={participants}
                  rowKey={(record) => record.user._id}
                  loading={participantsLoading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} participants`,
                  }}
                  scroll={{ x: "max-content" }}
                  responsive={true}
                  size={window.innerWidth <= 768 ? "small" : "default"}
                  title={() => (
                    <span>
                      Challenge Participants ({participants.length} total)
                    </span>
                  )}
                />
              </div>
            ),
          },
          {
            key: "analytics",
            label: "Analytics",
            children: (
              <div className={styles.tabContent}>
                <div className={styles.analyticsSection}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <h2>Challenge Analytics</h2>
                    <Button
                      type="primary"
                      icon={<BarChartOutlined />}
                      onClick={fetchAnalytics}
                      loading={analyticsLoading}
                    >
                      Refresh Analytics
                    </Button>
                  </div>

                  {analyticsLoading ? (
                    <div className={styles.loadingContainer}>
                      <Spin size="large" />
                      <p>Loading analytics data...</p>
                    </div>
                  ) : analyticsData ? (
                    <>
                      <Row gutter={[16, 16]} className={styles.statsRow}>
                        <Col xs={24} sm={12} md={6}>
                          <Card>
                            <Statistic
                              title="Submission Success Rate"
                              value={
                                analyticsData.summary?.approvedCount &&
                                  analyticsData.summary?.submissionCount
                                  ? Math.round(
                                    (analyticsData.summary.approvedCount /
                                      analyticsData.summary.submissionCount) *
                                    100
                                  )
                                  : 0
                              }
                              suffix="%"
                              prefix={
                                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                              }
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Card>
                            <Statistic
                              title="Average Progress"
                              value={
                                participants.length > 0
                                  ? Math.round(
                                    participants.reduce(
                                      (sum, p) => sum + p.progress,
                                      0
                                    ) / participants.length
                                  )
                                  : 0
                              }
                              suffix="%"
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Card>
                            <Statistic
                              title="Total Rewards Issued"
                              value={
                                participants.filter((p) => p.reward?.earned)
                                  .length || 0
                              }
                              prefix={
                                <TrophyOutlined style={{ color: "#faad14" }} />
                              }
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Card>
                            <Statistic
                              title="Rejection Rate"
                              value={
                                analyticsData.summary?.rejectedCount &&
                                  analyticsData.summary?.submissionCount
                                  ? Math.round(
                                    (analyticsData.summary.rejectedCount /
                                      analyticsData.summary.submissionCount) *
                                    100
                                  )
                                  : 0
                              }
                              suffix="%"
                              prefix={
                                <CloseCircleOutlined style={{ color: "#f5222d" }} />
                              }
                            />
                          </Card>
                        </Col>
                      </Row>

                      <Divider />

                      <h3>Checkpoint Completion Rates</h3>
                      <CheckpointCompletionChart
                        data={analyticsData.checkpointCompletion}
                      />

                      <Divider />

                      <h3>Participation Over Time</h3>
                      <DailyActivityChart
                        submissions={analyticsData.dailyData?.submissions}
                        participants={analyticsData.dailyData?.participants}
                      />
                    </>
                  ) : (
                    <div className={styles.chartPlaceholder}>
                      <BarChartOutlined />
                      <p>Click &quot;Refresh Analytics&quot; to load data</p>
                      <Button
                        type="primary"
                        icon={<BarChartOutlined />}
                        onClick={fetchAnalytics}
                        style={{ marginTop: "16px" }}
                      >
                        Refresh Analytics
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ),
          },
        ]}
      />

      {/* Submission Review Modal */}
      <Modal
        title="Review Submission"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
        width={700}
        forceRender
      >
        {currentSubmission && (
          <div>
            <div className={styles.submissionDetails}>
              <p>
                <strong>User:</strong>{" "}
                {currentSubmission.user.name || currentSubmission.user.username}
              </p>
              <p>
                <strong>Submission Type:</strong>{" "}
                {currentSubmission.submissionType}
              </p>
              <p>
                <strong>Submitted:</strong>{" "}
                {moment(currentSubmission.submittedAt).format(
                  "YYYY-MM-DD HH:mm"
                )}
              </p>

              {currentSubmission.submissionType === "text" && (
                <div className={styles.submissionContent}>
                  <h3>Content:</h3>
                  <div className={styles.textContent}>
                    {currentSubmission.content}
                  </div>
                </div>
              )}

              {currentSubmission.attachments &&
                currentSubmission.attachments.length > 0 && (
                  <div className={styles.attachments}>
                    <h3>Attachments:</h3>
                    <div className={styles.attachmentList}>
                      {currentSubmission.attachments.map(
                        (attachment, index) => (
                          <div key={index} className={styles.attachment}>
                            {attachment.fileType?.startsWith("image/") ? (
                              <img
                                src={attachment.url}
                                alt={`Attachment ${index + 1}`}
                              />
                            ) : (
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {attachment.fileName ||
                                  `Attachment ${index + 1}`}
                              </a>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            <Divider />

            <Form form={form} onFinish={submitReview} layout="vertical">
              <Form.Item
                name="status"
                label="Review Status"
                rules={[{ required: true, message: "Please select a status" }]}
              >
                <Select placeholder="Select status">
                  <Option value="approved">Approve</Option>
                  <Option value="rejected">Reject</Option>
                  <Option value="needs_revision">Needs Revision</Option>
                </Select>
              </Form.Item>

              <Form.Item name="rating" label="Rating (optional)">
                <Select placeholder="Select rating">
                  <Option value={5}>5 - Excellent</Option>
                  <Option value={4}>4 - Good</Option>
                  <Option value={3}>3 - Average</Option>
                  <Option value={2}>2 - Poor</Option>
                  <Option value={1}>1 - Very Poor</Option>
                </Select>
              </Form.Item>

              <Form.Item name="comment" label="Feedback (optional)">
                <TextArea
                  rows={4}
                  placeholder="Provide feedback on the submission"
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Submit Review
                  </Button>
                  <Button onClick={() => setReviewModalVisible(false)}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Reward Assignment Modal */}
      <Modal
        title="Assign Reward"
        open={rewardModalVisible}
        onCancel={() => setRewardModalVisible(false)}
        footer={null}
        forceRender
      >
        {selectedParticipant && (
          <Form
            form={rewardForm}
            onFinish={submitRewardAssignment}
            layout="vertical"
          >
            <p>
              <strong>Assigning reward to:</strong>{" "}
              {selectedParticipant.user.name ||
                selectedParticipant.user.username}
            </p>

            <Form.Item
              name="rewardType"
              label="Reward Type"
              rules={[{ required: true, message: "Please select reward type" }]}
            >
              <Select placeholder="Select reward type">
                <Option value="cash">Cash Reward</Option>
                <Option value="prize">Physical Prize</Option>
                <Option value="badge">Digital Badge</Option>
                <Option value="certificate">Certificate</Option>
              </Select>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.rewardType !== currentValues.rewardType
              }
            >
              {({ getFieldValue }) => {
                const rewardType = getFieldValue("rewardType");

                if (rewardType === "cash") {
                  return (
                    <Form.Item
                      name="amount"
                      label="Amount"
                      rules={[
                        { required: true, message: "Please enter amount" },
                      ]}
                    >
                      <Input
                        prefix="$"
                        type="number"
                        placeholder="Enter amount"
                      />
                    </Form.Item>
                  );
                }

                if (rewardType === "prize") {
                  return (
                    <>
                      <Form.Item
                        name="prizeDetails"
                        label="Prize Name"
                        rules={[
                          {
                            required: true,
                            message: "Please enter prize name",
                          },
                        ]}
                      >
                        <Input placeholder="e.g. Amazon Gift Card" />
                      </Form.Item>
                      <Form.Item name="prizeValue" label="Estimated Value">
                        <Input prefix="$" placeholder="Optional value" />
                      </Form.Item>
                    </>
                  );
                }

                if (rewardType === "badge") {
                  return (
                    <Form.Item
                      name="badgeName"
                      label="Badge Name"
                      rules={[
                        { required: true, message: "Please enter badge name" },
                      ]}
                    >
                      <Input placeholder="e.g. Challenge Champion" />
                    </Form.Item>
                  );
                }

                if (rewardType === "certificate") {
                  return (
                    <Form.Item
                      name="certificateName"
                      label="Certificate Title"
                      rules={[
                        {
                          required: true,
                          message: "Please enter certificate title",
                        },
                      ]}
                    >
                      <Input placeholder="e.g. Certificate of Achievement" />
                    </Form.Item>
                  );
                }

                return null;
              }}
            </Form.Item>

            <Form.Item name="rank" label="For Rank (optional)">
              <Select placeholder="Reward for specific rank">
                <Option value={0}>All Completers</Option>
                <Option value={1}>1st Place</Option>
                <Option value={2}>2nd Place</Option>
                <Option value={3}>3rd Place</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Assign Reward
                </Button>
                <Button onClick={() => setRewardModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Edit Challenge Modal */}
      <Modal
        open={editChallengeModalVisible}
        onCancel={() => setEditChallengeModalVisible(false)}
        footer={null}
        width={880}
        forceRender
        closable={false}
        centered
        className={styles.editModalOverlay}
      >
        <Form form={editForm} onFinish={submitChallengeEdit} layout="vertical">
          {/* Teal Header */}
          <div className={styles.editModalHeader}>
            <div className={styles.editModalHeaderTitle}>
              <SquarePen />
              <span>Edit Challenge Details</span>
            </div>
            <div className={styles.editModalHeaderSubtitle}>
              Customize your challenge settings and configuration. All changes will be saved automatically.
            </div>
            <button
              type="button"
              className={styles.editModalCloseBtn}
              onClick={() => setEditChallengeModalVisible(false)}
            >
              <X />
            </button>
          </div>

          {/* Body */}
          <div className={styles.editModalBody}>
            {/* Section 1: Basic Information */}
            <div className={styles.editModalSection}>
              <div className={styles.editModalSectionHeader}>
                <Globe />
                <span className={styles.editModalSectionTitle}>Basic Information</span>
              </div>

              <div className={styles.editModalRow}>
                <div className={styles.editModalCol2}>
                  <Form.Item
                    name="title"
                    label="Challenge Title *"
                    rules={[{ required: true, message: "Please enter challenge title" }]}
                  >
                    <Input className={styles.editModalInput} placeholder="Enter challenge title" />
                  </Form.Item>
                </div>
                <div className={styles.editModalCol2}>
                  <Form.Item name="category" label="Category">
                    <Select
                      className={styles.editModalSelect}
                      placeholder="Select category"
                    >
                      <Option value="Data Structures & Algorithms">Data Structures & Algorithms</Option>
                      <Option value="Web Development">Web Development</Option>
                      <Option value="Mobile Development">Mobile Development</Option>
                      <Option value="Machine Learning">Machine Learning</Option>
                      <Option value="System Design">System Design</Option>
                      <Option value="DevOps">DevOps</Option>
                      <Option value="General">General</Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>

              <div className={styles.editModalColFull}>
                <Form.Item
                  name="description"
                  label="Description *"
                  rules={[{ required: true, message: "Please enter description" }]}
                >
                  <TextArea
                    className={styles.editModalTextarea}
                    rows={3}
                    placeholder="Enter challenge description"
                  />
                </Form.Item>
              </div>

              <div className={styles.editModalRow}>
                <div className={styles.editModalCol3}>
                  <Form.Item name="difficulty" label="Difficulty Level">
                    <Select className={styles.editModalSelect} placeholder="Select difficulty">
                      <Option value="Beginner">Beginner</Option>
                      <Option value="Intermediate">Intermediate</Option>
                      <Option value="Advanced">Advanced</Option>
                      <Option value="Expert">Expert</Option>
                    </Select>
                  </Form.Item>
                </div>
                <div className={styles.editModalCol3}>
                  <Form.Item name="duration" label="Duration">
                    <Input className={styles.editModalInput} placeholder="e.g. 30 days" />
                  </Form.Item>
                </div>
                <div className={styles.editModalCol3}>
                  <Form.Item name="dailyTimeCommitment" label="Daily Time Commitment">
                    <Input className={styles.editModalInput} placeholder="e.g. 2-3 hours daily" />
                  </Form.Item>
                </div>
              </div>
            </div>

            <hr className={styles.editModalDivider} />

            {/* Section 2: Schedule & Participation */}
            <div className={styles.editModalSection}>
              <div className={styles.editModalSectionHeader}>
                <CalendarDays />
                <span className={styles.editModalSectionTitle}>Schedule & Participation</span>
              </div>

              <div className={styles.editModalRow}>
                <div className={styles.editModalCol2}>
                  <Form.Item
                    name="startDate"
                    label="Start Date & Time *"
                    rules={[{ required: true, message: "Please select start date" }]}
                  >
                    <DatePicker
                      className={styles.editModalDatePicker}
                      showTime
                      format="MM/DD/YYYY hh:mm A"
                      placeholder="Select start date & time"
                    />
                  </Form.Item>
                </div>
                <div className={styles.editModalCol2}>
                  <Form.Item
                    name="endDate"
                    label="End Date & Time *"
                    rules={[{ required: true, message: "Please select end date" }]}
                  >
                    <DatePicker
                      className={styles.editModalDatePicker}
                      showTime
                      format="MM/DD/YYYY hh:mm A"
                      placeholder="Select end date & time"
                    />
                  </Form.Item>
                </div>
              </div>

              <div className={styles.editModalColFull}>
                <Form.Item name="maxParticipants" label="Maximum Participants">
                  <Input
                    className={styles.editModalInput}
                    type="number"
                    placeholder="e.g. 1000"
                  />
                </Form.Item>
              </div>
            </div>

            <hr className={styles.editModalDivider} />

            {/* Section 3: Challenge Settings */}
            <div className={styles.editModalSection}>
              <div className={styles.editModalSectionHeader}>
                <Settings />
                <span className={styles.editModalSectionTitle}>Challenge Settings</span>
              </div>

              <div className={styles.editModalSettingsRow}>
                {/* Left column: Submission Settings */}
                <div className={styles.editModalSettingsCol}>
                  <div className={styles.editModalSettingsSubtitle}>Submission Settings</div>
                  <div className={styles.editModalSettingCard}>
                    <div className={styles.editModalSettingInfo}>
                      <span className={styles.editModalSettingLabel}>Allow Late Submissions</span>
                      <span className={styles.editModalSettingDesc}>Participants can submit after deadline</span>
                    </div>
                    <Form.Item name="allowLateSubmissions" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>
                  <div className={styles.editModalSettingCard}>
                    <div className={styles.editModalSettingInfo}>
                      <span className={styles.editModalSettingLabel}>Auto Approve Submissions</span>
                      <span className={styles.editModalSettingDesc}>Automatically approve all submissions</span>
                    </div>
                    <Form.Item name="autoApproveSubmissions" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>
                </div>

                {/* Right column: Community Features */}
                <div className={styles.editModalSettingsCol}>
                  <div className={styles.editModalSettingsSubtitle}>Community Features</div>
                  <div className={styles.editModalSettingCard}>
                    <div className={styles.editModalSettingInfo}>
                      <span className={styles.editModalSettingLabel}>Public Leaderboard</span>
                      <span className={styles.editModalSettingDesc}>Show participant rankings publicly</span>
                    </div>
                    <Form.Item name="publicLeaderboard" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>
                  <div className={styles.editModalSettingCard}>
                    <div className={styles.editModalSettingInfo}>
                      <span className={styles.editModalSettingLabel}>Enable Discussions</span>
                      <span className={styles.editModalSettingDesc}>Allow participant discussions</span>
                    </div>
                    <Form.Item name="enableDiscussions" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Full-width: Require Approval for Rewards */}
              <div className={styles.editModalSettingCardFull}>
                <div className={styles.editModalSettingCardFullInfo}>
                  <div className={styles.editModalSettingCardFullLabel}>
                    <Shield />
                    <span className={styles.editModalSettingLabel}>Require Approval for Rewards</span>
                  </div>
                  <span className={styles.editModalSettingDesc}>
                    Manual approval required before distributing rewards to participants
                  </span>
                </div>
                <Form.Item name="requireApprovalForRewards" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.editModalFooterWrapper}>
            <hr className={styles.editModalFooterDivider} />
            <div className={styles.editModalFooter}>
              <button
                type="button"
                className={styles.editModalCancelBtn}
                onClick={() => setEditChallengeModalVisible(false)}
              >
                Cancel
              </button>
              <button type="submit" className={styles.editModalSaveBtn}>
                Save Changes
              </button>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        title="Change Challenge Status"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        footer={null}
        forceRender
      >
        <Form form={statusForm} layout="vertical" onFinish={submitStatusChange}>
          <Form.Item
            name="status"
            label="Challenge Status"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select placeholder="Select status">
              <Option value="unpublished">Unpublished</Option>
              <Option value="upcoming">Upcoming</Option>
              <Option value="ongoing">Ongoing</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Status
              </Button>
              <Button onClick={() => setStatusModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Challenge Confirmation */}
      <Modal
        title="Confirm Delete Challenge"
        visible={deleteConfirmVisible}
        onCancel={() => setDeleteConfirmVisible(false)}
        footer={null}
      >
        <p>
          Are you sure you want to delete this challenge? This action cannot be
          undone.
        </p>

        <div className={styles.deleteModalActions}>
          <Button onClick={() => setDeleteConfirmVisible(false)}>Cancel</Button>
          <Button type="primary" danger onClick={confirmDeleteChallenge}>
            Delete Challenge
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminChallengeDashboard;
