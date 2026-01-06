import { useState } from "react";
import api from "../../lib/axios";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

// styles
import styles from "./Question.module.css";

// modals
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import EditQuestion from "../EditQuestion/EditQuestion";

const Question = ({ question, quizId, onDeleted, fetchAllQuestions }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  // Delete handler
  const handleDelete = async () => {
    try {
      await api.delete(`/community/questions/${question._id}`);
      toast.success("Question deleted successfully.");
      if (onDeleted) onDeleted(question._id);
      if (typeof fetchAllQuestions === "function") {
        await fetchAllQuestions();
      }
      setShowConfirmation(false);
    } catch (error) {
      toast.error("Failed to delete question.");
      setError(error);
      setShowConfirmation(false);
    }
  };

  // Determine difficulty class
  const getDifficultyClass = () => {
    const difficulty = question.difficulty?.toLowerCase() || "";
    if (difficulty === "easy") return styles.easy;
    if (difficulty === "medium") return styles.medium;
    if (difficulty === "hard") return styles.hard;
    return "";
  };

  // Check if option is correct answer
  const isCorrectAnswer = (option) => {
    // Handle different correct answer formats
    if (question.correctAnswer) {
      // Single correct answer by ID
      return question.correctAnswer === option._id;
    } else if (
      question.correctOption &&
      Array.isArray(question.correctOption)
    ) {
      // Multiple correct answers (for checkbox type) by text
      return question.correctOption.includes(option.text);
    }
    return false;
  };

  return (
    <div className={styles.quizContainer}>
      <div className={styles.questionHeader}>
        <div className={styles.questionMeta}>
          <div className={styles.questionNumber}>Q{question.index || 1}</div>
          {/* <div className={`${styles.difficultyBadge} ${getDifficultyClass()}`}>
            {question.difficulty || "Medium"}
          </div> */}
          {question.type === "checkbox" && (
            <div className={styles.typeBadge}>Multiple Choice</div>
          )}
        </div>
        <div className={styles.questionActions}>
          <button
            className={styles.iconButton}
            onClick={() => setIsModalOpen(true)}
            title="Edit question"
          >
            <Edit size={16} />
          </button>
          <button
            className={styles.iconButton}
            onClick={() => setShowConfirmation(true)}
            title="Delete question"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className={styles.question}>
        <p className={styles.questionText}>{question.text}</p>
      </div>

      <ul className={styles.optionsList}>
        {question.options.map((option, index) => {
          const isSelected = selectedOptions.includes(option._id);
          return (
            <li
              key={option._id}
              data-type={question.type || "radio"}
              className={`${styles.option} 
                ${isCorrectAnswer(option) ? styles.optionCorrect : ""}`}
              onClick={() => {
                // Handle single or multiple selection based on question type
                if (question.type === "checkbox") {
                  setSelectedOptions((prev) =>
                    prev.includes(option._id)
                      ? prev.filter((id) => id !== option._id)
                      : [...prev, option._id]
                  );
                } else {
                  setSelectedOptions([option._id]);
                }
              }}
            >
              <div className={`${styles.optionCircle}`}>
                {isCorrectAnswer(option) ? (
                  <span className={styles.checkmark}>✓</span>
                ) : (
                  String.fromCharCode(65 + index) // A, B, C, D...
                )}
              </div>
              <span className={styles.optionText}>{option.text}</span>
            </li>
          );
        })}
      </ul>

      {showConfirmation && (
        <ConfirmationModal
          setShowConfirmationModel={setShowConfirmation}
          title="Confirm Deletion"
          message="Are you sure you want to delete this question?"
          onConfirm={handleDelete}
        />
      )}

      {isModalOpen && (
        <EditQuestion
          setEditQuestion={setIsModalOpen}
          quizId={quizId}
          questionData={question}
          fetchAllQuestions={fetchAllQuestions}
        />
      )}
    </div>
  );
};

export default Question;
