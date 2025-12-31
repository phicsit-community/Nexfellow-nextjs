"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// styles
import styles from "./ModeratorsSidebar.module.css";

// icons
import { FaTrophy, FaCalendarAlt, FaPaperPlane, FaCrown } from "react-icons/fa";
import Skeleton from "../common/Skeleton";

const ModeratorsSidebar = ({
    communityId,
    loading = false,
}) => {
    const [activeTab, setActiveTab] = useState("/create/challenges");
    console.log("communityId", communityId);

    const handleTabClick = (path) => {
        setActiveTab(path);
    };

    const isActive = (path) => activeTab === path;
    const sidebarRef = useRef(null);
    // Render skeleton sidebar item
    const renderSkeletonItem = () => (
        <div className={styles.itemWrapper}>
            <div className={`${styles.item}`}>
                <Skeleton type="analytic-card" className={styles.sidebarItemSkeleton} />
            </div>
        </div>
    );

    // Render sidebar item
    const renderSidebarItem = (path, icon, title, description) => (
        <div className={styles.itemWrapper}>
            <Link
                href={`${path}/${communityId}`}
                className={`${styles.item} ${isActive(`${path}/${communityId}`) ? styles.active : ""}`}
                onClick={() => handleTabClick(`${path}/${communityId}`)}
            >
                <div className={styles.icon}>{icon}</div>
                <div>
                    <h4 className={styles.title}>{title}</h4>
                    <p className={styles.description}>{description}</p>
                </div>
            </Link>
        </div>
    );

    if (loading) {
        return (
            <div className={`${styles.sidebar} ${styles.desktopSidebar}`}>
                <div className={styles.section}>
                    <div className={styles.category}>
                        <span
                            className={styles.dot}
                            style={{ backgroundColor: "#FF6B00" }}
                        ></span>
                        <h3>Create</h3>
                    </div>
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className={styles.itemWrapper}>
                            {renderSkeletonItem()}
                        </div>
                    ))}
                </div>

                <div className={styles.section}>
                    <div className={styles.category}>
                        <span
                            className={styles.dot}
                            style={{ backgroundColor: "#4CAF50" }}
                        ></span>
                        <h3>Communication</h3>
                    </div>
                    {renderSkeletonItem()}
                </div>

                <div className={styles.section}>
                    <div className={styles.category}>
                        <span
                            className={styles.dot}
                            style={{ backgroundColor: "#1E88E5" }}
                        ></span>
                        <h3>Other</h3>
                    </div>
                    {[...Array(2)].map((_, index) => (
                        <div key={index} className={styles.itemWrapper}>
                            {renderSkeletonItem()}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.sidebar} ${styles.desktopSidebar}`}>
            <div className={styles.section}>
                <div className={styles.category}>
                    <span
                        className={styles.dot}
                        style={{ backgroundColor: "#FF6B00" }}
                    ></span>
                    <h3>Create</h3>
                </div>
                {renderSidebarItem(
                    "/create/challenges",
                    <FaTrophy />,
                    "Challenges",
                    "Spark page engagement with Challenges."
                )}
                {renderSidebarItem(
                    "/create/contests",
                    <FaCrown />,
                    "Contests",
                    "Start a contest, boost engagement today."
                )}
                {renderSidebarItem(
                    "/create/events",
                    <FaCalendarAlt />,
                    "Events",
                    "Connect and grow your page through Events."
                )}
            </div>

            <div className={styles.section}>
                <div className={styles.category}>
                    <span
                        className={styles.dot}
                        style={{ backgroundColor: "#4CAF50" }}
                    ></span>
                    <h3>Communication</h3>
                </div>
                {renderSidebarItem(
                    "/communication/broadcast",
                    <FaPaperPlane />,
                    "Broadcast",
                    "Notify your followers and boost your reach."
                )}
            </div>
        </div>
    );
};

export default ModeratorsSidebar;
