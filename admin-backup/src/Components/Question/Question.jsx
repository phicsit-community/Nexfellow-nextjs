import { useState } from "react";

//styles
import styles from "./Question.module.css";

//components
import Modal from "../EditQuestion/EditQuestion";
import DeleteConfirmation from "../DeleteConfirm/DeleteConfirmation";

const Question = ({ question, fetchAllQuestions }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  const handleDeleteQuestion = async (questionid) => {
    try {
      const response = await fetch(
        `${apiUrl}/admin/deletequestion/${questionid}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        console.log("Question deleted");
      } else {
        console.error("Failed to delete question. Status:", response.status);
      }
      fetchAllQuestions();
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  return (
    <div className={styles.questionContainer}>
      <h1 className={styles.question}>
        <pre>Q.{question.text}</pre>
      </h1>
      
      {/* For radio-type questions */}
      {question.type === "radio" && (
        <div className={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <div key={index} className={styles.option}>
              <input
                type="radio"
                name={`question-${question._id}`}
                value={option.text}
                id={`option-${index}`}
              />
              <label htmlFor={`option-${index}`}>{option.text}</label>
            </div>
          ))}
        </div>
      )}

      {/* For checkbox-type questions */}
      {question.type === "checkbox" && (
        <div className={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <div key={index} className={styles.option}>
              <input
                type="checkbox"
                name={`question-${question._id}`}
                value={option.text}
                id={`option-${index}`}
              />
              <label htmlFor={`option-${index}`}>{option.text}</label>
            </div>
          ))}
        </div>
      )}

      {/* For text-type questions */}
      {question.type === "text" && (
        <div className={styles.optionsContainer}>
          <input
            className={styles.textInput}
            type="text"
            placeholder="Your answer here"
          />
        </div>
      )}

      <div className={styles.buttonContainer}>
        <div
          className={styles.button}
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          Edit Question
        </div>

        <div
          className={`${styles.button} ${styles.delete}`}
          onClick={() => {
            setDeleteConfirmation(true);
          }}
        >
          Delete Question
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        question={question}
      />

      {deleteConfirmation && (
        <DeleteConfirmation
          handleDeleteQuestion={handleDeleteQuestion}
          questionId={question._id}
          setDeleteConfirmation={setDeleteConfirmation}
        />
      )}
    </div>
  );
};

export default Question;
