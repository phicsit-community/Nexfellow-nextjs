import React from "react";
import styles from "./ConfirmationModal.module.css";

const ConfirmationModal = ({
  setShowConfirmationModel,
  fetchUserQuizes,
  userQuizes,
  quizID,
}) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log("User quizes:", userQuizes);
  console.log("Quiz id:", quizID);
  const handleDelete = async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/deletequiz/${quizID}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (response.ok) {
        console.log("Quiz deleted");
        fetchUserQuizes();
        alert("Quiz deleted successfully");
      } else {
        console.error("Failed to delete quiz. Status:", response.status);
      }
    } catch (error) {
      console.error("Failed to delete quiz:", error);
    } finally {
      setShowConfirmationModel(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.message}>
          Are you sure you want to delete this quiz? This will delete all <br />
          the responses, the Leaderboard related to it and all the questions
        </p>
        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={() => setShowConfirmationModel(false)}
          >
            Cancel
          </button>
          <button className={styles.confirmButton} onClick={handleDelete}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
