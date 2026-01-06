'use client';

import React from 'react';
import styles from './DeleteConfirmation.module.css';
import { IoMdClose } from 'react-icons/io';

interface DeleteConfirmationProps {
  onDelete: () => void;
  setDeleteConfirmation: (show: boolean) => void;
  title?: string;
  message?: string;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  onDelete,
  setDeleteConfirmation,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item?',
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
        <h2 className={styles.heading}>{title}</h2>
        <p>{message}</p>
        <div className={styles.buttons}>
          <button
            className={styles.deleteButton}
            onClick={() => {
              onDelete();
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
