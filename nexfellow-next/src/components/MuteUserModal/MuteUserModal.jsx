import React, { useState } from "react";
import api from "../../lib/axios";
import { IoClose } from "react-icons/io5";
import { FaVolumeMute } from "react-icons/fa";
import { toast } from "sonner";
import styles from "./MuteUserModal.module.css";

const MuteUserModal = ({ isOpen, onClose, user }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleMuteUser = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post(`/user/mute/${user._id}`);
      toast.success(response.data.message || "User muted successfully");
      onClose(true); // Pass true to indicate successful muting
    } catch (error) {
      console.error("Error muting user:", error);
      toast.error(error.response?.data?.message || "Failed to mute user");
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
          <FaVolumeMute size={24} className={styles.icon} />
          <h3>Mute {user.username || user.name}</h3>
        </div>

        <div className={styles.modalBody}>
          <p>
            You won&apos;t see posts from {user.username || user.name} in your
            feed anymore. You can unmute this user later from your settings.
          </p>
          <p className={styles.note}>
            This action is only visible to you. {user.username || user.name}{" "}
            will not be notified that you&apos;ve muted them.
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
            onClick={handleMuteUser}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Muting..." : "Mute User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MuteUserModal;
