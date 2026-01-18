'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { BsCheckCircle, BsExclamationCircle, BsPeople, BsPerson, BsRocket, BsCalendar } from 'react-icons/bs';
import { FaBell } from 'react-icons/fa';
import { toast } from 'sonner';
import { safeFetch, getAdminId } from '@/lib/safeFetch';

interface User {
    _id: string;
    name: string;
    email: string;
    createdAt?: string;
}

interface RecentNotification {
    title: string;
    time: string;
    recipients: number;
}

export default function NotificationsPage() {
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
    const [scheduleType, setScheduleType] = useState<'now' | 'schedule'>('now');
    const [scheduledDate, setScheduledDate] = useState('');
    const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([]);
    const [loadingRecent, setLoadingRecent] = useState(false);
    const [activeUsers, setActiveUsers] = useState(0);

    useEffect(() => {
        const fetchActiveUsers = async () => {
            try {
                const res = await safeFetch(`${apiUrl}/admin/active-users/count`);
                if (res.ok) {
                    const data = await res.json();
                    setActiveUsers(data.activeUsers || 0);
                }
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
                const res = await safeFetch(`${apiUrl}/admin/recent-notifications`);
                if (res.ok) {
                    const data = await res.json();
                    setRecentNotifications(
                        data.map((n: { title: string; time: string; recipients: number }) => ({
                            ...n,
                            time: timeAgo(n.time),
                        }))
                    );
                }
            } catch {
                setRecentNotifications([]);
            } finally {
                setLoadingRecent(false);
            }
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
            setLoading(true);
            try {
                const res = await safeFetch(`${apiUrl}/admin/${adminId}/registered-users`);
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data.sort((a: User, b: User) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
                }
            } catch {
                console.error('Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        if (adminId) fetchUsers();
    }, [apiUrl, adminId]);

    const handleUserSelect = (id: string) => {
        setSelectedUsers((prev) => (prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]));
    };

    const handleSelectAll = () => {
        setSelectedUsers(filteredUsers.map((user) => user._id));
    };

    const handleClearAll = () => {
        setSelectedUsers([]);
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchUser.toLowerCase())
    );

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        let recipientsToSend = sendToAll ? users.map((u) => u._id) : selectedUsers;
        recipientsToSend = recipientsToSend.filter((id) => typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id));

        if (!title.trim() || !message.trim() || recipientsToSend.length === 0) {
            toast.error('Title, message, and at least one valid recipient are required.');
            setSending(false);
            return;
        }

        try {
            const res = await safeFetch(`${apiUrl}/systemNotifications/send`, {
                method: 'POST',
                body: JSON.stringify({ title, message, recipients: recipientsToSend }),
            });

            if (res.ok) {
                toast.success('Notification sent successfully!');
                setTitle('');
                setMessage('');
                setSelectedUsers([]);
                setSendToAll(true);
                setScheduleType('now');
                setScheduledDate('');
            } else {
                toast.error('Failed to send notification.');
            }
        } catch {
            toast.error('Failed to send notification.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Form */}
                <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <FaBell className="text-teal-400" />
                        <h2 className="text-xl font-semibold text-white">Send Notification</h2>
                    </div>
                    <p className="text-slate-400 text-sm mb-6">Communicate with your users instantly</p>

                    <form onSubmit={handleSend} className="space-y-4">
                        <div>
                            <label className="block text-slate-300 text-sm mb-2">Notification Title</label>
                            <input
                                type="text"
                                placeholder="Enter title"
                                maxLength={60}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 text-sm mb-2">Message Content</label>
                            <textarea
                                placeholder="Write your message..."
                                maxLength={500}
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 text-sm mb-2">Select Recipients</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div
                                    className={`p-4 rounded-lg cursor-pointer border-2 transition-colors ${sendToAll ? 'border-teal-500 bg-teal-500/10' : 'border-slate-600 bg-slate-700'
                                        }`}
                                    onClick={() => setSendToAll(true)}
                                >
                                    <BsPeople className="text-2xl text-teal-400 mb-2" />
                                    <p className="text-white font-medium">All Users</p>
                                    <p className="text-slate-400 text-sm">Send to everyone</p>
                                </div>
                                <div
                                    className={`p-4 rounded-lg cursor-pointer border-2 transition-colors ${!sendToAll ? 'border-teal-500 bg-teal-500/10' : 'border-slate-600 bg-slate-700'
                                        }`}
                                    onClick={() => setSendToAll(false)}
                                >
                                    <BsPerson className="text-2xl text-teal-400 mb-2" />
                                    <p className="text-white font-medium">Select Users</p>
                                    <p className="text-slate-400 text-sm">Choose specific users</p>
                                </div>
                            </div>
                        </div>

                        {!sendToAll && (
                            <div className="bg-slate-700/50 rounded-lg p-4">
                                <input
                                    type="text"
                                    placeholder="Search users by name or email"
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 mb-3"
                                    value={searchUser}
                                    onChange={(e) => setSearchUser(e.target.value)}
                                />
                                <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        className="px-3 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-500"
                                        onClick={handleSelectAll}
                                        disabled={filteredUsers.length === 0}
                                    >
                                        Select All
                                    </button>
                                    <button
                                        type="button"
                                        className="px-3 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-500"
                                        onClick={handleClearAll}
                                        disabled={selectedUsers.length === 0}
                                    >
                                        Clear All
                                    </button>
                                    <span className="text-slate-400 text-sm ml-auto">{selectedUsers.length} selected</span>
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-2">
                                    {loading ? (
                                        <p className="text-slate-400">Loading users...</p>
                                    ) : filteredUsers.length === 0 ? (
                                        <p className="text-slate-400">No users found.</p>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <label key={user._id} className="flex items-center gap-3 p-2 hover:bg-slate-600 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user._id)}
                                                    onChange={() => handleUserSelect(user._id)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-white">{user.name}</span>
                                                <span className="text-slate-400 text-sm">({user.email})</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-slate-300 text-sm mb-2">Delivery Schedule</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div
                                    className={`p-4 rounded-lg cursor-pointer border-2 transition-colors ${scheduleType === 'now' ? 'border-teal-500 bg-teal-500/10' : 'border-slate-600 bg-slate-700'
                                        }`}
                                    onClick={() => setScheduleType('now')}
                                >
                                    <BsRocket className="text-2xl text-teal-400 mb-2" />
                                    <p className="text-white font-medium">Send Now</p>
                                    <p className="text-slate-400 text-sm">Immediate delivery</p>
                                </div>
                                <div
                                    className={`p-4 rounded-lg cursor-pointer border-2 transition-colors ${scheduleType === 'schedule' ? 'border-teal-500 bg-teal-500/10' : 'border-slate-600 bg-slate-700'
                                        }`}
                                    onClick={() => setScheduleType('schedule')}
                                >
                                    <BsCalendar className="text-2xl text-teal-400 mb-2" />
                                    <p className="text-white font-medium">Schedule</p>
                                    <p className="text-slate-400 text-sm">Send later</p>
                                </div>
                            </div>
                        </div>

                        {scheduleType === 'schedule' && (
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                required
                            />
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                            disabled={sending}
                        >
                            {sending ? 'Sending...' : 'Send Notification'}
                        </button>
                    </form>
                </div>

                {/* Right Panel: Preview & History */}
                <div className="space-y-6">
                    <div className="bg-slate-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <BsPeople className="text-slate-400" />
                            <span className="text-white">{activeUsers.toLocaleString()} Active Users</span>
                        </div>

                        <div className="mb-4">
                            <span className="text-slate-400 text-sm">Live Preview</span>
                            <div className="mt-2 bg-slate-700 rounded-lg p-4">
                                <p className="text-white font-medium flex items-center gap-2">
                                    <FaBell className="text-teal-400" />
                                    {title || 'Nexfellow Community'}
                                </p>
                                <p className="text-slate-300 mt-2">{message || 'Your message will appear here.'}</p>
                                <span className="text-slate-500 text-xs mt-2 block">Just now</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-6">
                        <span className="text-slate-400 text-sm">Recent Notifications Sent</span>
                        <ul className="mt-3 space-y-2">
                            {loadingRecent ? (
                                <li className="text-slate-400">Loading...</li>
                            ) : recentNotifications.length === 0 ? (
                                <li className="text-slate-400">No notifications sent yet.</li>
                            ) : (
                                recentNotifications.map((noti, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                        <BsCheckCircle className="text-green-400 mt-0.5" />
                                        <div>
                                            <p className="text-white">{noti.title}</p>
                                            <p className="text-slate-400 text-xs">{noti.time} · {noti.recipients.toLocaleString()} recipients</p>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
