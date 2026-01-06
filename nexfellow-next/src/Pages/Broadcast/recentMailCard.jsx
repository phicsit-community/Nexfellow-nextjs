import { useState } from "react";
import styles from "./Broadcast.module.css";
import mailIcon from "./assets/mailIcon.png";
import Skeleton from "../../components/Skeleton/Skeleton";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: "2-digit", month: "long", year: "numeric" };
  return date.toLocaleDateString(undefined, options);
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const MailCard = ({
  subject,
  content,
  date,
  time,
  recipients,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (isLoading) return;
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  if (isLoading) {
    return <Skeleton type="mailCard" />;
  }

  return (
    <>
      <div className={styles.mailCardContainer} onClick={handleClick}>
        <div className={styles.mailHeader}>
          <div
            className={styles.mailContentOut}
            dangerouslySetInnerHTML={{
              __html: subject.length > 50 ? subject.slice(0, 50) : subject,
            }}
          ></div>
          <img src={mailIcon?.src || mailIcon} alt="Mail Icon" />
        </div>
        <p className={styles.mailDateTime}>>
          {formatDate(date)} {formatTime(date)}
        </p>
      </div>

      {isExpanded && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div
            className={styles.modalPopup}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalTopBar}>
              <h2>{subject}</h2>
              <button
                onClick={handleClose}
                className={styles.modalCloseIcon}
                title="Close"
              >
                ×
              </button>
            </div>
            <p className={styles.mailDateTime}>
              {formatDate(date)} {formatTime(date)}
            </p>
            <div
              className={styles.fullMailContent}
              dangerouslySetInnerHTML={{ __html: content }}
            ></div>
            <p className={styles.mailRecipients}>
              Recipients: <strong>{recipients}</strong>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default MailCard;
