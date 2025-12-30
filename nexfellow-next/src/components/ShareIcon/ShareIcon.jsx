import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./ShareIcon.module.css";
import {
  PiShareNetworkDuotone,
  PiCopySimpleDuotone,
  PiX,
} from "react-icons/pi";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  WhatsappIcon,
} from "react-share";
import { toast } from "sonner";
import { RiTwitterXFill } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { Share2 } from "lucide-react";

const ShareIcon = ({
  url = window.location.href,
  shareCount = 0,
  incrementShareCount = () => { },
  position = "bottom", // "bottom" or "top"
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Refs
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Anchored menu position
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });

  // Compute and update desktop menu position (relative to viewport)
  const updateMenuPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const top = rect.bottom + window.scrollY; // below trigger
    const left = rect.left + window.scrollX;
    setMenuPos({ top, left, width: rect.width });
  };

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Toggle the menu
  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  // Close when clicking outside (works with portals)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMenuOpen]);

  // While open, compute position and keep it synced on scroll/resize
  useEffect(() => {
    if (!isMenuOpen || isMobile) return;
    updateMenuPosition();

    const handler = () => updateMenuPosition();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);

    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [isMenuOpen, isMobile]);

  // Copy URL
  const copyUrlToClipboard = () => {
    incrementShareCount();
    navigator.clipboard.writeText(url).then(() => {
      toast.success("URL copied to clipboard!", { richColors: true });
    });
  };

  // Animations
  const modalVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", damping: 30, stiffness: 500 },
    },
    exit: { y: "100%", opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  };
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  // Share buttons
  const ShareButtons = () => (
    <div className={styles.shareButtonsContainer}>
      <div className={styles.socialButtonWrapper}>
        <FacebookShareButton
          url={url}
          quote="Check out this page!"
          hashtag="#sharing"
          onShareWindowClose={incrementShareCount}
        >
          <FacebookIcon size={42} round />
        </FacebookShareButton>
        <span className={styles.label}>Facebook</span>
      </div>
      <div className={styles.socialButtonWrapper}>
        <TwitterShareButton
          url={url}
          title="Check out this page!"
          hashtags={["sharing"]}
          onShareWindowClose={incrementShareCount}
          style={{ color: "white", backgroundColor: "#000", borderRadius: "50%", padding: "6px" }}
        >
          <RiTwitterXFill size={30} />
        </TwitterShareButton>
        <span className={styles.label}>Twitter</span>
      </div>
      <div className={styles.socialButtonWrapper}>
        <WhatsappShareButton
          url={url}
          title="Check out this page!"
          separator=":: "
          onShareWindowClose={incrementShareCount}
        >
          <WhatsappIcon size={42} round />
        </WhatsappShareButton>
        <span className={styles.label}>WhatsApp</span>
      </div>
      <div className={styles.socialButtonWrapper}>
        <button className={styles.copyButton} onClick={copyUrlToClipboard}>
          <PiCopySimpleDuotone size={26} />
        </button>
        <span className={styles.label}>Copy URL</span>
      </div>
    </div>
  );

  // Desktop content (portal + anchored coordinates)
  const DesktopDropdown = () =>
    ReactDOM.createPortal(
      <div
        ref={menuRef}
        className={`${styles.menu} portrait:left-0`}
        style={{
          position: "fixed",
          top: menuPos.top,     // below trigger
          left: menuPos.left,   // left-aligned with trigger
          transform: position === "top" ? "translateY(calc(-100% - 8px))" : "translateY(8px)",
          minWidth: Math.max(menuPos.width, 200),
          zIndex: 1000,
        }}
      >
        <div className={styles.menuContent}>
          <h3>Share</h3>
          <div className={styles.socialButtons}>
            <div className={styles.socialButtonWrapper}>
              <FacebookShareButton
                url={url}
                quote="Check out this page!"
                hashtag="#sharing"
                onShareWindowClose={incrementShareCount}
              >
                <FacebookIcon size={36} round />
              </FacebookShareButton>
              <span className={styles.label}>Facebook</span>
            </div>
            <div className={styles.socialButtonWrapper}>
              <TwitterShareButton
                url={url}
                title="Check out this page!"
                hashtags={["sharing"]}
                onShareWindowClose={incrementShareCount}
                style={{ color: "white", backgroundColor: "#000", borderRadius: "50%", padding: "6px" }}
              >
                <RiTwitterXFill size={24} />
              </TwitterShareButton>
              <span className={styles.label}>Twitter</span>
            </div>
            <div className={styles.socialButtonWrapper}>
              <WhatsappShareButton
                url={url}
                title="Check out this page!"
                separator=":: "
                onShareWindowClose={incrementShareCount}
              >
                <WhatsappIcon size={36} round />
              </WhatsappShareButton>
              <span className={styles.label}>WhatsApp</span>
            </div>
            <div className={styles.socialButtonWrapper}>
              <PiCopySimpleDuotone
                size={36}
                onClick={copyUrlToClipboard}
                style={{ color: "white", backgroundColor: "#24b2b4", borderRadius: "50%", padding: "4px" }}
              />
              <div className={styles.label}>Copy URL</div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );

  // Mobile modal (portal)
  const MobileShareModal = () =>
    ReactDOM.createPortal(
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className={styles.modalOverlay}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              className={styles.mobileModal}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className={styles.modalHeader}>
                <h3>Share via</h3>
                <button className={styles.closeModalBtn} onClick={() => setIsMenuOpen(false)}>
                  <PiX size={24} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <p className={styles.modalText}>Share this content with your friends and followers</p>
                <div className={styles.linkPreview}>
                  <div className={styles.linkIcon}>
                    <PiShareNetworkDuotone size={24} />
                  </div>
                  <div className={styles.linkText}>
                    {url.length > 30 ? `${url.substring(0, 30)}...` : url}
                  </div>
                </div>
              </div>
              <ShareButtons />
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    );

  return (
    <div className={styles.container}>
      {/* Trigger */}
      <div ref={triggerRef} className={styles.iconContainer} onClick={toggleMenu}>
        <div className={styles.shareIcon}>
          <Share2 className={styles.icon} />
        </div>
        <div className={styles.info}>{shareCount}</div>
      </div>

      {/* Portal-driven UIs */}
      {isMobile ? <MobileShareModal /> : isMenuOpen && <DesktopDropdown />}
    </div>
  );
};

export default ShareIcon;
