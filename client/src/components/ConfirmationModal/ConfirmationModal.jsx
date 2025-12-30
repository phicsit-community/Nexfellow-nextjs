import React from "react";
import axios from "axios";
import styles from "./ConfirmationModal.module.css";
import { toast } from "sonner";

const ConfirmationModal = ({
  setShowConfirmationModel,
  onConfirm,
  title,
  message,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
    setShowConfirmationModel(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.title}>{title}</p>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={() => setShowConfirmationModel(false)}
          >
            Cancel
          </button>
          <button className={styles.confirmButton} onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
