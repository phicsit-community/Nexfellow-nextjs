import React from "react";
import styles from "./EmptyStateBox.module.css";
import membersIcon from "./assets/members.svg";
import eventsIcon from "./assets/events.svg";
import challengesIcon from "./assets/challenges.svg";
import contestsIcon from "./assets/contests.svg";

// Import an icon for analytics (using react-icons)
import { MdOutlineAnalytics } from "react-icons/md";

const icons = {
    members: <img src={membersIcon?.src || membersIcon} alt="members icon" className={styles.icon} />,
    events: <img src={eventsIcon?.src || eventsIcon} alt="events icon" className={styles.icon} />,
    challenges: <img src={challengesIcon?.src || challengesIcon} alt="challenges icon" className={styles.icon} />,
    contests: <img src={contestsIcon?.src || contestsIcon} alt="contests icon" className={styles.icon} />,
    analytics: <MdOutlineAnalytics className={styles.icon} />, // using icon instead of svg
};

const EmptyStateBox = ({ type, title, description }) => {
    return (
        <div className={styles.box}>
            {icons[type]}
            <h4 className={styles.title}>{title}</h4>
            <p className={styles.description}>{description}</p>
        </div>
    );
};

export default EmptyStateBox;
