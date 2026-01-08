import React, { useEffect, useState } from "react";
import styles from "./Notifications.module.css";
import Navbar from "../../Components/Navbar/Navbar";
import SideBar from "../../Components/SideBar/SideBar";
import { useSelector } from "react-redux";
import { BsCheckCircle, BsExclamationCircle, BsPeople, BsPerson, BsRocket, BsCalendar } from "react-icons/bs";
import { FaBell } from "react-icons/fa";

const Notifications = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const { user } = useSelector((state) => state.user);
    const adminId = user;

    // States
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [sendToAll, setSendToAll] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchUser, setSearchUser] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Delivery schedule UI (future use)
    const [scheduleType, setScheduleType] = useState("now"); // "now" or "schedule"
    const [scheduledDate, setScheduledDate] = useState("");
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [loadingRecent, setLoadingRecent] = useState(false);
    const [activeUsers, setActiveUsers] = useState(0);

    useEffect(() => {
        // Fetch Active Users Count
        const fetchActiveUsers = async () => {
            try {
                const res = await fetch(`${apiUrl}/admin/active-users/count`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                setActiveUsers(data.activeUsers);
            } catch (e) {
                setActiveUsers(0);
            }
        };
        fetchActiveUsers();
    }, [apiUrl]);

    useEffect(() => {
        const fetchRecentNotifications = async () => {
            setLoadingRecent(true);
            try {
                const res = await fetch(`${apiUrl}/admin/recent-notifications`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to fetch recent notifications");
                const data = await res.json();
                setRecentNotifications(
                    data.map(n => ({
                        ...n,
                        // Format time difference
                        time: timeAgo(n.time), // see below
                    }))
                );
            } catch (err) {
                setRecentNotifications([]);
            }
            setLoadingRecent(false);
        };
        fetchRecentNotifications();
    }, [apiUrl]);

    // Helper for "time ago" formatting
    function timeAgo(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `${apiUrl}/admin/${adminId}/registered-users`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                    }
                );
                if (!response.ok) throw new Error("Failed to fetch users");
                const result = await response.json();
                setUsers(result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            } catch (error) {
                setErrorMsg("Failed to load users.");
            }
            setLoading(false);
        };

        fetchUsers();
    }, [apiUrl, adminId]);

    // Recipient selection handlers
    const handleUserSelect = (id) => {
        setSelectedUsers((prev) =>
            prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        setSelectedUsers(filteredUsers.map((user) => user._id));
    };

    const handleClearAll = () => {
        setSelectedUsers([]);
    };

    // Filter users by search query
    const filteredUsers = users.filter(
        (user) =>
            user.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchUser.toLowerCase())
    );

    // Handle send notification
    const handleSend = async (e) => {
        e.preventDefault();
        setSuccessMsg("");
        setErrorMsg("");
        setSending(true);

        let recipientsToSend = sendToAll
            ? users.map((u) => u._id)
            : selectedUsers;

        // Filter out invalid IDs
        recipientsToSend = recipientsToSend.filter(
            (id) => typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)
        );

        if (!title.trim() || !message.trim() || recipientsToSend.length === 0) {
            setErrorMsg("Title, message, and at least one valid recipient are required.");
            setSending(false);
            return;
        }

        // For now, only "send now" is implemented
        // You can expand this to handle scheduling in the future
        try {
            const response = await fetch(`${apiUrl}/systemNotifications/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    title,
                    message,
                    recipients: recipientsToSend,
                    // schedule: scheduleType === "schedule" ? scheduledDate : undefined,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to send notification.");
            }

            setSuccessMsg("Notification sent successfully!");
            setTitle("");
            setMessage("");
            setSelectedUsers([]);
            setSendToAll(true);
            setScheduleType("now");
            setScheduledDate("");
        } catch (error) {
            setErrorMsg(error.message || "Failed to send notification.");
        }
        setSending(false);
        setTimeout(() => setSuccessMsg(""), 2000);
        setTimeout(() => setErrorMsg(""), 2000);
    };

    return (
        <>
            <Navbar />
            <SideBar />
            <div className={styles.pageWrapper}>
                <div className={styles.grid}>
                    {/* Left Panel: Form */}
                    <div className={styles.formPanel}>
                        <div className={styles.sectionTitle}><FaBell style={{ marginRight: 8 }} />Send Notification</div>
                        <p className={styles.sectionSubtitle}>Communicate with your users instantly</p>
                        <form onSubmit={handleSend} className={styles.form}>
                            <label className={styles.label}>Notification Title</label>
                            <input
                                className={styles.input}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={60}
                                placeholder="Enter title"
                                required
                            />

                            <label className={styles.label}>Message Content</label>
                            <textarea
                                className={styles.textarea}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                maxLength={500}
                                placeholder="Write your message..."
                                required
                            />

                            <label className={styles.label}>Select Recipients</label>
                            <div className={styles.toggleOptions}>
                                <div
                                    className={`${styles.optionBox} ${sendToAll ? styles.selected : ""}`}
                                    onClick={() => setSendToAll(true)}
                                >
                                    <div className={styles.icon}><BsPeople /></div>
                                    <div>
                                        <strong>All Users</strong>
                                        <p>Send to everyone</p>
                                    </div>
                                </div>
                                <div
                                    className={`${styles.optionBox} ${!sendToAll ? styles.selected : ""}`}
                                    onClick={() => setSendToAll(false)}
                                >
                                    <div className={styles.icon}><BsPerson /></div>
                                    <div>
                                        <strong>Select Users</strong>
                                        <p>Choose specific users</p>
                                    </div>
                                </div>
                            </div>

                            {!sendToAll && (
                                <div className={styles.userSelectSection}>
                                    <input
                                        className={styles.searchInput}
                                        type="text"
                                        placeholder="Search users by name or email"
                                        value={searchUser}
                                        onChange={(e) => setSearchUser(e.target.value)}
                                    />
                                    <div className={styles.selectActions}>
                                        <button
                                            type="button"
                                            className={styles.selectBtn}
                                            onClick={handleSelectAll}
                                            disabled={filteredUsers.length === 0}
                                        >
                                            Select All
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.selectBtn}
                                            onClick={handleClearAll}
                                            disabled={selectedUsers.length === 0}
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className={styles.usersList}>
                                        {loading ? (
                                            <div>Loading users...</div>
                                        ) : filteredUsers.length === 0 ? (
                                            <div>No users found.</div>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <label key={user._id} className={styles.userItem}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.includes(user._id)}
                                                        onChange={() => handleUserSelect(user._id)}
                                                    />
                                                    {user.name} <span className={styles.userEmail}>({user.email})</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            <label className={styles.label}>Delivery Schedule</label>
                            <div className={styles.toggleOptions}>
                                <div
                                    className={`${styles.optionBox} ${scheduleType === "now" ? styles.selected : ""}`}
                                    onClick={() => setScheduleType("now")}
                                >
                                    <div className={styles.icon}><BsRocket /></div>
                                    <div>
                                        <strong>Send Now</strong>
                                        <p>Immediate delivery</p>
                                    </div>
                                </div>
                                <div
                                    className={`${styles.optionBox} ${scheduleType === "schedule" ? styles.selected : ""}`}
                                    onClick={() => setScheduleType("schedule")}
                                >
                                    <div className={styles.icon}><BsCalendar /></div>
                                    <div>
                                        <strong>Schedule</strong>
                                        <p>Send later</p>
                                    </div>
                                </div>
                            </div>
                            {scheduleType === "schedule" && (
                                <input
                                    className={styles.input}
                                    type="datetime-local"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                    required
                                />
                            )}

                            <button
                                type="submit"
                                className={styles.sendButton}
                                disabled={sending}
                            >
                                {sending ? "Sending..." : "Send Notification"}
                            </button>

                            {successMsg && (
                                <div className={styles.success}><BsCheckCircle style={{ marginRight: 6 }} />{successMsg}</div>
                            )}
                            {errorMsg && (
                                <div className={styles.error}><BsExclamationCircle style={{ marginRight: 6 }} />{errorMsg}</div>
                            )}
                        </form>
                    </div>

                    {/* Right Panel: Preview & History */}
                    <div className={styles.previewPanel}>
                        <div className={styles.activeUsers}>
                            <span className={styles.dot}></span>
                            <BsPeople style={{ marginRight: 4 }} />
                            {activeUsers.toLocaleString()} Active Users
                        </div>

                        <div className={styles.livePreview}>
                            <span className={styles.previewLabel}>Live Preview</span>
                            <div className={styles.previewBox}>
                                <strong><FaBell style={{ marginRight: 6 }} />{title || "Nexfellow Community"}</strong>
                                <p style={{ marginTop: 8 }}>{message || "Your message will appear here."}</p>
                                <span className={styles.previewTime}>Just now</span>
                            </div>
                        </div>

                        <div className={styles.recentSection}>
                            <span className={styles.previewLabel}>Recent Notifications Sent</span>
                            <ul className={styles.recentList}>
                                {loadingRecent ? (
                                    <li>Loading...</li>
                                ) : (recentNotifications.length === 0 ? (
                                    <li>No notifications sent yet.</li>
                                ) : recentNotifications.map((noti, idx) => (
                                    <li key={idx}>
                                        <BsCheckCircle style={{ color: "#2ecc40", marginRight: 6 }} />
                                        {noti.title}
                                        <span>
                                            {noti.time} · {noti.recipients.toLocaleString()} recipients
                                        </span>
                                    </li>
                                )))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Notifications;
