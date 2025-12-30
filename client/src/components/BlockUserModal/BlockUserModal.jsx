import React, { useState } from "react";
import axios from "axios";
import styles from "./BlockUserModal.module.css";
import { FaBan } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { toast } from "sonner";

const BlockUserModal = ({ isOpen, onClose, user }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleBlockUser = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`/user/block/${user._id}`);
      toast.success(response.data.message || "User blocked successfully");
      onClose(true); // Pass true to indicate successful blocking
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error(error.response?.data?.message || "Failed to block user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={() => onClose(false)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={() => onClose(false)}>
          <IoClose size={24} />
        </button>

        <div className={styles.modalHeader}>
          <FaBan size={24} className={styles.icon} />
          <h3>Block {user.username}</h3>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.warningText}>
            This is a significant action with several consequences:
          </p>

          <ul className={styles.effectsList}>
            <li className={styles.effectItem}>
              You will no longer see posts from {user.username} in your feed
            </li>
            <li className={styles.effectItem}>
              {user.username} will be removed from your following/followers
              lists
            </li>
            <li className={styles.effectItem}>
              {user.username} won&apos;t appear in your explore page
            </li>
            <li className={styles.effectItem}>
              {user.username} won&apos;t be able to follow you or interact with
              your content
            </li>
          </ul>

          <p>
            You can unblock this user later from your settings if you change
            your mind.
          </p>
          <p className={styles.note}>
            {user.username} will not be notified that you&apos;ve blocked them.
          </p>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.cancelButton}
            onClick={() => onClose(false)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className={styles.confirmButton}
            onClick={handleBlockUser}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Blocking..." : "Block User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockUserModal;
