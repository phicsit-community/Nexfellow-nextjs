import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./NotificationPage.module.css";
import timeAgo from "../../utils/timeAgo";
import { ArrowLeft, Settings, MoreVertical } from "lucide-react";

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get("/notifications");
                setNotifications(res.data.notifications || []);
            } catch (err) {
                console.error("Error fetching notifications", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    if (loading) return (
        <div className={styles.pageWrapper}>
            <div className={styles.loading}>Loading...</div>
        </div>
    );

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <ArrowLeft className={styles.iconBtn} onClick={() => navigate(-1)} size={24} />
                        <h1 className={styles.title}>All Notifications</h1>
                    </div>
                    <Settings className={styles.iconBtn} size={24} />
                </div>

                <div className={styles.list}>
                    {notifications.length === 0 ? (
                        <div className={styles.emptyState}>No notifications found.</div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif._id}
                                className={`${styles.item} ${!notif.read ? styles.unread : ""}`}
                                onClick={() => navigate(`/notifications/${notif._id}`)}
                            >
                                <img
                                    src={notif.sender?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + notif._id}
                                    alt="avatar"
                                    className={styles.avatar}
                                />
                                <div className={styles.content}>
                                    <div className={styles.notificationText}>
                                        <span className={styles.boldText}>{notif.title}</span>
                                        <span className={styles.bodyText}>
                                            {notif.message || " No additional details available."}
                                        </span>
                                    </div>
                                    <div className={styles.date}>{timeAgo(notif.createdAt)}</div>
                                </div>
                                <div className={styles.actions}>
                                    <MoreVertical size={20} className={styles.optionsIcon} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPage;
