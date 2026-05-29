import { useState } from "react";
import FeedImageViewer from "./FeedImageViewer";
import styles from "./FeedImageGrid.module.css";

function FeedImageGrid({ images }) {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const handleImageClick = (idx) => {
        if (images[idx].fileType?.startsWith("video/")) return;
        setViewerIndex(idx);
        setViewerOpen(true);
    };

    // Only pass image (non-video) attachments to the viewer
    const imageOnlyAttachments = images.filter(img => !img.fileType?.startsWith("video/"));

    return (
        <>
            <div
                className={`${styles.grid} ${styles["count" + Math.min(images.length, 4)]}`}
            >
                {images.slice(0, 4).map((img, idx) => (
                    <div
                        key={idx}
                        className={styles["item" + (idx + 1)]}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(idx);
                        }}
                        style={{ cursor: img.fileType?.startsWith("video/") ? "default" : "pointer" }}
                    >
                        {img.fileType?.startsWith("video/") ? (
                            <video
                                src={img.fileUrl}
                                className={styles.image}
                                controls
                                playsInline
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <img
                                src={img.fileUrl}
                                alt={`Post image ${idx + 1}`}
                                className={styles.image}
                                draggable={false}
                            />
                        )}
                        {images.length > 4 && idx === 3 && (
                            <div className={styles.moreOverlay}>
                                +{images.length - 4}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {viewerOpen && imageOnlyAttachments.length > 0 && (
                <FeedImageViewer
                    images={imageOnlyAttachments}
                    startIndex={viewerIndex}
                    onClose={() => setViewerOpen(false)}
                />
            )}
        </>
    );
}

export default FeedImageGrid;
