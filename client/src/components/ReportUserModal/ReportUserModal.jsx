import React, { useState } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { MdReport } from "react-icons/md";
import { toast } from "sonner";

const reportCategories = [
  "Spam",
  "Harassment or Bullying",
  "Hate Speech",
  "Misinformation",
  "Violent Content",
  "Inappropriate Content",
  "Copyright Violation",
  "Impersonation",
  "Self-harm",
  "Other",
];

// Create a new CSS module
const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(3px)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 5px 20px rgba(0, 0, 0, 0.2)",
    width: "100%",
    maxWidth: "500px",
    position: "relative",
    animation: "modalFadeIn 0.2s ease-out",
    maxHeight: "90vh",
    overflow: "auto",
  },
  closeButton: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "none",
    border: "none",
    color: "#666",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  },
  title: {
    margin: 0,
    padding: "24px 24px 0",
    fontSize: "1.3rem",
    fontWeight: 600,
    color: "#333",
    textAlign: "center",
  },
  modalHeader: {
    padding: "20px 20px 0px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  icon: {
    color: "#666",
    marginBottom: "10px",
  },
  reportForm: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontWeight: 500,
    fontSize: "0.95rem",
  },
  select: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#fff",
  },
  textarea: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    minHeight: "100px",
    resize: "vertical",
  },
  buttonsContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "10px",
  },
  cancelButton: {
    padding: "10px 16px",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ddd",
    color: "#444",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  submitButton: {
    padding: "10px 16px",
    backgroundColor: "#f44336",
    border: "1px solid #f44336",
    color: "white",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

const ReportUserModal = ({ isOpen, onClose, user }) => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      toast.error("Please select a report category");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`/report/user/${user._id}`, {
        category,
        description,
      });

      toast.success(response.data.message || "User reported successfully");
      onClose(true); // Pass true to indicate successful reporting
    } catch (error) {
      console.error("Error reporting user:", error);
      toast.error(error.response?.data?.message || "Failed to report user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={() => onClose(false)}>
      <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={() => onClose(false)}>
          <IoClose size={24} />
        </button>

        <div style={styles.modalHeader}>
          <MdReport size={24} style={styles.icon} />
          <h3 style={styles.title}>Report {user.username || user.name}</h3>
        </div>

        <form style={styles.reportForm} onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>What&apos;s the issue?*</label>
            <select
              style={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a reason</option>
              {reportCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Additional details (optional)</label>
            <textarea
              style={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context about your report..."
              rows={4}
            />
          </div>

          <div style={styles.buttonsContainer}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => onClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportUserModal;
