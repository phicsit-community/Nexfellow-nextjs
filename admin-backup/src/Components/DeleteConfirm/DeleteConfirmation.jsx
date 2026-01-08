import React from "react";
import styles from "./DeleteConfirmation.module.css";
import { IoMdClose } from "react-icons/io";

const DeleteConfirmation = ({
  handleDeleteQuestion,
  setDeleteConfirmation,
  questionId,
}) => {
  const handleClose = () => {
    setDeleteConfirmation(false);
  };
  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <div className={styles.close} onClick={handleClose}>
          <IoMdClose />
        </div>
        <h2 className={styles.heading}>Confirm Deletion</h2>
        <p>Are you sure you want to delete this question?</p>
        <div className={styles.buttons}>
          <button
            className={styles.deleteButton}
            onClick={() => {
              handleDeleteQuestion(questionId);
              handleClose();
            }}
          >
            Yes, Delete
          </button>
          <button className={styles.closeButton} onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
