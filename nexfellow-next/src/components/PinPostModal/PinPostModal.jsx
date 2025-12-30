import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaThumbtack } from "react-icons/fa";
import styles from "./PinPostModal.module.css";

const PinPostModal = ({ isOpen, onClose, onPin, onUnpin, post, isPinned }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !post) return null;

  const handleAction = async () => {
    setLoading(true);
    try {
      if (isPinned) {
        await onUnpin();
      } else {
        await onPin(post._id);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={() => onClose()}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={() => onClose()}>
          <IoClose size={24} />
        </button>

        <div className={styles.modalHeader}>
          <FaThumbtack size={24} className={styles.icon} />
          <h3>
            {isPinned ? "Unpin Post from Community" : "Pin Post to Community"}
          </h3>
        </div>

        <div className={styles.modalBody}>
          {isPinned ? (
            <p>Are you sure you want to unpin this post from the community?</p>
          ) : (
            <p>
              This post will appear at the top of the community feed. Only one
              post can be pinned at a time.
            </p>
          )}
          {!isPinned && post.currentlyPinned && (
            <p className={styles.note}>
              Another post is currently pinned to this community. Pinning this
              post will unpin the current pinned post.
            </p>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={() => onClose()} disabled={loading}>
            Cancel
          </button>
          <button
            className={styles.confirmButton}
            onClick={handleAction}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.loader} />
            ) : isPinned ? "Unpin" : "Pin Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinPostModal;
