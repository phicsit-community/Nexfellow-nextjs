"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Upload,
  Calendar,
  Target,
  Badge,
  Settings,
} from "lucide-react";
import api from "../../lib/axios";
import styles from "./QuizForm.module.css";
import BackButton from "../../components/BackButton/BackButton";
import { DatePicker } from "antd";

const QuizForm = () => {
  const router = useRouter();
  const params = useParams();
  const communityId = params?.communityId;
  const [quizData, setQuizData] = useState({
    title: "",
    category: "",
    description: "",
    startTime: null, // dayjs object
    endTime: null, // dayjs object
    timerMode: "full", // default timer mode
    duration: null,
    rules: [],
    misc: [],
  });

  const [newRule, setNewRule] = useState("");
  const [newField, setNewField] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // No need to check duration for "full" mode
    } else if (quizData.timerMode === "full") {
      if (!quizData.duration || isNaN(Number(quizData.duration))) {
        toast.error(
          "Duration per question (in minutes) is required for rapid mode."
        );
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTimerModeChange = (e) => {
    const { value } = e.target;
    setQuizData((prevData) => ({
      ...prevData,
      timerMode: value,
      duration: value === "full" ? prevData.duration : "", // Reset duration if switching to "full" mode
    }));
  };

  const handleDateChange = (field, value) => {
    setQuizData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleAddRule = () => {
    if (newRule.trim() !== "") {
      setQuizData((prevData) => ({
        ...prevData,
        rules: [...prevData.rules, newRule],
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
      updatedMisc[index].fieldValue = [...files];
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

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("title", quizData.title);
      formData.append("description", quizData.description);
      // Convert dayjs to ISO string if exists, else empty string
      formData.append(
        "startTime",
        quizData.startTime ? quizData.startTime.toISOString() : ""
      );
      formData.append(
        "endTime",
        quizData.endTime ? quizData.endTime.toISOString() : ""
      );
      formData.append("duration", quizData.duration);
      formData.append("category", quizData.category);
      formData.append("timerMode", quizData.timerMode);

      formData.append("rules", JSON.stringify(quizData.rules));

      quizData.misc.forEach((field, i) => {
        formData.append(`misc[${i}][fieldName]`, field.fieldName);
        field.fieldValue.forEach((file) => {
          formData.append(`misc[${i}][fieldValue]`, file);
        });
      });

      const response = await api.post(
        `/community/${communityId}/quizzes`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        router.push(`/create/contests/${communityId}`);
      } else {
        console.error("Error:", response.data.message);
      }
    } catch (error) {
      console.error("Error:", error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.createForm}>
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
        <h3 className={styles.title}>Create Contest</h3>
        <p className={styles.subtitle}>
          Set up a new contest for your community
        </p>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
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
                  className={styles.inputAntd}
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
                  className={styles.inputAntd}
                  style={{ width: "100%", height: "100%" }}
                  placeholder="Select end date & time"
                  border="none"
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
                <Target className={styles.sectionLogo} />
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
                <Upload className={styles.sectionLogo} />
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
                  {field.fieldValue.length > 0 && (
                    <div className={styles.filePreviewWrapper}>
                      {field.fieldValue.map((file, i) => (
                        <div key={i} className={styles.filePreview}>
                          {file.type.startsWith("image/") ? (
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
                              {file.name.split(".").pop().toUpperCase()}
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
              onClick={() => router.back()}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizForm;
