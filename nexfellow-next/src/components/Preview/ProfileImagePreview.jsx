import React, { useState } from "react";
import styles from "./ProfileImagePreview.module.css";
import { FaTimes } from "react-icons/fa";

const ProfileImagePreview = ({ src, alt, initial }) => {
    const [isOpen, setIsOpen] = useState(false);

    // No real photo: show the user's initial, nothing to enlarge.
    if (initial) {
        return (
            <div className={`${styles.container} ${styles.initial}`} role="img" aria-label={alt}>
                {initial}
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <img
                src={src}
                alt={alt}
                className={styles.profileImage}
                onClick={() => setIsOpen(true)}
            />
            {isOpen && (
                <div className={styles.modal} onClick={() => setIsOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
                            <FaTimes />
                        </button>
                        <img src={src} alt={alt} className={styles.modalImage} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileImagePreview;
