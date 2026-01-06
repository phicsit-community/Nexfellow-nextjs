import React, { useState } from "react";
import api from "../../lib/axios";
import styles from "./WebsiteButton.module.css";
import Webicon from "./assets/web.svg";
import { toast } from "sonner";
const WebsiteButton = ({
  communityData,
  isCommunityAccount,
  communityId,
  fetchData,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [websiteLink, setWebsiteLink] = useState(communityData?.link || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async () => {
    if (!websiteLink) {
      toast.error("Please enter a valid link.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.put(
        `/community/${communityId}/link`,
        { link: websiteLink },
        { withCredentials: true }
      );

      toast(response.data.message);

      try {
        await fetchData();
        handleCloseModal();
      } catch (fetchError) {
        console.error("Error fetching updated data:", fetchError);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update website link."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        className={styles.iconButton}
        disabled={!isCommunityAccount}
        onClick={handleOpenModal}
      >
        <img src={Webicon?.src || Webicon} alt="Website" className={styles.svgIcon} />
      </button>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>{communityData?.link ? "Update" : "Add"} Website Link</h3>
            <input
              type="url"
              placeholder="Enter website URL"
              value={websiteLink}
              onChange={(e) => setWebsiteLink(e.target.value)}
              className={styles.inputField}
            />
            <div className={styles.buttonContainer}>
              <button
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
              <button
                className={styles.cancelButton}
                onClick={handleCloseModal}
              >
                Cancel
              </button>
            </div>
            {/* Open Website Button inside modal */}
            {communityData?.link && (
              <button
                className={styles.openButton}
                onClick={() => {
                  const formattedLink = communityData.link.startsWith("http")
                    ? communityData.link
                    : `https://${communityData.link}`;
                  window.open(formattedLink, "_blank");
                }}
              >
                Open Website
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WebsiteButton;
