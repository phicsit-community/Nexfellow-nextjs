"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
// styles
import styles from "./CreateChallengeOverlay.module.css";

// components
import Switch from "@mui/material/Switch";
import axios from "axios";
import moment from "moment";
import {
  DatePicker,
  Input,
  Tabs,
  Button,
  Select,
  Alert,
  Card,
  Space,
} from "antd";

// assets
import trophy from "./assets/trophyImage.svg";
import edit from "./assets/edit.svg";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { toast } from "sonner";

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const CreateChallengeOverlay = ({
  setIsPopupOpen,
  dateAndTimeData,
  setAllChallenge,
  selectedDuration,
}) => {
  const params = useParams();
  const communityId = params?.communityId;
  const [activeTab, setActiveTab] = useState("1");
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [coverImage] = useState(null);
  const [duration, setDuration] = useState(selectedDuration || 7); // 7, 30, 100, or custom
  const [customDuration, setCustomDuration] = useState(null);

  // Daily tasks for the new challenge structure
  const [dailyTasks, setDailyTasks] = useState([]);

  // Checkpoint rewards for the new challenge structure
  const [checkpointRewards, setCheckpointRewards] = useState([]);

  // Challenge settings
  const [settings, setSettings] = useState({
    allowLateSubmissions: false,
    autoApproveSubmissions: false,
    requireApprovalForRewards: true,
  });

  // Form validation state
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for date and time using moment
  const [startDateTime, setStartDateTime] = useState(
    dateAndTimeData?.startDate && dateAndTimeData?.startTime
      ? moment(
        `${dateAndTimeData.startDate} ${dateAndTimeData.startTime}`,
        "YYYY-MM-DD HH:mm"
      )
      : moment().add(1, "day").startOf("day")
  );
  const [endDateTime, setEndDateTime] = useState(
    dateAndTimeData?.endDate && dateAndTimeData?.endTime
      ? moment(
        `${dateAndTimeData.endDate} ${dateAndTimeData.endTime}`,
        "YYYY-MM-DD HH:mm"
      )
      : moment()
        .add(selectedDuration || 7, "days")
        .endOf("day")
  );

  // Auto-generate daily tasks and default checkpoints based on duration
  useEffect(() => {
    const effectiveDuration = customDuration || duration;
    if (effectiveDuration && effectiveDuration > 0) {
      const tasks = [];
      for (let i = 1; i <= effectiveDuration; i++) {
        tasks.push({
          day: i,
          title: `Day ${i} Task`,
          description: `Complete your day ${i} challenge`,
          submissionType: "text",
          submissionPrompt: `Share your progress for day ${i}`,
        });
      }
      setDailyTasks(tasks);

      // Auto-generate default checkpoint rewards (Day 1 and Last Day)
      const defaultCheckpoints = [
        {
          checkpointDay: 1,
          rewardType: "badge",
          rewardValue: "Welcome Badge",
          rewardDescription:
            "Special starting point reward for beginning your challenge journey!",
        },
        {
          checkpointDay: effectiveDuration,
          rewardType: "certificate",
          rewardValue: "Challenge Completion Certificate",
          rewardDescription:
            "Congratulations! You've successfully completed the entire challenge!",
        },
      ];
      setCheckpointRewards(defaultCheckpoints);

      // Update end date based on duration
      if (startDateTime) {
        setEndDateTime(
          moment(startDateTime)
            .add(effectiveDuration - 1, "days")
            .endOf("day")
        );
      }
    }
  }, [duration, customDuration, startDateTime]);

  // Validate form fields on change
  useEffect(() => {
    if (formSubmitted) {
      validateFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    challengeTitle,
    challengeDescription,
    startDateTime,
    endDateTime,
    dailyTasks,
    checkpointRewards,
    formSubmitted,
  ]);

  // Validate specific fields and update errors state
  const validateFields = () => {
    const newErrors = {};

    // Validate title
    if (!challengeTitle.trim()) {
      newErrors.title = "Challenge title is required";
    } else if (challengeTitle.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (challengeTitle.trim().length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    // Validate description
    if (!challengeDescription.trim()) {
      newErrors.description = "Challenge description is required";
    } else if (challengeDescription.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Validate duration
    const effectiveDuration = customDuration || duration;
    if (!effectiveDuration || effectiveDuration <= 0) {
      newErrors.duration = "Valid duration is required";
    } else if (effectiveDuration > 365) {
      newErrors.duration = "Duration cannot exceed 365 days";
    }

    // Validate dates
    if (!startDateTime) {
      newErrors.startDate = "Start date is required";
    }

    if (!endDateTime) {
      newErrors.endDate = "End date is required";
    } else if (
      startDateTime &&
      endDateTime &&
      startDateTime.isAfter(endDateTime)
    ) {
      newErrors.endDate = "End date must be after start date";
    }

    // Validate date range matches duration
    if (startDateTime && endDateTime && effectiveDuration) {
      const daysDifference = endDateTime.diff(startDateTime, "days") + 1;
      if (daysDifference < effectiveDuration) {
        newErrors.dateRange = `Date range (${daysDifference} days) is shorter than the challenge duration (${effectiveDuration} days)`;
      }
    }

    // Validate daily tasks count matches duration
    if (dailyTasks.length !== effectiveDuration) {
      newErrors.dailyTasksCount = `Number of daily tasks (${dailyTasks.length}) must match the challenge duration (${effectiveDuration} days)`;
    }

    // Validate daily tasks if any
    if (dailyTasks.length > 0) {
      const taskErrors = [];

      dailyTasks.forEach((task, index) => {
        const taskErrs = {};

        if (!task.title?.trim()) {
          taskErrs.title = `Title is required`;
        }

        if (!task.description?.trim()) {
          taskErrs.description = `Description is required`;
        }

        if (!task.submissionPrompt?.trim()) {
          taskErrs.submissionPrompt = `Submission prompt is required`;
        }

        // Validate day sequence
        if (task.day !== index + 1) {
          taskErrs.day = `Day should be ${index + 1}`;
        }

        if (Object.keys(taskErrs).length > 0) {
          taskErrors[index] = taskErrs;
        }
      });

      if (Object.keys(taskErrors).length > 0) {
        newErrors.dailyTasks = taskErrors;
      }
    }

    // Validate checkpoint rewards if any
    if (checkpointRewards.length > 0) {
      const rewardErrors = [];

      checkpointRewards.forEach((reward, index) => {
        const rwErrors = {};

        if (!reward.rewardValue?.trim()) {
          rwErrors.rewardValue = `Reward value is required`;
        }

        if (!reward.rewardDescription?.trim()) {
          rwErrors.rewardDescription = `Reward description is required`;
        }

        if (!reward.checkpointDay || reward.checkpointDay < 1) {
          rwErrors.checkpointDay = `Valid checkpoint day is required`;
        } else if (reward.checkpointDay > effectiveDuration) {
          rwErrors.checkpointDay = `Checkpoint day cannot exceed challenge duration (${effectiveDuration})`;
        }

        if (Object.keys(rwErrors).length > 0) {
          rewardErrors[index] = rwErrors;
        }
      });

      if (Object.keys(rewardErrors).length > 0) {
        newErrors.checkpointRewards = rewardErrors;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle daily tasks
  const addDailyTask = () => {
    setDailyTasks([
      ...dailyTasks,
      {
        day: dailyTasks.length + 1,
        title: "",
        description: "",
        submissionType: "text",
        submissionPrompt: "",
      },
    ]);
  };

  const updateDailyTask = (index, field, value) => {
    const updatedTasks = [...dailyTasks];
    updatedTasks[index][field] = value;
    setDailyTasks(updatedTasks);
  };

  const removeDailyTask = (index) => {
    const updatedTasks = dailyTasks.filter((_, i) => i !== index);
    // Reorder the day numbers
    updatedTasks.forEach((task, i) => {
      task.day = i + 1;
    });
    setDailyTasks(updatedTasks);
  };

  // Duplicate a specific task
  const duplicateTask = (index) => {
    const taskToDuplicate = dailyTasks[index];
    const newTask = {
      ...taskToDuplicate,
      day: dailyTasks.length + 1,
      title: `${taskToDuplicate.title} (Copy)`,
    };
    setDailyTasks([...dailyTasks, newTask]);
  };

  // Apply the same task to all days
  const applySameTaskToAllDays = (sourceIndex) => {
    const sourceTask = dailyTasks[sourceIndex];
    const effectiveDuration = customDuration || duration;

    const newTasks = [];
    for (let i = 1; i <= effectiveDuration; i++) {
      newTasks.push({
        ...sourceTask,
        day: i,
        title: sourceTask.title.replace(/Day \d+/, `Day ${i}`),
        description: sourceTask.description.replace(/day \d+/, `day ${i}`),
        submissionPrompt: sourceTask.submissionPrompt.replace(
          /day \d+/,
          `day ${i}`
        ),
      });
    }
    setDailyTasks(newTasks);
  };

  // Reset daily tasks to match current duration
  const resetDailyTasksForDuration = () => {
    const effectiveDuration = customDuration || duration;
    const tasks = [];
    for (let i = 1; i <= effectiveDuration; i++) {
      tasks.push({
        day: i,
        title: `Day ${i} Task`,
        description: `Complete your day ${i} challenge`,
        submissionType: "text",
        submissionPrompt: `Share your progress for day ${i}`,
      });
    }
    setDailyTasks(tasks);

    // Also reset checkpoint rewards to defaults
    const defaultCheckpoints = [
      {
        checkpointDay: 1,
        rewardType: "badge",
        rewardValue: "Welcome Badge",
        rewardDescription:
          "Special starting point reward for beginning your challenge journey!",
      },
      {
        checkpointDay: effectiveDuration,
        rewardType: "certificate",
        rewardValue: "Challenge Completion Certificate",
        rewardDescription:
          "Congratulations! You've successfully completed the entire challenge!",
      },
    ];
    setCheckpointRewards(defaultCheckpoints);
  };

  // Handle duration change and update end date accordingly
  const handleDurationChange = (newDuration) => {
    setDuration(newDuration);
    if (newDuration && newDuration > 0 && startDateTime) {
      setEndDateTime(
        moment(startDateTime)
          .add(newDuration - 1, "days")
          .endOf("day")
      );
    }
  };

  const handleCustomDurationChange = (newCustomDuration) => {
    setCustomDuration(newCustomDuration);
    if (newCustomDuration && newCustomDuration > 0 && startDateTime) {
      setEndDateTime(
        moment(startDateTime)
          .add(newCustomDuration - 1, "days")
          .endOf("day")
      );
    }
  };

  // Handle start date change and update end date accordingly
  const handleStartDateChange = (newStartDate) => {
    setStartDateTime(newStartDate);
    if (newStartDate) {
      const effectiveDuration = customDuration || duration;
      setEndDateTime(
        moment(newStartDate)
          .add(effectiveDuration - 1, "days")
          .endOf("day")
      );
    }
  };

  // Validate form
  const validateForm = () => {
    setFormSubmitted(true);
    return validateFields();
  };

  const handleTabChange = (key) => {
    // Only allow tab change if current tab is valid
    if (formSubmitted) {
      const isValid = validateFields();
      if (!isValid && activeTab === "1" && key !== "1") {
        toast.error("Please fix form errors before continuing");
        return;
      }
    }

    setActiveTab(key);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const userId = user ? JSON.parse(user).id : null;

    console.log(
      "Submitting challenge with userId:",
      userId,
      "and token:",
      token
    );

    if (!userId) {
      console.error("User not found or not authenticated");
      toast.error("Authentication required");
      return;
    }

    try {
      // Validate form
      if (!validateForm()) {
        return;
      }

      setIsLoading(true);

      // Calculate duration from dates or use selected duration
      const calculatedDuration =
        duration === "custom" && customDuration ? customDuration : duration;

      // Prepare FormData for multipart form submission
      const formData = new FormData();

      // Basic challenge data
      formData.append("title", challengeTitle);
      formData.append("description", challengeDescription);
      formData.append("duration", calculatedDuration);
      formData.append(
        "startDate",
        startDateTime ? startDateTime.toISOString() : new Date().toISOString()
      );
      formData.append(
        "endDate",
        endDateTime ? endDateTime.toISOString() : new Date().toISOString()
      );

      // Add community ID if available
      if (communityId) {
        formData.append("communityId", communityId);
      }

      // Add cover image if exists
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      // Add daily tasks
      if (dailyTasks.length > 0) {
        formData.append("dailyTasks", JSON.stringify(dailyTasks));
      }

      // Add checkpoint rewards
      if (checkpointRewards.length > 0) {
        formData.append("checkpointRewards", JSON.stringify(checkpointRewards));
      }

      // Add settings
      formData.append("settings", JSON.stringify(settings));

      console.log("Payload for creating challenge:", {
        title: challengeTitle,
        description: challengeDescription,
        duration: calculatedDuration,
        dailyTasksCount: dailyTasks.length,
        checkpointRewardsCount: checkpointRewards.length,
      });

      const response = await axios.post(
        "/challenge/create",
        formData,
        {},
        { withCredentials: true }
      );

      toast.success(response.data.message || "Challenge created successfully!");
      setAllChallenge((prev) => [...prev, response.data.challenge]);
      setIsPopupOpen(false);
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.error(
        error.response?.data?.message || "Failed to create challenge"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Checkpoint Rewards functions
  const addCheckpointReward = () => {
    const effectiveDuration = customDuration || duration;
    const nextAvailableDay = Math.min(
      Math.max(...checkpointRewards.map((r) => r.checkpointDay), 0) + 1,
      effectiveDuration
    );

    setCheckpointRewards([
      ...checkpointRewards,
      {
        checkpointDay: nextAvailableDay,
        rewardType: "badge",
        rewardValue: "",
        rewardDescription: "",
      },
    ]);
  };

  const removeCheckpointReward = (index) => {
    setCheckpointRewards(checkpointRewards.filter((_, i) => i !== index));
  };

  const updateCheckpointReward = (index, field, value) => {
    const updated = [...checkpointRewards];
    updated[index][field] = value;
    setCheckpointRewards(updated);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h2>New Challenge</h2>
          <button
            className={styles.closeButton}
            onClick={() => setIsPopupOpen(false)}
          >
            &times;
          </button>
        </div>

        {/* Tab Navigation */}
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          className={styles.challengeTabs}
        >
          <TabPane tab="Basics" key="1">
            <div className={styles.imageContainer}>
              {coverImage ? (
                <>
                  <img
                    src={coverImage}
                    alt="Challenge Cover"
                    className={styles.challengeImage}
                  />
                  <button className={styles.editIcon}>
                    <img src={edit} alt="Edit" />
                  </button>
                </>
              ) : (
                <div className={styles.challengeImage}>
                  <img src={trophy} alt="Default Trophy" />
                </div>
              )}
            </div>

            {/* Challenge Form */}
            <form className={styles.challengeForm}>
              {/* Challenge Title */}
              <div className={styles.formGroup}>
                <label>
                  Challenge Title <span className={styles.required}>*</span>
                </label>
                <Input
                  placeholder="Enter challenge title"
                  value={challengeTitle}
                  onChange={(e) => setChallengeTitle(e.target.value)}
                />
                {errors.title && (
                  <div className={styles.errorText}>{errors.title}</div>
                )}
              </div>

              {/* Challenge Description */}
              <div className={styles.formGroup}>
                <label>
                  Challenge Description{" "}
                  <span className={styles.required}>*</span>
                </label>
                <TextArea
                  placeholder="Describe your challenge"
                  value={challengeDescription}
                  onChange={(e) => setChallengeDescription(e.target.value)}
                  rows={4}
                />
                {errors.description && (
                  <div className={styles.errorText}>{errors.description}</div>
                )}
              </div>

              {/* Duration Selection */}
              <div className={styles.formGroup}>
                <label>
                  Challenge Duration <span className={styles.required}>*</span>
                </label>
                <Select
                  value={duration}
                  onChange={handleDurationChange}
                  style={{ width: "100%" }}
                >
                  <Option value={7}>7 Days (Weekly Challenge)</Option>
                  <Option value={30}>30 Days (Monthly Challenge)</Option>
                  <Option value={100}>100 Days (Century Challenge)</Option>
                  <Option value="custom">Custom Duration</Option>
                </Select>
                {errors.duration && (
                  <div className={styles.errorText}>{errors.duration}</div>
                )}

                {duration === "custom" && (
                  <div style={{ marginTop: "10px" }}>
                    <Input
                      type="number"
                      placeholder="Enter custom duration (days)"
                      value={customDuration}
                      onChange={(e) =>
                        handleCustomDurationChange(
                          parseInt(e.target.value) || null
                        )
                      }
                      min={1}
                      max={365}
                    />
                    {errors.customDuration && (
                      <div className={styles.errorText}>
                        {errors.customDuration}
                      </div>
                    )}
                  </div>
                )}

                <div
                  style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}
                >
                  Selected duration: {customDuration || duration} days
                  {dailyTasks.length > 0 && (
                    <span> | Current tasks: {dailyTasks.length}</span>
                  )}
                </div>
              </div>

              {/* Start Date */}
              <div className={styles.formGroup}>
                <label>
                  Start Date <span className={styles.required}>*</span>
                </label>
                <input
                  type="datetime-local"
                  value={startDateTime ? startDateTime.format('YYYY-MM-DDTHH:mm') : ''}
                  onChange={(e) => {
                    const newDate = e.target.value ? moment(e.target.value) : null;
                    handleStartDateChange(newDate);
                  }}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #d9d9d9" }}
                  className={styles.nativeDateInput}
                />
                {errors.startDate && (
                  <div className={styles.errorText}>{errors.startDate}</div>
                )}
              </div>

              {/* End Date */}
              <div className={styles.formGroup}>
                <label>
                  End Date <span className={styles.required}>*</span>
                </label>
                <input
                  type="datetime-local"
                  value={endDateTime ? endDateTime.format('YYYY-MM-DDTHH:mm') : ''}
                  onChange={(e) => {
                    const newDate = e.target.value ? moment(e.target.value) : null;
                    setEndDateTime(newDate);
                  }}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #d9d9d9" }}
                  className={styles.nativeDateInput}
                />
                {errors.endDate && (
                  <div className={styles.errorText}>{errors.endDate}</div>
                )}
              </div>

              {/* Challenge Settings */}
              {/* <div className={styles.formGroup}>
                <label>Settings</label>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div className={styles.switchContainer}>
                    <span>Allow late submissions</span>
                    <Switch
                      checked={settings.allowLateSubmissions}
                      onChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          allowLateSubmissions: checked,
                        }))
                      }
                    />
                  </div>
                  <div className={styles.switchContainer}>
                    <span>Auto-approve submissions</span>
                    <Switch
                      checked={settings.autoApproveSubmissions}
                      onChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          autoApproveSubmissions: checked,
                        }))
                      }
                    />
                  </div>
                  <div className={styles.switchContainer}>
                    <span>Require approval for rewards</span>
                    <Switch
                      checked={settings.requireApprovalForRewards}
                      onChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          requireApprovalForRewards: checked,
                        }))
                      }
                    />
                  </div>
                </Space>
              </div> */}
            </form>
          </TabPane>

          <TabPane tab="Daily Tasks" key="2">
            <div className={styles.checkpointsContainer}>
              <div className={styles.sectionHeader}>
                <div className={styles.checkPointHead}>Daily Tasks</div>
                <div className={styles.checkPointContent}>
                  Configure daily tasks for participants. Each day should have a
                  clear task and submission requirement.
                </div>
              </div>

              {/* Duration and task count validation alerts */}
              {errors.dailyTasksCount && (
                <Alert
                  message="Task Count Mismatch"
                  description={errors.dailyTasksCount}
                  type="warning"
                  showIcon
                  style={{ marginBottom: "15px" }}
                />
              )}

              {errors.dateRange && (
                <Alert
                  message="Date Range Issue"
                  description={errors.dateRange}
                  type="error"
                  showIcon
                  style={{ marginBottom: "15px" }}
                />
              )}

              {/* Quick actions for tasks */}
              <div className={styles.quickActionsContainer}>
                <Button
                  type="default"
                  onClick={resetDailyTasksForDuration}
                  size="small"
                  className={styles.actionButton}
                >
                  Reset to Default Tasks
                </Button>

                {dailyTasks.length > 0 && (
                  <Button
                    type="default"
                    onClick={() => applySameTaskToAllDays(0)}
                    size="small"
                    className={styles.actionButton}
                  >
                    Apply Day 1 Task to All Days
                  </Button>
                )}
              </div>

              <div className={styles.checkpointsList}>
                {dailyTasks.map((task, index) => (
                  <Card
                    key={index}
                    title={`Day ${task.day}`}
                    size="small"
                    extra={
                      <div className={styles.taskCardActions}>
                        <Button
                          type="text"
                          size="small"
                          onClick={() => duplicateTask(index)}
                          title="Duplicate this task"
                          className={styles.taskActionButton}
                        >
                          Duplicate
                        </Button>
                        <Button
                          type="text"
                          size="small"
                          onClick={() => applySameTaskToAllDays(index)}
                          title="Apply this task to all days"
                          className={styles.taskActionButton}
                        >
                          Apply to All
                        </Button>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeDailyTask(index)}
                          className={styles.taskDeleteButton}
                        />
                      </div>
                    }
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div className={styles.taskFormGroup}>
                        <label className={styles.taskLabel}>Task Title</label>
                        <Input
                          placeholder="Enter task title"
                          value={task.title}
                          onChange={(e) =>
                            updateDailyTask(index, "title", e.target.value)
                          }
                          className={styles.taskInput}
                        />
                        {errors.dailyTasks?.[index]?.title && (
                          <div className={styles.errorText}>
                            {errors.dailyTasks[index].title}
                          </div>
                        )}
                      </div>

                      <div className={styles.taskFormGroup}>
                        <label className={styles.taskLabel}>
                          Task Description
                        </label>
                        <TextArea
                          placeholder="Describe what participants need to do"
                          value={task.description}
                          onChange={(e) =>
                            updateDailyTask(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          rows={2}
                          className={styles.taskTextarea}
                        />
                        {errors.dailyTasks?.[index]?.description && (
                          <div className={styles.errorText}>
                            {errors.dailyTasks[index].description}
                          </div>
                        )}
                      </div>

                      <div className={styles.taskFormGroup}>
                        <label className={styles.taskLabel}>
                          Submission Type
                        </label>
                        <Select
                          value={task.submissionType}
                          onChange={(value) =>
                            updateDailyTask(index, "submissionType", value)
                          }
                          style={{ width: "100%" }}
                          className={styles.taskSelect}
                        >
                          <Option value="text">Text Submission</Option>
                          <Option value="image">Image Submission</Option>
                        </Select>
                      </div>

                      <div className={styles.taskFormGroup}>
                        <label className={styles.taskLabel}>
                          Submission Prompt
                        </label>
                        <Input
                          placeholder="What should participants share?"
                          value={task.submissionPrompt}
                          onChange={(e) =>
                            updateDailyTask(
                              index,
                              "submissionPrompt",
                              e.target.value
                            )
                          }
                          className={styles.taskInput}
                        />
                        {errors.dailyTasks?.[index]?.submissionPrompt && (
                          <div className={styles.errorText}>
                            {errors.dailyTasks[index].submissionPrompt}
                          </div>
                        )}
                      </div>
                    </Space>
                  </Card>
                ))}
              </div>

              <Button
                type="dashed"
                onClick={addDailyTask}
                icon={<PlusOutlined />}
                className={styles.addButton}
              >
                Add Daily Task
              </Button>
            </div>
          </TabPane>

          <TabPane tab="Rewards" key="3">
            <div className={styles.rewardsContainer}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Checkpoint Rewards</h3>
                <p className={styles.sectionDescription}>
                  Set up rewards for specific milestones in your challenge
                </p>
              </div>

              <div className={styles.rewardsList}>
                {checkpointRewards.map((reward, index) => (
                  <Card
                    key={index}
                    title={`Checkpoint Day ${reward.checkpointDay}`}
                    size="small"
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeCheckpointReward(index)}
                        className={styles.rewardDeleteButton}
                      />
                    }
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div className={styles.rewardFormGroup}>
                        <label className={styles.rewardLabel}>
                          Checkpoint Day
                        </label>
                        <Input
                          type="number"
                          placeholder="Day number"
                          value={reward.checkpointDay}
                          onChange={(e) =>
                            updateCheckpointReward(
                              index,
                              "checkpointDay",
                              parseInt(e.target.value)
                            )
                          }
                          min={1}
                          className={styles.rewardInput}
                        />
                        {errors.checkpointRewards?.[index]?.checkpointDay && (
                          <div className={styles.errorText}>
                            {errors.checkpointRewards[index].checkpointDay}
                          </div>
                        )}
                      </div>

                      <div className={styles.rewardFormGroup}>
                        <label className={styles.rewardLabel}>
                          Reward Type
                        </label>
                        <Select
                          value={reward.rewardType}
                          onChange={(value) =>
                            updateCheckpointReward(index, "rewardType", value)
                          }
                          style={{ width: "100%" }}
                          className={styles.rewardSelect}
                        >
                          <Option value="badge">Badge</Option>
                          <Option value="points">Points</Option>
                          <Option value="certificate">Certificate</Option>
                          <Option value="custom">Custom</Option>
                        </Select>
                      </div>

                      <div className={styles.rewardFormGroup}>
                        <label className={styles.rewardLabel}>
                          Reward Value
                        </label>
                        <Input
                          placeholder="e.g., 'Week 1 Champion', '100 points'"
                          value={reward.rewardValue}
                          onChange={(e) =>
                            updateCheckpointReward(
                              index,
                              "rewardValue",
                              e.target.value
                            )
                          }
                          className={styles.rewardInput}
                        />
                        {errors.checkpointRewards?.[index]?.rewardValue && (
                          <div className={styles.errorText}>
                            {errors.checkpointRewards[index].rewardValue}
                          </div>
                        )}
                      </div>

                      <div className={styles.rewardFormGroup}>
                        <label className={styles.rewardLabel}>
                          Reward Description
                        </label>
                        <TextArea
                          placeholder="Describe this reward"
                          value={reward.rewardDescription}
                          onChange={(e) =>
                            updateCheckpointReward(
                              index,
                              "rewardDescription",
                              e.target.value
                            )
                          }
                          rows={2}
                          className={styles.rewardTextarea}
                        />
                        {errors.checkpointRewards?.[index]
                          ?.rewardDescription && (
                            <div className={styles.errorText}>
                              {errors.checkpointRewards[index].rewardDescription}
                            </div>
                          )}
                      </div>
                    </Space>
                  </Card>
                ))}
              </div>

              <Button
                type="dashed"
                onClick={addCheckpointReward}
                icon={<PlusOutlined />}
                className={styles.addButton}
              >
                Add Checkpoint Reward
              </Button>
            </div>
          </TabPane>
        </Tabs>

        {/* Error Summary */}
        {formSubmitted && Object.keys(errors).length > 0 && (
          <div className={styles.errorSummary}>
            <Alert
              message="Please fix the following errors:"
              description={
                <ul>
                  {Object.values(errors)
                    .flat()
                    .map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                </ul>
              }
              type="error"
              showIcon
            />
          </div>
        )}

        {/* Form Actions */}
        <div className={styles.formActions}>
          <Button
            onClick={() => setIsPopupOpen(false)}
            style={{ marginRight: "10px" }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={submitHandler}
            loading={isLoading}
            className={styles.createButton}
          >
            Create Challenge
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateChallengeOverlay;
