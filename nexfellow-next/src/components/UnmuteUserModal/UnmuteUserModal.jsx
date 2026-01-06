import React, { useState } from "react";
import api from "../../lib/axios";
import { IoClose } from "react-icons/io5";
import { FaVolumeUp } from "react-icons/fa";
import { toast } from "sonner";
import styles from "./UnmuteUserModal.module.css";

const UnmuteUserModal = ({ isOpen, onClose, user }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleUnmuteUser = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post(`/user/unmute/${user._id}`);
      toast.success(response.data.message || "User unmuted successfully");
      onClose(true); // Pass true to indicate successful unmuting
    } catch (error) {
      console.error("Error unmuting user:", error);
      toast.error(error.response?.data?.message || "Failed to unmute user");
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
          <FaVolumeUp size={24} className={styles.icon} />
          <h3>Unmute {user.username || user.name}</h3>
        </div>

        <div className={styles.modalBody}>
          <p>
            You&apos;ll start seeing posts and notifications from{" "}
            {user.username || user.name} again.
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
            onClick={handleUnmuteUser}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Unmuting..." : "Unmute User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnmuteUserModal;
