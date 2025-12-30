import React from "react";
import styles from "./BookmarkContest.module.css";
import { Icon } from "@iconify/react";

const BookmarkContestCard = ({ data, path = "contest" }) => {
    const logo = data?.creatorId?.owner?.picture || "/logo-placeholder.png";
    const orgName = data?.creatorId?.owner?.name || "Unknown Organization";
    const orgUsername = data?.creatorId?.owner?.username || "unknown";

    return (
        <div className={styles.bookmarkCard}>
            <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                    <img src={logo} alt="Contest Logo" />
                </div>
                <div className={styles.cardMeta}>
                    <span className={styles.orgName}>{orgName}</span>
                    <span className={styles.orgUsername}>@{orgUsername}</span>
                </div>
                <Icon icon="mdi:bookmark-outline" className={styles.bookmarkIcon} />
            </div>
            <h5 className={styles.cardTitle}>{data.title || "Untitled Contest"}</h5>
            <p className={styles.cardDescription}>
                {data.description
                    ? data.description.slice(0, 80) + (data.description.length > 80 ? "..." : "")
                    : "No description available."}
            </p>
            <div className={styles.cardDates}>
                <Icon icon="mdi:calendar-outline" className={styles.dateIcon} />
                <span>
                    {data.startTime
                        ? new Date(data.startTime).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })
                        : "N/A"}
                    {" – "}
                    {data.endTime
                        ? new Date(data.endTime).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })
                        : "N/A"}
                </span>
            </div>
            {/* <div className={styles.cardStats}>
                <Icon icon="mdi:account-group-outline" className={styles.statsIcon} />
                <span>
                    Registered: <b>{data.totalRegistered ?? 0}</b>
                </span>
            </div> */}
            <div className={styles.cardActions}>
                <a
                    href={`/${path}/${data._id}`}
                    className={styles.detailsBtn}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View Details
                </a>
                <a
                    href={`/${path}/${data._id}`}
                    className={styles.joinBtn}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Join Contest
                </a>
            </div>
        </div>
    );
};

export default BookmarkContestCard;
