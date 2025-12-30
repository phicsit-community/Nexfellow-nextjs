import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { createPortal } from "react-dom";
import styles from "./FeedImageViewer.module.css";

function FeedImageViewer({ images, startIndex = 0, onClose }) {
    const [current, setCurrent] = useState(startIndex);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") setCurrent(c => (c === 0 ? images.length - 1 : c - 1));
            if (e.key === "ArrowRight") setCurrent(c => (c === images.length - 1 ? 0 : c + 1));
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, images.length]);

    const prev = (e) => {
        if (e) e.stopPropagation();
        setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
    };

    const next = (e) => {
        if (e) e.stopPropagation();
        setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
    };

    const handlers = useSwipeable({
        onSwipedLeft: next,
        onSwipedRight: prev,
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
    });

    const content = (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Image viewer modal">
            <div className={styles.viewer} {...handlers} onClick={e => e.stopPropagation()} tabIndex={-1}>
                {images.length > 1 && (
                    <button
                        className={`${styles.arrow} ${styles.left}`}
                        onClick={prev}
                        aria-label="Previous image"
                        type="button"
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" >
                            <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                )}
                <img
                    src={images[current].fileUrl}
                    alt={`Image ${current + 1} of ${images.length}`}
                    className={styles.image}
                    loading="lazy"
                    draggable={false}
                />
                {images.length > 1 && (
                    <button
                        className={`${styles.arrow} ${styles.right}`}
                        onClick={next}
                        aria-label="Next image"
                        type="button"
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" >
                            <path d="M9 5L16 12L9 19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                )}
                {images.length > 1 && (
                    <div className={styles.dots} role="tablist" aria-label="Image navigation dots">
                        {images.map((_, idx) => (
                            <span
                                key={idx}
                                className={idx === current ? styles.dotActive : styles.dot}
                                onClick={() => setCurrent(idx)}
                                aria-selected={idx === current}
                                tabIndex={0}
                                role="tab"
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setCurrent(idx); }}
                                aria-label={`Go to image ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
                {images.length > 1 && (
                    <div className={styles.thumbnailStrip} role="list" aria-label="Image thumbnails">
                        {images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img.fileUrl}
                                alt={`Thumbnail ${idx + 1}`}
                                className={`${styles.thumbnail} ${idx === current ? styles.activeThumbnail : ""}`}
                                onClick={() => setCurrent(idx)}
                                draggable={false}
                                role="listitem"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setCurrent(idx); }}
                            />
                        ))}
                    </div>
                )}
                <button
                    className={styles.close}
                    onClick={onClose}
                    aria-label="Close image viewer"
                    type="button"
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" >
                        <path d="M18 6L6 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M6 6L18 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </div>
    );

    return createPortal(content, document.body);
}

export default FeedImageViewer;
