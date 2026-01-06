import React, { useState } from "react";
import api from "../../lib/axios";
import styles from "./ReportModal.module.css";
import { IoClose } from "react-icons/io5";
import { MdReport, MdUploadFile } from "react-icons/md";
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

const ReportModal = ({ isOpen, onClose, postId, authorId }) => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    setImages([...images, ...files]);

    // Create image previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreview];
    URL.revokeObjectURL(newPreviews[index]); // Revoke the object URL to avoid memory leaks
    newPreviews.splice(index, 1);
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("authorId", authorId);
      formData.append("category", category);
      formData.append("description", description);

      // Append images if any
      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await api.post("/report/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Report submitted successfully");
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(error.response?.data?.message || "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose}>
          <IoClose size={24} />
        </button>

        <div className={styles.modalHeader}>
          <h3 className={styles.title}>Report Post</h3>
        </div>

        <form onSubmit={handleSubmit} className={styles.reportForm}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Category (required)</label>
            <select
              className={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {reportCategories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description (optional)</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide additional details about the issue"
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Images (optional, max 3)</label>

            {imagePreview.length > 0 && (
              <div className={styles.previewContainer}>
                {imagePreview.map((src, index) => (
                  <div key={index} className={styles.imagePreview}>
                    <img src={src} alt={`Preview ${index}`} />
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < 3 && (
              <div className={styles.uploadContainer}>
                <label className={styles.uploadButton}>
                  <MdUploadFile className={styles.uploadIcon} />
                  <span>Upload Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
                <span className={styles.uploadHint}>
                  {images.length}/3 images
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !category}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
