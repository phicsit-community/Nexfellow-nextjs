import React, { useState } from "react";
import ReactDOM from "react-dom";
import styles from "./ShareModal.module.css";
import {
  FaCopy,
  FaFacebook,
  FaWhatsapp,
  FaLinkedin,
  FaTimes,
  FaQrcode,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { RiTwitterXFill } from "react-icons/ri";

const ShareModal = ({ isOpen, onClose, communityUsername }) => {
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  if (!isOpen) return null;

  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/community/${communityUsername}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const content = (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      aria-hidden="false"
    >
      <div
        className={styles.modalContainer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        aria-describedby="share-modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        <h3 id="share-modal-title" className={styles.title}>
          Share This Community
        </h3>
        <p id="share-modal-desc" className={styles.description}>
          Invite others using the link below:
        </p>

        {/* Link Display & Copy Button */}
        <div className={styles.linkContainer}>
          <input
            type="text"
            value={shareUrl}
            readOnly
            className={styles.linkInput}
          />
          <button
            onClick={handleCopy}
            className={`${styles.copyButton} ${copied ? styles.copied : ""}`}
            aria-label="Copy link"
          >
            <FaCopy />
          </button>
        </div>
        {copied && <span className={styles.copyFeedback}>✅ Copied!</span>}

        {/* QR Code */}
        <div className="flex items-center justify-between mt-4 flex-col">
          <button
            className={styles.qrButton}
            onClick={() => setShowQRCode(!showQRCode)}
          >
            <FaQrcode className="w-4 h-4 inline" />{" "}
            {showQRCode ? "Hide QR Code" : "Show QR Code"}
          </button>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: showQRCode ? "auto" : 0,
              opacity: showQRCode ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            className={styles.qrCodeContainer}
          >
            {showQRCode && (
              <div className={styles.qrCodeWrapper}>
                <QRCodeCanvas value={shareUrl} size={150} className={styles.qrCode} />
              </div>
            )}
          </motion.div>
        </div>

        {/* Social Media Sharing */}
        <div className={styles.shareOptions}>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.shareIcon}
            aria-label="Share on Facebook"
          >
            <FaFacebook />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Join this amazing community!`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.shareIcon}
            aria-label="Share on X"
          >
            <RiTwitterXFill className="text-black" />
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=Join this community: ${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.shareIcon}
            aria-label="Share on WhatsApp"
          >
            <FaWhatsapp />
          </a>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.shareIcon}
            aria-label="Share on LinkedIn"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default ShareModal;
