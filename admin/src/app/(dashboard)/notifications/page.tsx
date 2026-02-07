'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { BsCheckCircle, BsPeople, BsPerson, BsEye } from 'react-icons/bs';
import { FaBell, FaPaperPlane } from 'react-icons/fa';
import { IoRocketOutline, IoCalendarOutline } from 'react-icons/io5';
import { toast } from 'sonner';
import { safeFetch } from '@/lib/safeFetch';

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
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
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
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Send Notification</h1>
                    <p className="text-gray-500 mt-1">Communicate with your users instantly</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-gray-700 font-medium">{activeUsers.toLocaleString()} Active Users</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSend} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        {/* Notification Title */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-2">Notification Title</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter notification title..."
                                    maxLength={60}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                    {title.length}/60
                                </span>
                            </div>
                        </div>

                        {/* Message Content */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-2">Message Content</label>
                            <div className="relative">
                                <textarea
                                    placeholder="Write your notification message here..."
                                    maxLength={500}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                                <span className="absolute right-4 bottom-3 text-gray-400 text-sm">
                                    {message.length}/500
                                </span>
                            </div>
                        </div>

                        {/* Select Recipients */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-3">Select Recipients</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    className={`p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 ${sendToAll
                                            ? 'border-teal-500 bg-teal-50 shadow-sm'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    onClick={() => setSendToAll(true)}
                                >
                                    <BsPeople className={`text-2xl mb-3 ${sendToAll ? 'text-teal-600' : 'text-gray-400'}`} />
                                    <p className={`font-semibold ${sendToAll ? 'text-teal-700' : 'text-gray-700'}`}>All Users</p>
                                    <p className="text-gray-500 text-sm mt-1">Send to everyone</p>
                                </div>
                                <div
                                    className={`p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 ${!sendToAll
                                            ? 'border-teal-500 bg-teal-50 shadow-sm'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    onClick={() => setSendToAll(false)}
                                >
                                    <BsPerson className={`text-2xl mb-3 ${!sendToAll ? 'text-teal-600' : 'text-gray-400'}`} />
                                    <p className={`font-semibold ${!sendToAll ? 'text-teal-700' : 'text-gray-700'}`}>Select Users</p>
                                    <p className="text-gray-500 text-sm mt-1">Choose specific users</p>
                                </div>
                            </div>
                        </div>

                        {/* User Selection Panel */}
                        {!sendToAll && (
                            <div className="mb-6 bg-gray-50 rounded-xl p-5 border border-gray-200">
                                <input
                                    type="text"
                                    placeholder="Search users by name or email"
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
                                    value={searchUser}
                                    onChange={(e) => setSearchUser(e.target.value)}
                                />
                                <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-200 transition-colors"
                                        onClick={handleSelectAll}
                                        disabled={filteredUsers.length === 0}
                                    >
                                        Select All
                                    </button>
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                                        onClick={handleClearAll}
                                        disabled={selectedUsers.length === 0}
                                    >
                                        Clear All
                                    </button>
                                    <span className="text-gray-500 text-sm ml-auto self-center">{selectedUsers.length} selected</span>
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-2">
                                    {loading ? (
                                        <p className="text-gray-500">Loading users...</p>
                                    ) : filteredUsers.length === 0 ? (
                                        <p className="text-gray-500">No users found.</p>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <label key={user._id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user._id)}
                                                    onChange={() => handleUserSelect(user._id)}
                                                    className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                                                />
                                                <span className="text-gray-900">{user.name}</span>
                                                <span className="text-gray-500 text-sm">({user.email})</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Delivery Schedule */}
                        <div className="mb-8">
                            <label className="block text-gray-700 font-medium mb-3">Delivery Schedule</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    className={`p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 ${scheduleType === 'now'
                                            ? 'border-teal-500 bg-teal-50 shadow-sm'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    onClick={() => setScheduleType('now')}
                                >
                                    <IoRocketOutline className={`text-2xl mb-3 ${scheduleType === 'now' ? 'text-teal-600' : 'text-gray-400'}`} />
                                    <p className={`font-semibold ${scheduleType === 'now' ? 'text-teal-700' : 'text-gray-700'}`}>Send Now</p>
                                    <p className="text-gray-500 text-sm mt-1">Immediate delivery</p>
                                </div>
                                <div
                                    className={`p-5 rounded-xl cursor-pointer border-2 transition-all duration-200 ${scheduleType === 'schedule'
                                            ? 'border-teal-500 bg-teal-50 shadow-sm'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    onClick={() => setScheduleType('schedule')}
                                >
                                    <IoCalendarOutline className={`text-2xl mb-3 ${scheduleType === 'schedule' ? 'text-teal-600' : 'text-gray-400'}`} />
                                    <p className={`font-semibold ${scheduleType === 'schedule' ? 'text-teal-700' : 'text-gray-700'}`}>Schedule</p>
                                    <p className="text-gray-500 text-sm mt-1">Send later</p>
                                </div>
                            </div>
                        </div>

                        {scheduleType === 'schedule' && (
                            <div className="mb-8">
                                <input
                                    type="datetime-local"
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                    required
                                />
                            </div>
                        )}

                        {/* Send Button */}
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-teal-200 hover:shadow-xl hover:shadow-teal-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={sending}
                            >
                                <FaPaperPlane className="text-sm" />
                                {sending ? 'Sending...' : 'Send Notification'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Panel: Preview & History */}
                <div className="space-y-6">
                    {/* Live Preview */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <BsEye className="text-gray-400" />
                            <span className="text-gray-600 font-medium">Live Preview</span>
                        </div>
                        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-lg">N</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <FaBell className="text-gray-400 text-sm" />
                                        <p className="font-semibold text-gray-900 truncate">
                                            {title || 'Nexfellow Community'}
                                        </p>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                        {message || 'New AI/ML Community launched 🚀. Visit Explore page now!'}
                                    </p>
                                    <span className="text-gray-400 text-xs mt-2 block">Just now</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Notifications */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-gray-700 font-medium mb-4">Recent Notifications Sent</h3>
                        <ul className="space-y-4">
                            {loadingRecent ? (
                                <li className="text-gray-500">Loading...</li>
                            ) : recentNotifications.length === 0 ? (
                                <li className="text-gray-500">No notifications sent yet.</li>
                            ) : (
                                recentNotifications.map((noti, idx) => (
                                    <li key={idx} className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-2 flex-1 min-w-0">
                                            <BsCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-gray-900 font-medium truncate">{noti.title}</p>
                                                <p className="text-gray-500 text-sm">{noti.time}</p>
                                            </div>
                                        </div>
                                        <span className="text-gray-500 text-sm whitespace-nowrap">
                                            {noti.recipients.toLocaleString()} recipients
                                        </span>
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
