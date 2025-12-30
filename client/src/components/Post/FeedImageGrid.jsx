import { useState } from "react";
import FeedImageViewer from "./FeedImageViewer";
import styles from "./FeedImageGrid.module.css";

function FeedImageGrid({ images }) {
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const handleImageClick = (idx) => {
        setViewerIndex(idx);
        setViewerOpen(true);
    };

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
                        style={{ cursor: "pointer" }}
                    >
                        <img
                            src={img.fileUrl}
                            alt={`Post image ${idx + 1}`}
                            className={styles.image}
                            draggable={false}
                        />
                        {images.length > 4 && idx === 3 && (
                            <div className={styles.moreOverlay}>
                                +{images.length - 4}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {viewerOpen && (
                <FeedImageViewer
                    images={images}
                    startIndex={viewerIndex}
                    onClose={() => setViewerOpen(false)}
                />
            )}
        </>
    );
}

export default FeedImageGrid;
