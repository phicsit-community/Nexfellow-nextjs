import { useState, useEffect, useCallback } from "react";
import styles from "./EditQuestion.module.css";
import {
  IoMdClose,
  IoMdAdd,
  IoMdRemove,
  IoMdCheckmark,
  IoMdAlert,
} from "react-icons/io";
import axios from "axios";

const EditQuestion = ({
  setEditQuestion,
  quizId,
  questionData: initialData,
  quizData,
  fetchAllQuestions,
}) => {
  // Prepare initial state based on the question to edit
  const [questionData, setQuestionData] = useState({
    quizId: quizId,
    text: "",
    type: "radio",
    options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
    correctOption: "",
    timeLimit: null,
    ...initialData,
  });

  // For radio/checkbox, set number of options based on data
  const [noOfInputs, setNoOfInputs] = useState(
    initialData?.options?.length || 4
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Initialize correct option as array for checkbox type
  useEffect(() => {
    if (
      questionData.type === "checkbox" &&
      !Array.isArray(questionData.correctOption)
    ) {
      setQuestionData((prev) => ({
        ...prev,
        correctOption: [],
      }));
    } else if (
      questionData.type === "radio" &&
      Array.isArray(questionData.correctOption)
    ) {
      setQuestionData((prev) => ({
        ...prev,
        correctOption: "",
      }));
    }
  }, [questionData.type, questionData.correctOption]);

  useEffect(() => {
    if (initialData) {
      setQuestionData({
        quizId,
        text: initialData.text || "",
        type: initialData.type || "radio",
        options:
          initialData.options && initialData.options.length > 0
            ? initialData.options
            : [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
        correctOption: initialData.correctOption || "",
        timeLimit: initialData.timeLimit || null,
      });
      setNoOfInputs(initialData.options?.length || 4);
    }
  }, [initialData, quizId]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!questionData.text.trim()) {
      newErrors.text = "Question text is required";
    }

    if (questionData.options.some((option) => !option.text.trim())) {
      newErrors.options = "All options must be filled";
    }

    if (questionData.type === "radio" && !questionData.correctOption) {
      newErrors.correctOption = "Please select a correct answer";
    }

    if (
      questionData.type === "checkbox" &&
      (!questionData.correctOption || questionData.correctOption.length === 0)
    ) {
      newErrors.correctOption = "Please select at least one correct answer";
    }

    if (
      quizData?.timerMode === "rapid" &&
      (!questionData.timeLimit || questionData.timeLimit <= 0)
    ) {
      newErrors.timeLimit = "Please enter a valid time limit";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [questionData, quizData?.timerMode]);

  const handleInputChange = useCallback(
    (name, value) => {
      setQuestionData((prevData) => {
        if (name.startsWith("options")) {
          const optionIndex = Number(name.replace("options", ""));
          const updatedOptions = [...prevData.options];

          // Ensure we have enough options
          while (updatedOptions.length <= optionIndex) {
            updatedOptions.push({ text: "" });
          }

          updatedOptions[optionIndex] = { text: value };

          return {
            ...prevData,
            options: updatedOptions,
          };
        }

        return {
          ...prevData,
          [name]: value,
        };
      });

      // Clear related errors when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  const handleAddOption = useCallback(() => {
    if (noOfInputs < 10) {
      // Maximum 10 options
      setNoOfInputs((prev) => prev + 1);
      setQuestionData((prev) => ({
        ...prev,
        options: [...prev.options, { text: "" }],
      }));
    }
  }, [noOfInputs]);

  const handleRemoveOption = useCallback(() => {
    if (noOfInputs > 2) {
      // Minimum 2 options
      setNoOfInputs((prev) => prev - 1);
      setQuestionData((prev) => ({
        ...prev,
        options: prev.options.slice(0, -1),
        correctOption:
          prev.type === "radio"
            ? prev.options[prev.options.length - 1]?.text === prev.correctOption
              ? ""
              : prev.correctOption
            : Array.isArray(prev.correctOption)
              ? prev.correctOption.filter(
                (opt) => opt !== prev.options[prev.options.length - 1]?.text
              )
              : prev.correctOption,
      }));
    }
  }, [noOfInputs]);

  const handleCheckboxChange = useCallback(
    (optionValue, isChecked) => {
      setQuestionData((prev) => {
        let updatedCorrectOptions = Array.isArray(prev.correctOption)
          ? [...prev.correctOption]
          : [];

        if (isChecked) {
          if (!updatedCorrectOptions.includes(optionValue)) {
            updatedCorrectOptions.push(optionValue);
          }
        } else {
          updatedCorrectOptions = updatedCorrectOptions.filter(
            (option) => option !== optionValue
          );
        }

        return {
          ...prev,
          correctOption: updatedCorrectOptions,
        };
      });

      // Clear correctOption error when user makes a selection
      if (errors.correctOption) {
        setErrors((prev) => ({ ...prev, correctOption: undefined }));
      }
    },
    [errors.correctOption]
  );

  const handleRadioChange = useCallback(
    (optionValue) => {
      setQuestionData((prev) => ({
        ...prev,
        correctOption: optionValue,
      }));

      // Clear correctOption error when user makes a selection
      if (errors.correctOption) {
        setErrors((prev) => ({ ...prev, correctOption: undefined }));
      }
    },
    [errors.correctOption]
  );

  const handleUpdateQuestion = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const formattedQuestionData = {
        ...questionData,
        correctOption:
          questionData.type === "checkbox"
            ? Array.isArray(questionData.correctOption)
              ? questionData.correctOption
              : [questionData.correctOption]
            : questionData.correctOption,
      };

      await axios.put(
        `/community/questions/${initialData._id}`,
        formattedQuestionData,
        { withCredentials: true }
      );

      setSuccessMessage("Question updated successfully!");
      if (typeof fetchAllQuestions === "function") {
        await fetchAllQuestions();
      }
      setTimeout(() => {
        setEditQuestion(false);
        setSuccessMessage("");
      }, 1000);
    } catch (error) {
      setErrors({
        submit:
          error.response?.data?.message ||
          "Failed to update question. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.container2}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.heading}>Edit Question</h2>
            <p className={styles.subheading}>Update your question details</p>
          </div>
          <button
            className={styles.close}
            onClick={() => setEditQuestion(false)}
            aria-label="Close dialog"
          >
            <IoMdClose />
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className={styles.successMessage}>
            <IoMdCheckmark />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className={styles.errorMessage}>
            <IoMdAlert />
            <span>{errors.submit}</span>
          </div>
        )}

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          {/* Question Text */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Question Text <span className={styles.required}>*</span>
            </label>
            <textarea
              className={`${styles.textarea} ${errors.text ? styles.error : ""
                }`}
              onChange={(e) => handleInputChange("text", e.target.value)}
              value={questionData.text}
              placeholder="Enter your question here..."
              rows={4}
            />
            {errors.text && (
              <span className={styles.errorText}>{errors.text}</span>
            )}
          </div>

          {/* Question Type */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Question Type <span className={styles.required}>*</span>
            </label>
            <select
              className={styles.select}
              value={questionData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
            >
              <option value="radio">Single Choice (One correct answer)</option>
              <option value="checkbox">
                Multiple Choice (Multiple correct answers)
              </option>
              <option value="text">Text Answer</option>
            </select>
          </div>

          {/* Time Limit for Rapid Mode */}
          {quizData?.timerMode === "rapid" && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Time Limit (seconds) <span className={styles.required}>*</span>
              </label>
              <input
                className={`${styles.input} ${errors.timeLimit ? styles.error : ""
                  }`}
                type="number"
                min="5"
                max="300"
                placeholder="e.g., 30"
                onChange={(e) =>
                  handleInputChange("timeLimit", parseInt(e.target.value))
                }
                value={questionData.timeLimit || ""}
              />
              {errors.timeLimit && (
                <span className={styles.errorText}>{errors.timeLimit}</span>
              )}
            </div>
          )}

          {/* Options Section for Radio/Checkbox */}
          {(questionData.type === "radio" ||
            questionData.type === "checkbox") && (
              <div className={styles.formGroup}>
                <div className={styles.optionsHeader}>
                  <label className={styles.label}>
                    Answer Options <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.optionControls}>
                    <span className={styles.optionCount}>
                      {noOfInputs} option{noOfInputs !== 1 ? "s" : ""}
                    </span>
                    <button
                      type="button"
                      className={styles.optionButton}
                      onClick={handleRemoveOption}
                      disabled={noOfInputs <= 2}
                      aria-label="Remove option"
                    >
                      <IoMdRemove />
                    </button>
                    <button
                      type="button"
                      className={styles.optionButton}
                      onClick={handleAddOption}
                      disabled={noOfInputs >= 10}
                      aria-label="Add option"
                    >
                      <IoMdAdd />
                    </button>
                  </div>
                </div>

                {errors.options && (
                  <span className={styles.errorText}>{errors.options}</span>
                )}
                {errors.correctOption && (
                  <span className={styles.errorText}>{errors.correctOption}</span>
                )}

                <div className={styles.optionsContainer}>
                  {Array.from({ length: noOfInputs }).map((_, index) => (
                    <div key={index} className={styles.optionItem}>
                      <div className={styles.optionNumber}>{index + 1}</div>
                      <input
                        className={styles.optionInput}
                        type="text"
                        placeholder={`Enter option ${index + 1}`}
                        onChange={(e) =>
                          handleInputChange(`options${index}`, e.target.value)
                        }
                        value={questionData.options[index]?.text || ""}
                      />

                      {questionData.type === "radio" ? (
                        <div className={styles.correctMarker}>
                          <input
                            className={styles.radio}
                            type="radio"
                            name="correctOption"
                            value={questionData.options[index]?.text || ""}
                            onChange={() =>
                              handleRadioChange(questionData.options[index]?.text)
                            }
                            checked={
                              questionData.correctOption ===
                              questionData.options[index]?.text
                            }
                            disabled={!questionData.options[index]?.text?.trim()}
                            id={`correct-${index}`}
                          />
                          <label
                            htmlFor={`correct-${index}`}
                            className={styles.correctLabel}
                          >
                            Correct
                          </label>
                        </div>
                      ) : (
                        <div className={styles.correctMarker}>
                          <input
                            className={styles.checkbox}
                            type="checkbox"
                            onChange={(e) =>
                              handleCheckboxChange(
                                questionData.options[index]?.text,
                                e.target.checked
                              )
                            }
                            checked={
                              Array.isArray(questionData.correctOption) &&
                              questionData.correctOption.includes(
                                questionData.options[index]?.text
                              )
                            }
                            disabled={!questionData.options[index]?.text?.trim()}
                            id={`correct-checkbox-${index}`}
                          />
                          <label
                            htmlFor={`correct-checkbox-${index}`}
                            className={styles.correctLabel}
                          >
                            Correct
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Text Answer */}
          {questionData.type === "text" && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Correct Answer <span className={styles.required}>*</span>
              </label>
              <input
                className={`${styles.input} ${errors.correctOption ? styles.error : ""
                  }`}
                type="text"
                placeholder="Enter the correct answer"
                onChange={(e) =>
                  handleInputChange("correctOption", e.target.value)
                }
                value={questionData.correctOption || ""}
              />
              {errors.correctOption && (
                <span className={styles.errorText}>{errors.correctOption}</span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setEditQuestion(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`${styles.saveButton} ${isLoading ? styles.loading : ""
                }`}
              onClick={handleUpdateQuestion}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner}></div>
                  Updating...
                </>
              ) : (
                <>
                  <IoMdCheckmark />
                  Update Question
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuestion;
