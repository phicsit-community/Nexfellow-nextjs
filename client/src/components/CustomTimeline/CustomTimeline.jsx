import React from "react";
import styles from "./CustomTimeline.module.css";

export const CustomTimeline = ({ children, style }) => {
  return (
    <div className={styles.customTimeline} style={style}>
      {children}
    </div>
  );
};

export const CustomTimelineItem = ({
  dot,
  color = "gray",
  label,
  children,
}) => {
  // Map color names to CSS class names
  const getColorClass = (type) => {
    switch (color) {
      case "green":
        return styles.dotGreen;
      case "red":
        return styles.dotRed;
      case "blue":
        return styles.dotBlue;
      case "gold":
        return styles.dotGold;
      default:
        return "";
    }
  };

  const getLineColorClass = (type) => {
    switch (color) {
      case "green":
        return styles.lineGreen;
      case "red":
        return styles.lineRed;
      case "blue":
        return styles.lineBlue;
      case "gold":
        return styles.lineGold;
      default:
        return "";
    }
  };

  const dotColorClass = getColorClass(color);
  const lineColorClass = getLineColorClass(color);

  return (
    <div className={styles.customTimelineItem}>
      <div className={styles.customTimelineLeft}>
        {label && <div className={styles.customTimelineLabel}>{label}</div>}
      </div>
      <div className={styles.customTimelineDotLine}>
        <div
          className={`${styles.customTimelineDot} ${dot ? "" : dotColorClass}`}
        >
          {dot}
        </div>
        <div className={`${styles.customTimelineLine} ${lineColorClass}`} />
      </div>
      <div className={styles.customTimelineContent}>{children}</div>
    </div>
  );
};
