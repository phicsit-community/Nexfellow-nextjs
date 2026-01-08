import PropTypes from "prop-types";
import styles from "./RequestView.module.css";
import { MdPending, MdCheckCircle, MdCancel, MdHourglassEmpty } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { FaSpinner } from "react-icons/fa";
import { useState } from "react";

const RequestView = ({ request, onApprove, onReject, onClose }) => {
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);

  if (!request) return null;

  const statusBadge = (status) => {
    if (status === "Approved")
      return (
        <span className={`${styles.statusBadge} ${styles.statusApproved}`}>
          <MdCheckCircle style={{ marginRight: 4, fontSize: 15 }} />
          Approved
        </span>
      );
    if (status === "Rejected")
      return (
        <span className={`${styles.statusBadge} ${styles.statusRejected}`}>
          <MdCancel style={{ marginRight: 4, fontSize: 15 }} />
          Rejected
        </span>
      );
    // Pending or other statuses
    return (
      <span className={`${styles.statusBadge} ${styles.statusPending}`}>
        <MdPending style={{ marginRight: 4, fontSize: 15 }} />
        {status || "Pending"}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  const handleApproveClick = async () => {
    if (loadingApprove) return;
    setLoadingApprove(true);
    try {
      await onApprove(request._id);
    } finally {
      setLoadingApprove(false);
    }
  };

  const handleRejectClick = async () => {
    if (loadingReject) return;
    setLoadingReject(true);
    try {
      await onReject(request._id);
    } finally {
      setLoadingReject(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <IoMdClose size={22} />
        </button>
        <div className={styles.modalTitle}>Community Verification Request Details</div>
        <div className={styles.userRow}>
          <img
            className={styles.avatar}
            src={request.userId?.picture || "/default-avatar.png"}
            alt={request.userId?.name || "User Avatar"}
          />
          <div>
            <div className={styles.userNameRow}>
              <span className={styles.userName}>
                {request.userId?.name || "Unknown"}
              </span>
              {statusBadge(request.status)}
            </div>
            <div className={styles.userUsername}>
              @{request.userId?.username || "unknown"}
            </div>
            <div className={styles.userBio}>
              {request.userId?.bio || "-"}
            </div>
          </div>
        </div>

        {/* Info Grid with all fields */}
        <div className={styles.infoGrid}>
          <div>
            <div className={styles.infoLabel}>Community Name</div>
            <div className={styles.infoValue}>{request.communityName || "-"}</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Category</div>
            <div className={styles.infoValue}>{request.category || "-"}</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Request Date</div>
            <div className={styles.infoValue}>{formatDate(request.createdAt)}</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Account Type</div>
            <div className={styles.infoValue}>{request.accountType || "-"}</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Status</div>
            <div className={styles.infoValue}>{request.status || "-"}</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Action</div>
            <div className={styles.infoValue}>{request.action || "-"}</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Email</div>
            <div className={styles.infoValue}>{request.email || "-"}</div>
          </div>
          <div>
            <div className={styles.infoLabel}>Social Media Link</div>
            <div className={styles.infoValue}>
              {request.socialMediaLink ? (
                <a
                  href={request.socialMediaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {request.socialMediaLink}
                </a>
              ) : (
                "-"
              )}
            </div>
          </div>
        </div>

        {/* Description and Message */}
        {request.description && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Description</div>
            <div className={styles.sectionValue}>{request.description}</div>
          </div>
        )}
        {request.message && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Message</div>
            <div className={styles.sectionValue}>{request.message}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actionsRow}>
          <button
            className={styles.rejectBtn}
            onClick={handleRejectClick}
            disabled={loadingReject || loadingApprove}
            aria-label="Reject request"
          >
            {loadingReject ? (
              <>
                <FaSpinner className={styles.spinner} /> Rejecting...
              </>
            ) : (
              "Reject"
            )}
          </button>
          <button
            className={styles.approveBtn}
            onClick={handleApproveClick}
            disabled={loadingApprove || loadingReject}
            aria-label="Approve request"
          >
            {loadingApprove ? (
              <>
                <FaSpinner className={styles.spinner} /> Approving...
              </>
            ) : (
              "Approve"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

RequestView.propTypes = {
  request: PropTypes.object,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RequestView;
