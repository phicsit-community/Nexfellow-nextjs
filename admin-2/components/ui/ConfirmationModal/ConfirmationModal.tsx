'use client';

import React from 'react';
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
  setShowConfirmationModel: (show: boolean) => void;
  onConfirm: () => void;
  message?: string;
  title?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  setShowConfirmationModel,
  onConfirm,
  message = 'Are you sure you want to proceed with this action?',
  title = 'Confirm Action',
}) => {
  const handleConfirm = () => {
    onConfirm();
    setShowConfirmationModel(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>{title}</h3>
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
