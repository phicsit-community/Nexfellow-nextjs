import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./EditQuizForm.module.css";
import BackButton from "../../components/BackButton/BackButton";
import {
  Plus,
  Trash2,
  Calendar,
  Settings,
  BookOpen,
  FileText,
} from "lucide-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { toast } from "sonner";

// FormSkeleton component for loading state
const FormSkeleton = () => (
  <div className={styles.form}>
    {/* Title field skeleton */}
    <div className={styles.skeletonField}>
      <div className={`${styles.skeletonLabel} ${styles.shimmer}`}></div>
      <div className={`${styles.skeletonInput} ${styles.shimmer}`}></div>
    </div>

    {/* Category field skeleton */}
    <div className={styles.skeletonField}>
      <div className={`${styles.skeletonLabel} ${styles.shimmer}`}></div>
      <div className={`${styles.skeletonInput} ${styles.shimmer}`}></div>
    </div>

    {/* Description field skeleton */}
    <div className={styles.skeletonField}>
      <div className={`${styles.skeletonLabel} ${styles.shimmer}`}></div>
      <div className={`${styles.skeletonTextarea} ${styles.shimmer}`}></div>
    </div>

    {/* Date fields skeleton */}
    <div className={styles.skeletonField}>
      <div className={`${styles.skeletonLabel} ${styles.shimmer}`}></div>
      <div className={styles.skeletonRow}>
        <div className={`${styles.skeletonDateInput} ${styles.shimmer}`}></div>
        <div className={`${styles.skeletonDateInput} ${styles.shimmer}`}></div>
      </div>
    </div>

    {/* Timer mode skeleton */}
    <div className={styles.skeletonField}>
      <div className={`${styles.skeletonLabel} ${styles.shimmer}`}></div>
      <div className={`${styles.skeletonInput} ${styles.shimmer}`}></div>
    </div>

    {/* Rules section skeleton */}
    <div className={styles.skeletonSection}>
      <div className={`${styles.skeletonSectionTitle} ${styles.shimmer}`}></div>
      {[1, 2, 3].map((_, i) => (
        <div
          key={i}
          className={`${styles.skeletonRule} ${styles.shimmer}`}
        ></div>
      ))}
    </div>

    {/* Submit button skeleton */}
    <div className={styles.actionButtons}>
      <div className={`${styles.skeletonSubmitButton} ${styles.shimmer}`}></div>
    </div>
  </div>
);

const EditQuizForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const communityId = location.state?.communityId;
  const navigate = useNavigate();
  const quizId = id;
  const [newField, setNewField] = useState("");
  const [quizData, setQuizData] = useState({
    title: "",
    category: "",
    description: "",
    startTime: null, // dayjs object
    endTime: null, // dayjs object
    timerMode: "full", // default timer mode
    duration: "",
    rules: [],
    misc: [],
  });
  const [newRule, setNewRule] = useState("");
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState("");

  // Fetch quiz data on mount
  useEffect(() => {
    const fetchQuizData = async () => {
      setLoading(true); // Show skeleton loading UI
      try {
        const response = await axios.get(`/community/quizzes/${quizId}`);
        const data = response.data.quiz;
        setQuizData({
          title: data.title || "",
          category: data.category || "",
          description: data.description || "",
          startTime: data.startTime ? dayjs(data.startTime) : null,
          endTime: data.endTime ? dayjs(data.endTime) : null,
          timerMode: data.timerMode || "full", // default timer mode
          duration:
            data.duration !== undefined && data.duration !== null
              ? String(data.duration)
              : "",
          rules: Array.isArray(data.rules)
            ? data.rules
            : typeof data.rules === "string"
              ? JSON.parse(data.rules)
              : [],
          misc: Array.isArray(data.misc) ? data.misc : [],
        });
      } catch (error) {
        setError("Failed to fetch quiz data.");
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [communityId, quizId]);
  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Timer mode change handler
  const handleTimerModeChange = (e) => {
    const { value } = e.target;
    setQuizData((prevData) => ({
      ...prevData,
      timerMode: value,
      duration: value === "full" ? prevData.duration : "", // Reset duration if switching to "full" mode
    }));
  };

  // Date change handler
  const handleDateChange = (field, value) => {
    setQuizData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Rule management
  const handleAddRule = () => {
    if (newRule.trim()) {
      setQuizData((prevData) => ({
        ...prevData,
        rules: [...prevData.rules, newRule.trim()],
      }));
      setNewRule("");
    }
  };

  const handleDeleteRule = (index) => {
    setQuizData((prevData) => ({
      ...prevData,
      rules: prevData.rules.filter((_, i) => i !== index),
    }));
  };

  // Custom field management
  const handleAddField = () => {
    if (newField.trim() !== "") {
      setQuizData((prevData) => ({
        ...prevData,
        misc: [...prevData.misc, { fieldName: newField, fieldValue: [] }],
      }));
      setNewField("");
    }
  };

  const handleMiscChange = (index, files) => {
    setQuizData((prevData) => {
      const updatedMisc = [...prevData.misc];
      // Keep only existing URLs (strings)
      const existingUrls = (updatedMisc[index].fieldValue || []).filter(
        (item) => typeof item === "string"
      );
      updatedMisc[index].fieldValue = [...existingUrls, ...Array.from(files)];
      return { ...prevData, misc: updatedMisc };
    });
  };

  const deleteMiscValue = (index, fileIndex) => {
    setQuizData((prevData) => {
      const updatedMisc = [...prevData.misc];
      updatedMisc[index].fieldValue.splice(fileIndex, 1);
      return { ...prevData, misc: updatedMisc };
    });
  };
  const validateForm = () => {
    if (!quizData.title.trim()) {
      toast.error("Contest title is required.");
      return false;
    }
    if (!quizData.category.trim()) {
      toast.error("Category is required.");
      return false;
    }
    if (!quizData.description.trim()) {
      toast.error("Description is required.");
      return false;
    }
    if (!quizData.startTime) {
      toast.error("Start date & time is required.");
      return false;
    }
    if (!quizData.endTime) {
      toast.error("End date & time is required.");
      return false;
    }
    if (quizData.timerMode === "rapid") {
      // No need to check duration for "rapid" mode
    } else if (quizData.timerMode === "full") {
      if (!quizData.duration || isNaN(Number(quizData.duration))) {
        toast.error("Duration (in minutes) is required for full timer mode.");
        return false;
      }
    }
    if (
      quizData.startTime &&
      quizData.endTime &&
      quizData.endTime.isBefore(quizData.startTime)
    ) {
      toast.error("End date & time must be after start date & time.");
      return false;
    }
    return true;
  };

  // Form submission (with files + misc fields)
  const handleSubmit = async (e) => {
    console.log("handleSubmit called");
    e.preventDefault();
    if (!validateForm()) return;

    // Show loading state on the submit button
    setLoading(true); // Start loading animation
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", quizData.title);
      formData.append("category", quizData.category);
      formData.append("description", quizData.description);
      formData.append(
        "startTime",
        quizData.startTime ? quizData.startTime.toISOString() : ""
      );
      formData.append(
        "endTime",
        quizData.endTime ? quizData.endTime.toISOString() : ""
      );
      formData.append("timerMode", quizData.timerMode);
      formData.append("duration", Number(quizData.duration));
      formData.append("rules", JSON.stringify(quizData.rules));
      quizData.misc.forEach((field, index) => {
        formData.append(`misc[${index}][fieldName]`, field.fieldName);
        if (field.fieldValue) {
          field.fieldValue.forEach((value, fileIndex) => {
            if (value instanceof File) {
              formData.append(`misc[${index}][fieldValue]`, value, value.name);
            } else {
              // Preserve existing URLs
              formData.append(
                `misc[${index}][fieldValue][${fileIndex}]`,
                value
              );
            }
          });
        }
      });

      await axios.put(`/community/quizzes/${quizId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Contest updated successfully!");
      navigate(`/contest/${quizId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update contest");
    } finally {
      setLoading(false);
    }
  };

  // Show skeleton loader when data is loading
  if (loading) {
    return (
      <div className={styles.container}>
        <div
          className="border rounded-lg hover:bg-accent text-sm w-fit"
          style={{ padding: "3px 10px" }}
        >
          <BackButton
            onClick={() => navigate(-1)}
            showText={true}
            smallText={true}
          />
        </div>
        <div className={styles.createForm}>
          <h1 className={styles.title}>Edit Contest</h1>
          <p className={styles.subtitle}>Update your contest details</p>
          <FormSkeleton />
        </div>
      </div>
    );
  }
  if (error) return <p className={styles.error}>{error}</p>;
  return (
    <div className={styles.container}>
      <div
        className="border rounded-lg hover:bg-accent text-sm w-fit"
        style={{ padding: "3px 10px" }}
      >
        <BackButton
          onClick={() => navigate(-1)}
          showText={true}
          smallText={true}
        />
      </div>
      <div className={styles.createForm}>
        <h1 className={styles.title}>Edit Contest</h1>
        <p className={styles.subtitle}>
          Update this contest for your community
        </p>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
        >
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <div className={styles.sectionLogoWrapper}>
                <Settings className={styles.sectionLogo} />
              </div>
              Basic Information
            </h3>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="title">
                  Contest Title <span className={styles.required}>*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  placeholder="Enter contest title"
                  value={quizData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="category">
                  Category <span className={styles.required}>*</span>
                </label>
                <input
                  id="category"
                  name="category"
                  placeholder="Enter category"
                  value={quizData.category}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="description">
                Description <span className={styles.required}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter contest description"
                value={quizData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <div className={styles.sectionLogoWrapper}>
                <Calendar className={styles.sectionLogo} />
              </div>
              Schedule & Timing
            </h3>
            <div className={styles.dateRow}>
              <div className={styles.field}>
                <label htmlFor="startDate">
                  Start Date & Time <span className={styles.required}>*</span>
                </label>
                <DatePicker
                  id="startDate"
                  showTime
                  value={quizData.startTime}
                  onChange={(value) => handleDateChange("startTime", value)}
                  format="YYYY-MM-DD HH:mm"
                  className={styles.input}
                  style={{ width: "100%", height: "100%" }}
                  placeholder="Select start date & time"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="endDate">
                  End Date & Time <span className={styles.required}>*</span>
                </label>
                <DatePicker
                  id="endDate"
                  showTime
                  value={quizData.endTime}
                  onChange={(value) => handleDateChange("endTime", value)}
                  format="YYYY-MM-DD HH:mm"
                  className={styles.input}
                  style={{ width: "100%", height: "100%" }}
                  placeholder="Select end date & time"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="timerMode">
                  Timer Mode <span className={styles.required}>*</span>
                </label>
                <select
                  id="timerMode"
                  name="timerMode"
                  value={quizData.timerMode}
                  onChange={handleTimerModeChange}
                  className={styles.input}
                >
                  <option value="full">Full Contest Timer</option>
                  <option value="rapid">Per Question Timer</option>
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="duration">
                  Duration (min) <span className={styles.required}>*</span>
                </label>
                <input
                  id="duration"
                  name="duration"
                  type="number"
                  value={quizData.duration}
                  onChange={handleInputChange}
                  placeholder="Enter duration in minutes"
                  disabled={quizData.timerMode !== "full"}
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <div className={styles.sectionLogoWrapper}>
                <BookOpen className={styles.sectionLogo} />
              </div>
              Rules and Regulations
            </h3>
            <div className={styles.field}>
              <label htmlFor="rule">Add Rules</label>
              <div className={styles.addItemWrapper}>
                <input
                  id="rule"
                  type="text"
                  placeholder="Enter rule"
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddRule()}
                />
                <button type="button" onClick={handleAddRule}>
                  <Plus size={18} />
                </button>
              </div>
              {quizData.rules.length > 0 && (
                <ul className={styles.rulesList}>
                  {quizData.rules.map((rule, index) => (
                    <li key={index}>
                      <span>{rule}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <div className={styles.sectionLogoWrapper}>
                <FileText className={styles.sectionLogo} />
              </div>
              Custom Fields
            </h3>
            <div className={styles.field}>
              <label htmlFor="customField">Add Custom Field</label>
              <div className={styles.addItemWrapper}>
                <input
                  id="customField"
                  placeholder="Enter field name"
                  value={newField}
                  onChange={(e) => setNewField(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddField()}
                />
                <button type="button" onClick={handleAddField}>
                  <Plus size={18} />
                </button>
              </div>

              {quizData.misc.map((field, index) => (
                <div key={index} className={styles.customField}>
                  <label>{field.fieldName}</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf,.doc,.docx"
                    onChange={(e) => handleMiscChange(index, e.target.files)}
                  />
                  {field.fieldValue && field.fieldValue.length > 0 && (
                    <div className={styles.filePreviewWrapper}>
                      {field.fieldValue.map((file, i) => (
                        <div key={i} className={styles.filePreview}>
                          {typeof file === "string" ? (
                            <img src={file} alt="existing" />
                          ) : file.type && file.type.startsWith("image/") ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt="preview"
                            />
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                background: "#f1f5f9",
                                color: "#64748b",
                                fontSize: "0.75rem",
                                textAlign: "center",
                                padding: "0.25rem",
                              }}
                            >
                              {typeof file === "string"
                                ? "FILE"
                                : file.name.split(".").pop().toUpperCase()}
                            </div>
                          )}
                          <button onClick={() => deleteMiscValue(index, i)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <span className={styles.loadingSpinner}></span>
                  Updating...
                </>
              ) : (
                "Update Contest"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuizForm;
