import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import axios from "axios";
import { FaLink, FaChartBar, FaTimes, FaCopy } from "react-icons/fa";
import LinkDetails from "./LinkDetails";
import styles from "./LinkAnalyticsModal.module.css";
import { toast } from "sonner";

const LinkAnalyticsModal = ({ isOpen, onClose, communityId }) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [showLinkDetails, setShowLinkDetails] = useState(false);

  useEffect(() => {
    if (isOpen && communityId) {
      fetchLinks();
    }
  }, [isOpen, communityId]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/link/community/${communityId}/links`);
      setLinks(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching links:", err);
      setError("Failed to load links. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleViewDetails = (link) => {
    setSelectedLink(link);
    setShowLinkDetails(true);
  };

  const handleBackToList = () => {
    setShowLinkDetails(false);
    setSelectedLink(null);
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>
            {showLinkDetails ? "Link Analytics" : "Your Shortened Links"}
            <span className={styles.linkCount}>
              {showLinkDetails ? "" : `(${links.length})`}
            </span>
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {showLinkDetails && selectedLink ? (
          <>
            <button className={styles.backButton} onClick={handleBackToList}>
              ← Back to all links
            </button>
            <LinkDetails link={selectedLink} onBack={handleBackToList} />
          </>
        ) : (
          <div className={styles.linksContainer}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.loader}></div>
                <p>Loading your links...</p>
              </div>
            ) : error ? (
              <div className={styles.errorState}>
                <p>{error}</p>
                <button onClick={fetchLinks} className={styles.retryButton}>
                  Try Again
                </button>
              </div>
            ) : links.length === 0 ? (
              <div className={styles.emptyState}>
                <FaLink className={styles.emptyIcon} />
                <p>You haven&apos;t created any shortened links yet.</p>
                <p className={styles.emptySubtext}>
                  Links are automatically created when you include URLs in your
                  posts.
                </p>
              </div>
            ) : (
              <>
                <div className={styles.linkTableHeader}>
                  <div className={styles.linkUrl}>Original URL</div>
                  <div className={styles.linkShort}>Shortened URL</div>
                  <div className={styles.linkClicks}>Clicks</div>
                  <div className={styles.linkDate}>Created</div>
                  <div className={styles.linkActions}>Actions</div>
                </div>
                <div className={styles.linksList}>
                  {links.map((link) => (
                    <div key={link.shortCode} className={styles.linkItem}>
                      <div className={styles.linkUrl} title={link.originalUrl}>
                        {link.originalUrl.length > 40
                          ? link.originalUrl.substring(0, 40) + "..."
                          : link.originalUrl}
                      </div>
                      <div className={styles.linkShort}>{link.shortUrl}</div>
                      <div className={styles.linkClicks}>{link.clicks}</div>
                      <div className={styles.linkDate}>
                        {format(new Date(link.createdAt), "MMM dd, yyyy")}
                      </div>
                      <div className={styles.linkActions}>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleCopyLink(link.shortUrl)}
                          title="Copy link"
                        >
                          <FaCopy />
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleViewDetails(link)}
                          title="View analytics"
                        >
                          <FaChartBar />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkAnalyticsModal;
