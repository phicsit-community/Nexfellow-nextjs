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
  message,
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
} from "lucide-react";
import moment from "moment";

import {
  CheckpointCompletionChart,
  DailyActivityChart,
} from "../../components/Analytics/AnalyticsCharts";
import BackButton from "../../components/BackButton/BackButton";
import styles from "./AdminChallengeDashboard.module.css";

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const AdminChallengeDashboard = () => {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

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
        setChallenge(response.data.challenge);
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

  // Fetch participants
  const fetchParticipants = useCallback(async () => {
    try {
      setParticipantsLoading(true);

      const response = await api.get(`/challenge/${id}/participants`, {
        withCredentials: true,
      });

      const participantsData = response.data?.participants || [];
      setParticipants(participantsData);

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalParticipants: participantsData.length,
        completedCount: participantsData.filter((p) => p.progress >= 100)
          .length,
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
  }, [id, handleApiError]);

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
      description: challenge?.description,
      startDate: challenge?.startDate ? moment(challenge.startDate) : null,
      endDate: challenge?.endDate ? moment(challenge.endDate) : null,
      allowLateSubmissions: challenge?.settings?.allowLateSubmissions,
      autoApproveSubmissions: challenge?.settings?.autoApproveSubmissions,
      requireApprovalForRewards: challenge?.settings?.requireApprovalForRewards,
    });
  };

  const submitChallengeEdit = async (values) => {
    try {
      message.loading({ content: "Updating challenge...", key: "edit" });

      const updateData = {
        title: values.title,
        description: values.description,
        startDate: values.startDate?.toISOString(),
        endDate: values.endDate?.toISOString(),
        settings: {
          allowLateSubmissions: values.allowLateSubmissions,
          autoApproveSubmissions: values.autoApproveSubmissions,
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
      title: "User",
      dataIndex: ["user", "name"],
      key: "user",
      render: (text, record) =>
        record.user?.name || record.user?.username || "Unknown User",
      width: 150,
    },
    {
      title: "Day",
      dataIndex: "day",
      key: "day",
      render: (day) => {
        const dailyTask = challenge?.dailyTasks?.find(
          (task) => task.day === day
        );
        return (
          <div>
            <div>Day {day}</div>
            {dailyTask && (
              <div style={{ fontSize: "12px", color: "#666" }}>
                {dailyTask.title}
              </div>
            )}
          </div>
        );
      },
      width: 120,
    },
    {
      title: "Type",
      dataIndex: "submissionType",
      key: "submissionType",
      render: (type) => <Tag color="blue">{type || "text"}</Tag>,
      width: 100,
    },
    {
      title: "Submitted",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date) => moment(date).format("MMM DD, HH:mm"),
      sorter: (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt),
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusConfig = {
          pending: { color: "orange", icon: <QuestionCircleOutlined /> },
          approved: { color: "green", icon: <CheckCircleOutlined /> },
          rejected: { color: "red", icon: <CloseCircleOutlined /> },
          needs_revision: { color: "yellow", icon: <FileOutlined /> },
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
          <Tag color={config.color} icon={config.icon}>
            {status?.replace("_", " ").toUpperCase()}
          </Tag>
        );
      },
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Approved", value: "approved" },
        { text: "Rejected", value: "rejected" },
        { text: "Needs Revision", value: "needs_revision" },
      ],
      onFilter: (value, record) => record.status === value,
      width: 130,
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      render: (content) => (
        <div
          style={{
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {content
            ? content.substring(0, 50) + (content.length > 50 ? "..." : "")
            : "No content"}
        </div>
      ),
      width: 200,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => handleReviewSubmission(record)}
            disabled={record.status !== "pending"}
          >
            Review
          </Button>
        </Space>
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
      <div className={styles.dashboardHeader}>

        <div className={styles.headerTitleRow}>
          <div className={styles.headerTitleWrap}>
            <h1>
              {challenge?.title || challenge?.challengeTitle} Admin Dashboard
            </h1>
            <p>Manage participants, submissions, and rewards</p>
          </div>
          {challenge?.status && (
            <Tag
              className={`${styles.statusTag} ${challenge.status === "ongoing"
                ? styles.statusOngoing
                : challenge.status === "upcoming"
                  ? styles.statusUpcoming
                  : challenge.status === "completed"
                    ? styles.statusCompleted
                    : styles.statusUnpublished
                }`}
            >
              {challenge.status.toUpperCase()}
            </Tag>
          )}
        </div>

        <div className={styles.managementButtons}>
          <Space wrap>
            <Button onClick={handleEditChallenge} icon={<FileOutlined />}>
              Edit Challenge
            </Button>
            <Button onClick={handleStatusChange} icon={<CheckCircleOutlined />}>
              Change Status
            </Button>
            <Button
              danger
              onClick={handleDeleteChallenge}
              icon={<CloseCircleOutlined />}
            >
              Delete
            </Button>
            <Button onClick={handleExportData} icon={<ExportOutlined />}>
              Export
            </Button>
          </Space>
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
                bodyStyle={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
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
                bodyStyle={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
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
                        color: "#52C41A",
                        marginLeft: "4px",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      }}
                    >
                      %
                    </span>
                  </div>
                </div>
                <Progress
                  percent={dynamicCompletionRate}
                  strokeColor="#52C41A"
                  trailColor="#E8E8E8"
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
                bodyStyle={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
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
                bodyStyle={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
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
                bodyStyle={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
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
                bodyStyle={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
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
                        color: "#F5222D",
                        marginLeft: "4px",
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      }}
                    >
                      %
                    </span>
                  </div>
                </div>
                <Progress
                  percent={dailyEngagement}
                  strokeColor="#F5222D"
                  trailColor="#F5F5F5"
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
      >
        <TabPane tab="Overview" key="overview">
          <div className={styles.tabContent}>
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="Challenge Overview" style={{ marginBottom: 16 }}>
                  <div className={styles.challengeDetails}>
                    <div className={styles.detailItem}>
                      <strong>Title:</strong> {challenge?.title}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Category:</strong>{" "}
                      {challenge?.category || challenge?.categoryName || "—"}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Community:</strong>{" "}
                      {challenge?.community?.name || "Unknown"}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Difficulty:</strong>{" "}
                      {challenge?.difficulty || "—"}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Duration:</strong>{" "}
                      {challenge?.actualDuration || challenge?.duration} days
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Created:</strong>{" "}
                      {challenge?.createdAt
                        ? moment(challenge.createdAt).format("YYYY-MM-DD HH:mm")
                        : "Unknown"}
                    </div>
                    <div className={styles.detailItem}>
                      <strong>Est. Time:</strong>{" "}
                      {challenge?.estimatedTime || "2-3 hours daily"}
                    </div>
                  </div>
                </Card>

                <Card
                  title="Timeline & Configuration"
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Card size="small">
                        <Space>
                          <CheckCircleOutlined style={{ color: "#52c41a" }} />
                          <div>
                            <div>
                              <strong>Start Date</strong>
                            </div>
                            <div>
                              {challenge?.startDate
                                ? moment(challenge.startDate).format(
                                  "YYYY-MM-DD HH:mm"
                                )
                                : "Not set"}
                            </div>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small">
                        <Space>
                          <FileOutlined style={{ color: "#1890ff" }} />
                          <div>
                            <div>
                              <strong>Daily Tasks</strong>
                            </div>
                            <div>
                              {challenge?.dailyTasks?.length || 0} tasks
                              configured
                            </div>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small">
                        <Space>
                          <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                          <div>
                            <div>
                              <strong>End Date</strong>
                            </div>
                            <div>
                              {challenge?.endDate
                                ? moment(challenge.endDate).format(
                                  "YYYY-MM-DD HH:mm"
                                )
                                : "Not set"}
                            </div>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Card size="small">
                        <Space>
                          <TrophyOutlined style={{ color: "#faad14" }} />
                          <div>
                            <div>
                              <strong>Rewards</strong>
                            </div>
                            <div>
                              {challenge?.checkpointRewards?.length || 0}{" "}
                              rewards configured
                            </div>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                </Card>

                <Card title="Challenge Configuration">
                  <div className={styles.settingsGrid}>
                    <div className={styles.settingItem}>
                      <span>Allow Late Submissions</span>
                      <Tag
                        color={
                          challenge?.settings?.allowLateSubmissions
                            ? "green"
                            : "red"
                        }
                      >
                        {challenge?.settings?.allowLateSubmissions
                          ? "Enabled"
                          : "Disabled"}
                      </Tag>
                    </div>
                    <div className={styles.settingItem}>
                      <span>Auto-approve Submissions</span>
                      <Tag
                        color={
                          challenge?.settings?.autoApproveSubmissions
                            ? "green"
                            : "red"
                        }
                      >
                        {challenge?.settings?.autoApproveSubmissions
                          ? "Enabled"
                          : "Disabled"}
                      </Tag>
                    </div>
                    <div className={styles.settingItem}>
                      <span>Public Leaderboard</span>
                      <Tag
                        color={
                          challenge?.settings?.publicLeaderboard
                            ? "green"
                            : "default"
                        }
                      >
                        {challenge?.settings?.publicLeaderboard
                          ? "Public"
                          : "Private"}
                      </Tag>
                    </div>
                    <div className={styles.settingItem}>
                      <span>Peer Reviews</span>
                      <Tag
                        color={
                          challenge?.settings?.peerReviews ? "green" : "default"
                        }
                      >
                        {challenge?.settings?.peerReviews
                          ? "Enabled"
                          : "Disabled"}
                      </Tag>
                    </div>
                    <div className={styles.settingItem}>
                      <span>Approval for Rewards</span>
                      <Tag
                        color={
                          challenge?.settings?.requireApprovalForRewards
                            ? "orange"
                            : "green"
                        }
                      >
                        {challenge?.settings?.requireApprovalForRewards
                          ? "Required"
                          : "Not Required"}
                      </Tag>
                    </div>
                    <div className={styles.settingItem}>
                      <span>Discussions</span>
                      <Tag
                        color={
                          challenge?.settings?.discussionsEnabled
                            ? "green"
                            : "default"
                        }
                      >
                        {challenge?.settings?.discussionsEnabled
                          ? "Enabled"
                          : "Disabled"}
                      </Tag>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card title="Challenge Status" style={{ marginBottom: 16 }}>
                  <div className={styles.statusInfo}>
                    <div className={styles.currentStatus}>
                      <strong>Current Status:</strong>
                      <Tag
                        className={`${styles.statusTag} ${challenge?.status === "ongoing"
                          ? styles.statusOngoing
                          : challenge?.status === "upcoming"
                            ? styles.statusUpcoming
                            : challenge?.status === "completed"
                              ? styles.statusCompleted
                              : styles.statusUnpublished
                          }`}
                        style={{ marginLeft: 8 }}
                      >
                        {challenge?.status?.toUpperCase()}
                      </Tag>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <span>Progress:</span>
                        <div style={{ flex: 1 }}>
                          <Progress
                            percent={timelineProgress ?? 0}
                            size="small"
                          />
                        </div>
                        <span>{timelineProgress ?? 0}%</span>
                      </div>
                      <div style={{ marginTop: 8, color: "#666" }}>
                        <ClockCircleOutlined />{" "}
                        <span style={{ marginLeft: 6 }}>
                          Time Left: {timeLeft ?? "—"}
                        </span>
                      </div>
                    </div>
                    <div className={styles.statusDescription}>
                      {challenge?.status === "unpublished" &&
                        "Challenge is not yet published and visible to participants. Use the 'Change Status' button to make it active."}
                      {challenge?.status === "upcoming" &&
                        "Challenge is published but has not started yet."}
                      {challenge?.status === "ongoing" &&
                        "Challenge is currently active and accepting submissions."}
                      {challenge?.status === "completed" &&
                        "Challenge has ended and no more submissions are accepted."}
                    </div>
                  </div>
                </Card>

                <Card title="Recent Activity">
                  <div>
                    {(() => {
                      const items = [];
                      const latestSubs = [...(submissions || [])]
                        .sort(
                          (a, b) =>
                            new Date(b.submittedAt) - new Date(a.submittedAt)
                        )
                        .slice(0, 4)
                        .map((s) => ({
                          key: `sub-${s._id}`,
                          text: `${s.user?.name || s.user?.username || "User"
                            } submitted Day ${s.day} ${s.submissionType || "submission"
                            }`,
                          time: moment(s.submittedAt).fromNow(),
                        }));

                      const latestParticipants = [...(participants || [])]
                        .sort(
                          (a, b) => new Date(b.joinedAt) - new Date(a.joinedAt)
                        )
                        .slice(0, 2)
                        .map((p) => ({
                          key: `join-${p.user?._id}`,
                          text: `${p.user?.name || p.user?.username || "User"
                            } joined the challenge`,
                          time: moment(p.joinedAt).fromNow(),
                        }));

                      items.push(...latestSubs, ...latestParticipants);
                      if (stats.totalParticipants && items.length < 6) {
                        items.push({
                          key: "milestone",
                          text: `system ${stats.totalParticipants} participants milestone reached`,
                          time: moment(
                            challenge?.updatedAt ||
                            challenge?.createdAt ||
                            new Date()
                          ).fromNow(),
                        });
                      }

                      return items.slice(0, 6).map((it) => (
                        <div
                          key={it.key}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "8px 0",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          <span>{it.text}</span>
                          <span style={{ color: "#8c8c8c" }}>{it.time}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </TabPane>

        <TabPane tab="Submissions" key="submissions">
          <div className={styles.tabContent}>
            <div className={styles.filterRow}>
              <Button icon={<FileOutlined />} onClick={handleExportData}>
                Export Data
              </Button>
            </div>
            <Table
              columns={submissionsColumns}
              dataSource={submissions}
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
                onChange: (selectedRowKeys) => {
                  setSelectedSubmissions(selectedRowKeys);
                },
                getCheckboxProps: (record) => ({
                  disabled: record.status !== "pending",
                }),
              }}
              title={() => (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    Submissions Management ({submissions.length} total)
                  </span>
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      onClick={handleBulkApprove}
                    >
                      Bulk Approve
                    </Button>
                    <Button danger size="small" onClick={handleBulkReject}>
                      Bulk Reject
                    </Button>
                  </Space>
                </div>
              )}
            />
          </div>
        </TabPane>

        <TabPane tab="Participants" key="participants">
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
        </TabPane>

        <TabPane tab="Analytics" key="analytics">
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
        </TabPane>
      </Tabs>

      {/* Submission Review Modal */}
      <Modal
        title="Review Submission"
        visible={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
        width={700}
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
        visible={rewardModalVisible}
        onCancel={() => setRewardModalVisible(false)}
        footer={null}
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
        title="Edit Challenge"
        visible={editChallengeModalVisible}
        onCancel={() => setEditChallengeModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={editForm} onFinish={submitChallengeEdit} layout="vertical">
          <Form.Item
            name="title"
            label="Challenge Title"
            rules={[
              { required: true, message: "Please enter challenge title" },
            ]}
          >
            <Input placeholder="Enter challenge title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={4} placeholder="Enter challenge description" />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: "Please select start date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              showTime
              placeholder="Select start date"
            />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true, message: "Please select end date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              showTime
              placeholder="Select end date"
            />
          </Form.Item>

          <Form.Item
            name="allowLateSubmissions"
            label="Allow Late Submissions"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="autoApproveSubmissions"
            label="Auto Approve Submissions"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="requireApprovalForRewards"
            label="Require Approval for Rewards"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
              <Button onClick={() => setEditChallengeModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        title="Change Challenge Status"
        visible={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        footer={null}
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
