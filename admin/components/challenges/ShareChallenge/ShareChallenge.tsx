'use client';

import React from 'react';
import styles from './ShareChallenge.module.css';
import {
  FaLink,
  FaTimes,
  FaUpload,
  FaCopy,
  FaFacebook,
  FaLinkedin,
  FaWhatsapp,
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface ShareChallengeProps {
  challengeName?: string;
  challengeUrl?: string;
  startDate?: string;
  endDate?: string;
  onClose?: () => void;
}

const ShareChallenge: React.FC<ShareChallengeProps> = ({
  challengeName = 'Challenge Name',
  challengeUrl = 'https://geekclash.in/',
  startDate = '20 September',
  endDate = '30 September',
  onClose,
}) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(challengeUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <div className={styles.shareChallengeContainer}>
      <div className={styles.shareChallenge}>
        <div className={styles.header}>
          <h2>Share Challenge</h2>
          <div className={styles.closeIcon} onClick={onClose}>
            <FaTimes />
          </div>
        </div>

        <div className={styles.challengeDetails}>
          <div className={styles.challengeImage}>{/* Image here */}</div>
          <div className={styles.challengeInfo}>
            <p className={styles.cName}>{challengeName}</p>
            <p>
              {startDate} - {endDate}
            </p>
            <p className={styles.free}>Free</p>
          </div>
        </div>

        <div className={styles.shareButtons}>
          <a href="#" target="_blank" rel="noopener noreferrer">
            <FaUpload />
          </a>

          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(challengeUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaXTwitter />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(challengeUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin />
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(challengeUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp />
          </a>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(challengeUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook />
          </a>
        </div>

        <div className={styles.linkSection}>
          <h4>Challenge page link</h4>
          <div className={styles.linkBox}>
            <input type="text" value={challengeUrl} readOnly />
            <button className={styles.copyButton} onClick={handleCopyLink}>
              <FaCopy />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareChallenge;
