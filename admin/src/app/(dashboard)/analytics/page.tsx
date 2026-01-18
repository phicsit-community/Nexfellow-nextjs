'use client';

import { useState, useEffect } from 'react';
import {
    BsPeople, BsCardText, BsActivity, BsChatDots, BsBookmarkCheck,
    BsAward, BsCalendar2Check, BsFlag, BsHandThumbsUp, BsGift,
    BsPersonWorkspace, BsEnvelope, BsBarChart
} from 'react-icons/bs';
import Loader from '@/components/Loader/Loader';
import { safeFetch } from '@/lib/safeFetch';

interface AnalyticsData {
    totalUsers?: number;
    totalPosts?: number;
    activeUsers?: number;
    totalComments?: number;
    totalBookmarks?: number;
    totalQuizzes?: number;
    totalEvents?: number;
    totalChallenges?: number;
    totalLikes?: number;
    totalRewards?: number;
    totalCommunities?: number;
    totalNotifications?: number;
    totalUsersDelta?: number;
    postsDelta?: number;
    activeUsersDelta?: number;
    commentsDelta?: number;
    userGrowth?: { label: string; value: number }[];
    postGrowth?: { label: string; value: number }[];
    activeUsersChart?: { label: string; value: number }[];
}

const metricDefs = [
    { key: 'totalUsers', label: 'Total Users', icon: BsPeople, color: '#2563eb', deltaKey: 'totalUsersDelta' },
    { key: 'totalPosts', label: 'Posts', icon: BsCardText, color: '#fb923c', deltaKey: 'postsDelta' },
    { key: 'activeUsers', label: 'Active Users (30d)', icon: BsActivity, color: '#16a34a', deltaKey: 'activeUsersDelta' },
    { key: 'totalComments', label: 'Comments', icon: BsChatDots, color: '#8b5cf6', deltaKey: 'commentsDelta' },
    { key: 'totalBookmarks', label: 'Bookmarks', icon: BsBookmarkCheck, color: '#2563eb' },
    { key: 'totalQuizzes', label: 'Quizzes', icon: BsAward, color: '#fb923c' },
    { key: 'totalEvents', label: 'Events', icon: BsCalendar2Check, color: '#16a34a' },
    { key: 'totalChallenges', label: 'Challenges', icon: BsFlag, color: '#8b5cf6' },
    { key: 'totalLikes', label: 'Likes', icon: BsHandThumbsUp, color: '#2563eb' },
    { key: 'totalRewards', label: 'Rewards', icon: BsGift, color: '#fb923c' },
    { key: 'totalCommunities', label: 'Communities', icon: BsPersonWorkspace, color: '#16a34a' },
    { key: 'totalNotifications', label: 'Notifications Sent', icon: BsEnvelope, color: '#8b5cf6' },
];

function formatDelta(delta?: number) {
    if (typeof delta !== 'number' || isNaN(delta)) return null;
    return {
        icon: delta < 0 ? '▼' : '▲',
        color: delta < 0 ? '#e11d48' : '#16a34a',
        value: Math.abs(delta).toFixed(2),
    };
}

function MetricCard({ label, value, Icon, color, delta }: {
    label: string;
    value?: number;
    Icon: React.ElementType;
    color: string;
    delta?: { icon: string; color: string; value: string } | null;
}) {
    return (
        <div className="bg-slate-700 rounded-xl p-3 md:p-5 flex items-start gap-2 md:gap-4 min-w-0">
            <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: color + '20' }}
            >
                <Icon className="text-lg md:text-xl" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
                <div className="text-xl md:text-2xl font-bold text-white truncate">
                    {value !== undefined && value !== null ? value.toLocaleString() : '—'}
                </div>
                <div className="text-slate-400 text-xs md:text-sm truncate">{label}</div>
                {delta && (
                    <div className="text-xs md:text-sm mt-1 truncate" style={{ color: delta.color }}>
                        {delta.icon} {delta.value}%
                    </div>
                )}
            </div>
        </div>
    );
}

function SimpleChart({ data, color, label }: { data: { label: string; value: number }[]; color: string; label: string }) {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="bg-slate-700 rounded-xl p-4 md:p-6 overflow-hidden">
            <h3 className="text-white font-semibold mb-4 text-sm md:text-base">{label}</h3>
            <div className="overflow-x-auto">
                <div className="flex items-end gap-1 h-32 md:h-40 min-w-[400px]">
                    {data.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center min-w-[20px]">
                            <div
                                className="w-full rounded-t transition-all duration-300"
                                style={{
                                    height: `${(d.value / max) * 100}%`,
                                    backgroundColor: color,
                                    minHeight: '4px',
                                }}
                            />
                            <span className="text-[8px] md:text-xs text-slate-400 mt-2 truncate w-full text-center">{d.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-4 text-right text-xs md:text-sm text-slate-400">
                Latest: <span className="text-white font-semibold">{data[data.length - 1]?.value.toLocaleString()}</span>
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [stats, setStats] = useState<AnalyticsData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const res = await safeFetch(`${apiUrl}/admin/analytics/overview`);
                if (!res.ok) throw new Error('Failed to fetch analytics');
                const data = await res.json();
                setStats(data);
            } catch (err) {
                setError((err as Error).message || 'Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [apiUrl]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-3 md:p-6 overflow-hidden">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
                <BsBarChart className="text-xl md:text-2xl text-teal-400 flex-shrink-0" />
                <div className="min-w-0">
                    <h1 className="text-xl md:text-2xl font-semibold text-white truncate">Platform Analytics</h1>
                    <p className="text-slate-400 text-xs md:text-base truncate">Actionable, real-time insights for data-driven decisions</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {metricDefs.map((m) => (
                    <MetricCard
                        key={m.key}
                        label={m.label}
                        value={(stats as Record<string, number | undefined>)[m.key]}
                        Icon={m.icon}
                        color={m.color}
                        delta={m.deltaKey ? formatDelta((stats as Record<string, number | undefined>)[m.deltaKey]) : undefined}
                    />
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <SimpleChart
                    data={stats.userGrowth || []}
                    color="#10b981"
                    label="User Growth (12 months)"
                />
                <SimpleChart
                    data={stats.postGrowth || []}
                    color="#fb923c"
                    label="Posts Trend (12 months)"
                />
                <SimpleChart
                    data={stats.activeUsersChart || []}
                    color="#2563eb"
                    label="Daily Active Users (30 days)"
                />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-slate-800 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">Engagement Rate</h3>
                    <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold text-teal-400">
                            {stats.totalUsers && stats.activeUsers
                                ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)
                                : '0'}
                            %
                        </div>
                        <div className="text-slate-400">
                            <p>of users are active</p>
                            <p className="text-sm">in the last 30 days</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">Content per User</h3>
                    <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold text-orange-400">
                            {stats.totalUsers && stats.totalPosts
                                ? (stats.totalPosts / stats.totalUsers).toFixed(2)
                                : '0'}
                        </div>
                        <div className="text-slate-400">
                            <p>posts per user</p>
                            <p className="text-sm">average across platform</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
