import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ImageOverlay.module.css";

const ImageOverlay = ({ isOpen, onClose, imageUrl, altText }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className={styles.imageContainer}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            // transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.img
              layoutId="event-image"
              src={imageUrl}
              alt={altText}
              className={styles.image}
            />
            <motion.button
              className={styles.closeButton}
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              ×
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageOverlay;
