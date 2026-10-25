import React from "react";
import styles from "./HidePostModal.module.css";
import { FaEyeSlash } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import ModalPortal from "./ModalPortal";

const HidePostModal = ({ isOpen, onClose, onConfirm, postAuthor }) => {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <button className={styles.closeButton} onClick={onClose}>
            <IoClose size={24} />
          </button>

          <div className={styles.modalHeader}>
            <FaEyeSlash size={24} className={styles.icon} />
            <h3>Hide this post?</h3>
          </div>

          <div className={styles.modalBody}>
            <p>
              This post will be hidden from your feed. You won&apos;t see posts
              like this in your home feed anymore.
            </p>
            {postAuthor && (
              <p className={styles.note}>
                Note: This will not hide all posts from{" "}
                <strong>{postAuthor}</strong>, just this specific post.
              </p>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.confirmButton} onClick={onConfirm}>
              Hide Post
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default HidePostModal;
