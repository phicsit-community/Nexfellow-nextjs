'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BsCheckCircle, BsExclamationCircle, BsPeople, BsPerson, BsRocket, BsCalendar } from 'react-icons/bs';
import { FaBell } from 'react-icons/fa';
import type { RootState } from '@/lib/store/store';
import styles from './Notifications.module.css';

interface User {
    _id: string;
    name: string;
    email: string;
}

interface RecentNotification {
    title: string;
    time: string;
    recipients: number;
}

export function NotificationsClient() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const { user } = useSelector((state: RootState) => state.user);
    const adminId = user;

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [sendToAll, setSendToAll] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [searchUser, setSearchUser] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [scheduleType, setScheduleType] = useState<'now' | 'schedule'>('now');
    const [scheduledDate, setScheduledDate] = useState('');
    const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([]);
    const [loadingRecent, setLoadingRecent] = useState(false);
    const [activeUsers, setActiveUsers] = useState(0);

    useEffect(() => {
        const fetchActiveUsers = async () => {
            try {
                const res = await fetch(`${apiUrl}/admin/active-users/count`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Failed');
                const data = await res.json();
                setActiveUsers(data.activeUsers);
            } catch {
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
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Failed to fetch recent notifications');
                const data = await res.json();
                setRecentNotifications(
                    data.map((n: any) => ({
                        ...n,
                        time: timeAgo(n.time),
                    }))
                );
            } catch {
                setRecentNotifications([]);
            }
            setLoadingRecent(false);
        };
        fetchRecentNotifications();
    }, [apiUrl]);

    function timeAgo(dateStr: string) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    useEffect(() => {
        const fetchUsers = async () => {
            if (!adminId) return;
            setLoading(true);
            try {
                const response = await fetch(
                    `${apiUrl}/admin/${adminId}/registered-users`,
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                    }
                );
                if (!response.ok) throw new Error('Failed to fetch users');
                const result = await response.json();
                setUsers(result.sort((a: User, b: User) =>
                    new Date(b._id).getTime() - new Date(a._id).getTime()
                ));
            } catch {
                setErrorMsg('Failed to load users.');
            }
            setLoading(false);
        };

        fetchUsers();
    }, [apiUrl, adminId]);

    const handleUserSelect = (id: string) => {
        setSelectedUsers((prev) =>
            prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
        );
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchUser.toLowerCase())
    );

    const handleSelectAll = () => {
        setSelectedUsers(filteredUsers.map((user) => user._id));
    };

    const handleClearAll = () => {
        setSelectedUsers([]);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg('');
        setErrorMsg('');
        setSending(true);

        let recipientsToSend = sendToAll
            ? users.map((u) => u._id)
            : selectedUsers;

        recipientsToSend = recipientsToSend.filter(
            (id) => typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)
        );

        if (!title.trim() || !message.trim() || recipientsToSend.length === 0) {
            setErrorMsg('Title, message, and at least one valid recipient are required.');
            setSending(false);
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/systemNotifications/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    title,
                    message,
                    recipients: recipientsToSend,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to send notification.');
            }

            setSuccessMsg('Notification sent successfully!');
            setTitle('');
            setMessage('');
            setSelectedUsers([]);
            setSendToAll(true);
            setScheduleType('now');
            setScheduledDate('');
        } catch (error: any) {
            setErrorMsg(error.message || 'Failed to send notification.');
        }
        setSending(false);
        setTimeout(() => setSuccessMsg(''), 2000);
        setTimeout(() => setErrorMsg(''), 2000);
    };

    return (
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
                                className={`${styles.optionBox} ${sendToAll ? styles.selected : ''}`}
                                onClick={() => setSendToAll(true)}
                            >
                                <div className={styles.icon}><BsPeople /></div>
                                <div>
                                    <strong>All Users</strong>
                                    <p>Send to everyone</p>
                                </div>
                            </div>
                            <div
                                className={`${styles.optionBox} ${!sendToAll ? styles.selected : ''}`}
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
                                className={`${styles.optionBox} ${scheduleType === 'now' ? styles.selected : ''}`}
                                onClick={() => setScheduleType('now')}
                            >
                                <div className={styles.icon}><BsRocket /></div>
                                <div>
                                    <strong>Send Now</strong>
                                    <p>Immediate delivery</p>
                                </div>
                            </div>
                            <div
                                className={`${styles.optionBox} ${scheduleType === 'schedule' ? styles.selected : ''}`}
                                onClick={() => setScheduleType('schedule')}
                            >
                                <div className={styles.icon}><BsCalendar /></div>
                                <div>
                                    <strong>Schedule</strong>
                                    <p>Send later</p>
                                </div>
                            </div>
                        </div>
                        {scheduleType === 'schedule' && (
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
                            {sending ? 'Sending...' : 'Send Notification'}
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
                            <strong><FaBell style={{ marginRight: 6 }} />{title || 'Nexfellow Community'}</strong>
                            <p style={{ marginTop: 8 }}>{message || 'Your message will appear here.'}</p>
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
                                    <BsCheckCircle style={{ color: '#2ecc40', marginRight: 6 }} />
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
    );
}
