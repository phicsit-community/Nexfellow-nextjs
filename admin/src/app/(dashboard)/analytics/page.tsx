'use client';

import { useState, useEffect } from 'react';
import {
    BsPeople, BsChatSquare, BsActivity, BsHeart, BsBook,
    BsAward, BsCalendar2Check, BsTrophy, BsHandThumbsUp, BsStar,
    BsGlobe, BsBell
} from 'react-icons/bs';
import { FiTrendingUp } from 'react-icons/fi';
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
    bookmarksDelta?: number;
    quizzesDelta?: number;
    eventsDelta?: number;
    challengesDelta?: number;
    likesDelta?: number;
    rewardsDelta?: number;
    communitiesDelta?: number;
    notificationsDelta?: number;
    userGrowth?: { label: string; value: number }[];
    postGrowth?: { label: string; value: number }[];
    activeUsersChart?: { label: string; value: number }[];
    roleDistribution?: Record<string, number>;
    countryDistribution?: Record<string, number>;
}

const metricDefs = [
    { key: 'totalUsers', label: 'Total Users', icon: BsPeople, gradient: 'from-blue-400 to-blue-600', bgTint: 'bg-blue-50', deltaKey: 'totalUsersDelta' },
    { key: 'totalPosts', label: 'Posts', icon: BsChatSquare, gradient: 'from-orange-400 to-orange-600', bgTint: 'bg-orange-50', deltaKey: 'postsDelta' },
    { key: 'activeUsers', label: 'Active Users (30d)', icon: BsActivity, gradient: 'from-green-400 to-green-600', bgTint: 'bg-green-50', deltaKey: 'activeUsersDelta' },
    { key: 'totalComments', label: 'Comments', icon: BsHeart, gradient: 'from-purple-400 to-purple-600', bgTint: 'bg-purple-50', deltaKey: 'commentsDelta' },
    { key: 'totalBookmarks', label: 'Bookmarks', icon: BsBook, gradient: 'from-blue-400 to-blue-600', bgTint: 'bg-blue-50', deltaKey: 'bookmarksDelta' },
    { key: 'totalQuizzes', label: 'Quizzes', icon: BsAward, gradient: 'from-orange-400 to-orange-600', bgTint: 'bg-orange-50', deltaKey: 'quizzesDelta' },
    { key: 'totalEvents', label: 'Events', icon: BsCalendar2Check, gradient: 'from-green-400 to-green-600', bgTint: 'bg-green-50', deltaKey: 'eventsDelta' },
    { key: 'totalChallenges', label: 'Challenges', icon: BsTrophy, gradient: 'from-purple-400 to-purple-600', bgTint: 'bg-purple-50', deltaKey: 'challengesDelta' },
    { key: 'totalLikes', label: 'Likes', icon: BsHandThumbsUp, gradient: 'from-blue-400 to-blue-600', bgTint: 'bg-blue-50', deltaKey: 'likesDelta' },
    { key: 'totalRewards', label: 'Rewards', icon: BsStar, gradient: 'from-orange-400 to-orange-600', bgTint: 'bg-orange-50', deltaKey: 'rewardsDelta' },
    { key: 'totalCommunities', label: 'Communities', icon: BsGlobe, gradient: 'from-green-400 to-green-600', bgTint: 'bg-green-50', deltaKey: 'communitiesDelta' },
    { key: 'totalNotifications', label: 'Notifications Sent', icon: BsBell, gradient: 'from-purple-400 to-purple-600', bgTint: 'bg-purple-50', deltaKey: 'notificationsDelta' },
];

function formatDelta(delta?: number) {
    if (typeof delta !== 'number' || isNaN(delta)) return null;
    return {
        isPositive: delta >= 0,
        value: Math.abs(delta).toFixed(1),
    };
}

function MetricCard({ label, value, Icon, gradient, bgTint, delta }: {
    label: string;
    value?: number;
    Icon: React.ElementType;
    gradient: string;
    bgTint: string;
    delta?: { isPositive: boolean; value: string } | null;
}) {
    return (
        <div className={`${bgTint} rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-500 text-sm mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {value !== undefined && value !== null ? value.toLocaleString() : '—'}
                    </p>
                    {delta && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${delta.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                            <FiTrendingUp className={`text-xs ${!delta.isPositive ? 'rotate-180' : ''}`} />
                            <span>{delta.isPositive ? '+' : '-'}{delta.value}%</span>
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="text-xl text-white" />
                </div>
            </div>
        </div>
    );
}

function UserGrowthChart({ data }: { data: { label: string; value: number }[] }) {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map(d => d.value), 1);
    const currentValue = data[data.length - 1]?.value || 0;
    const currentLabel = data[data.length - 1]?.label || '';

    // Nice round Y-axis ticks (0, 250, 500, 750, 1000 style)
    const step = Math.ceil(max / 4 / 50) * 50 || Math.ceil(max / 4);
    const yMax = step * 4;
    const ticks = [yMax, step * 3, step * 2, step, 0];

    // SVG chart dimensions
    const svgW = 1040;
    const svgH = 320;
    const plotL = 64;   // ~6.2% of svgW
    const plotR = svgW - 5;  // ~0.48% from right
    const plotT = 5;    // ~1.56% of svgH
    const plotB = 285;  // ~89.06% of svgH
    const plotW = plotR - plotL;
    const plotH = plotB - plotT;

    const points = data.map((d, i) => ({
        x: plotL + (i / (data.length - 1)) * plotW,
        y: plotB - (d.value / yMax) * plotH,
    }));

    // Generate smooth bezier curve
    const pathD = points.reduce((acc, p, i, arr) => {
        if (i === 0) return `M ${p.x},${p.y}`;
        const prev = arr[i - 1];
        const cpx1 = prev.x + (p.x - prev.x) * 0.4;
        const cpx2 = p.x - (p.x - prev.x) * 0.4;
        return `${acc} C ${cpx1},${prev.y} ${cpx2},${p.y} ${p.x},${p.y}`;
    }, '');

    return (
        <div
            className="rounded-lg p-6"
            style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(249, 250, 251, 0.5) 100%), #FFFFFF',
                boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)' }}
                >
                    <FiTrendingUp className="text-white" size={20} />
                </div>
                <span style={{ color: '#020817', fontWeight: 600, fontSize: '18px', letterSpacing: '-0.45px' }}>
                    User Growth (12mo)
                </span>
                <span style={{ color: '#64748B', fontSize: '14px', marginLeft: '2px' }}>
                    - Current: {currentValue.toLocaleString()} users in {currentLabel}
                </span>
            </div>

            {/* Chart SVG */}
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: '320px' }} preserveAspectRatio="xMidYMid meet">
                {/* Horizontal dashed grid lines */}
                {[0, 1, 2, 3, 4].map(i => {
                    const y = plotB - (i / 4) * plotH;
                    return <line key={`hg-${i}`} x1={plotL} y1={y} x2={plotR} y2={y} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />;
                })}

                {/* Vertical dashed grid lines */}
                {data.map((_, i) => {
                    const x = plotL + (i / (data.length - 1)) * plotW;
                    return <line key={`vg-${i}`} x1={x} y1={plotT} x2={x} y2={plotB} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />;
                })}

                {/* Y-axis solid line */}
                <line x1={plotL} y1={plotT} x2={plotL} y2={plotB} stroke="#6B7280" strokeWidth="1" />
                {/* X-axis solid line */}
                <line x1={plotL} y1={plotB} x2={plotR} y2={plotB} stroke="#6B7280" strokeWidth="1" />

                {/* Y-axis labels and tick marks */}
                {ticks.map((t, i) => {
                    const y = plotB - (t / yMax) * plotH;
                    return (
                        <g key={`yt-${i}`}>
                            <line x1={plotL - 4} y1={y} x2={plotL} y2={y} stroke="#6B7280" strokeWidth="1" />
                            <text x={plotL - 8} y={y + 4} textAnchor="end" fill="#64748B" fontSize="12" fontFamily="Inter, sans-serif">
                                {t}
                            </text>
                        </g>
                    );
                })}

                {/* X-axis labels and tick marks */}
                {data.map((d, i) => {
                    const x = plotL + (i / (data.length - 1)) * plotW;
                    return (
                        <g key={`xt-${i}`}>
                            <line x1={x} y1={plotB} x2={x} y2={plotB + 4} stroke="#6B7280" strokeWidth="1" />
                            <text x={x} y={plotB + 20} textAnchor="middle" fill="#64748B" fontSize="12" fontFamily="Inter, sans-serif">
                                {d.label}
                            </text>
                        </g>
                    );
                })}

                {/* Smooth curve line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data points - filled green with green border */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="5"
                        fill="#10B981"
                        stroke={i === points.length - 1 ? '#FFFFFF' : '#10B981'}
                        strokeWidth="2"
                    />
                ))}
            </svg>
        </div>
    );
}

function PostsTrendChart({ data }: { data: { label: string; value: number }[] }) {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map(d => d.value), 1);
    const currentValue = data[data.length - 1]?.value || 0;
    const currentLabel = data[data.length - 1]?.label || '';

    // Nice round Y-axis ticks (0, 15, 30, 45, 60 style)
    const step = Math.ceil(max / 4 / 5) * 5 || Math.ceil(max / 4);
    const yMax = step * 4;
    const ticks = [yMax, step * 3, step * 2, step, 0];

    // SVG chart dimensions (same as UserGrowthChart)
    const svgW = 1040;
    const svgH = 320;
    const plotL = 64;
    const plotR = svgW - 5;
    const plotT = 5;
    const plotB = 285;
    const plotW = plotR - plotL;
    const plotH = plotB - plotT;

    // Bar width and spacing
    const barSpacing = plotW / data.length;
    const barWidth = barSpacing * 0.65;

    return (
        <div
            className="rounded-lg p-6"
            style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(249, 250, 251, 0.5) 100%), #FFFFFF',
                boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' }}
                >
                    <BsChatSquare className="text-white" size={20} />
                </div>
                <span style={{ color: '#020817', fontWeight: 600, fontSize: '18px', letterSpacing: '-0.45px' }}>
                    Posts Trend (12mo)
                </span>
                <span style={{ color: '#64748B', fontSize: '14px', marginLeft: '2px' }}>
                    - Current: {currentValue} posts in {currentLabel}
                </span>
            </div>

            {/* Chart SVG */}
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: '320px' }} preserveAspectRatio="xMidYMid meet">
                {/* Horizontal dashed grid lines */}
                {[0, 1, 2, 3, 4].map(i => {
                    const y = plotB - (i / 4) * plotH;
                    return <line key={`hg-${i}`} x1={plotL} y1={y} x2={plotR} y2={y} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />;
                })}

                {/* Vertical dashed grid lines at each bar center */}
                {data.map((_, i) => {
                    const x = plotL + barSpacing * i + barSpacing / 2;
                    return <line key={`vg-${i}`} x1={x} y1={plotT} x2={x} y2={plotB} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />;
                })}
                {/* Left and right edge vertical dashed lines */}
                <line x1={plotL} y1={plotT} x2={plotL} y2={plotB} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />
                <line x1={plotR} y1={plotT} x2={plotR} y2={plotB} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />

                {/* Y-axis solid line */}
                <line x1={plotL} y1={plotT} x2={plotL} y2={plotB} stroke="#6B7280" strokeWidth="1" />
                {/* X-axis solid line */}
                <line x1={plotL} y1={plotB} x2={plotR} y2={plotB} stroke="#6B7280" strokeWidth="1" />

                {/* Y-axis labels and tick marks */}
                {ticks.map((t, i) => {
                    const y = plotB - (t / yMax) * plotH;
                    return (
                        <g key={`yt-${i}`}>
                            <line x1={plotL - 4} y1={y} x2={plotL} y2={y} stroke="#6B7280" strokeWidth="1" />
                            <text x={plotL - 8} y={y + 4} textAnchor="end" fill="#64748B" fontSize="12" fontFamily="Inter, sans-serif">
                                {t}
                            </text>
                        </g>
                    );
                })}

                {/* Bars */}
                {data.map((d, i) => {
                    const barH = (d.value / yMax) * plotH;
                    const x = plotL + barSpacing * i + (barSpacing - barWidth) / 2;
                    const y = plotB - barH;
                    return (
                        <rect
                            key={`bar-${i}`}
                            x={x}
                            y={y}
                            width={barWidth}
                            height={Math.max(barH, 2)}
                            fill="#F59E0B"
                            rx="0"
                        />
                    );
                })}

                {/* X-axis labels and tick marks */}
                {data.map((d, i) => {
                    const x = plotL + barSpacing * i + barSpacing / 2;
                    return (
                        <g key={`xt-${i}`}>
                            <line x1={x} y1={plotB} x2={x} y2={plotB + 4} stroke="#6B7280" strokeWidth="1" />
                            <text x={x} y={plotB + 20} textAnchor="middle" fill="#64748B" fontSize="12" fontFamily="Inter, sans-serif">
                                {d.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function DailyActiveUsersChart({ data }: { data: { label: string; value: number }[] }) {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map(d => d.value), 1);
    const currentValue = data[data.length - 1]?.value || 0;
    const currentLabel = data[data.length - 1]?.label || '';

    // Nice round Y-axis ticks (0, 55, 110, 165, 220 style)
    const step = Math.ceil(max / 4 / 5) * 5 || Math.ceil(max / 4);
    const yMax = step * 4;
    const ticks = [yMax, step * 3, step * 2, step, 0];

    // SVG chart dimensions
    const svgW = 1040;
    const svgH = 320;
    const plotL = 64;
    const plotR = svgW - 5;
    const plotT = 5;
    const plotB = 285;
    const plotW = plotR - plotL;
    const plotH = plotB - plotT;

    const points = data.map((d, i) => ({
        x: plotL + (i / (data.length - 1)) * plotW,
        y: plotB - (d.value / yMax) * plotH,
    }));

    // Generate smooth bezier curve
    const pathD = points.reduce((acc, p, i, arr) => {
        if (i === 0) return `M ${p.x},${p.y}`;
        const prev = arr[i - 1];
        const cpx1 = prev.x + (p.x - prev.x) * 0.4;
        const cpx2 = p.x - (p.x - prev.x) * 0.4;
        return `${acc} C ${cpx1},${prev.y} ${cpx2},${p.y} ${p.x},${p.y}`;
    }, '');

    // Show every Nth label so they don't overlap (30 days → show ~10 labels)
    const labelStep = Math.max(1, Math.floor(data.length / 9));

    return (
        <div
            className="rounded-lg p-6"
            style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(249, 250, 251, 0.5) 100%), #FFFFFF',
                boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}
                >
                    <BsPeople className="text-white" size={20} />
                </div>
                <span style={{ color: '#020817', fontWeight: 600, fontSize: '18px', letterSpacing: '-0.45px' }}>
                    Daily Active Users (30d)
                </span>
                <span style={{ color: '#64748B', fontSize: '14px', marginLeft: '2px' }}>
                    - Current: {currentValue} users on {currentLabel}
                </span>
            </div>

            {/* Chart SVG */}
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: '320px' }} preserveAspectRatio="xMidYMid meet">
                {/* Horizontal dashed grid lines */}
                {[0, 1, 2, 3, 4].map(i => {
                    const y = plotB - (i / 4) * plotH;
                    return <line key={`hg-${i}`} x1={plotL} y1={y} x2={plotR} y2={y} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />;
                })}

                {/* Vertical dashed grid lines at labeled points */}
                {data.map((_, i) => {
                    if (i % labelStep !== 0 && i !== data.length - 1) return null;
                    const x = plotL + (i / (data.length - 1)) * plotW;
                    return <line key={`vg-${i}`} x1={x} y1={plotT} x2={x} y2={plotB} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />;
                })}
                {/* Left and right edge vertical dashed lines */}
                <line x1={plotL} y1={plotT} x2={plotL} y2={plotB} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />
                <line x1={plotR} y1={plotT} x2={plotR} y2={plotB} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />

                {/* Y-axis solid line */}
                <line x1={plotL} y1={plotT} x2={plotL} y2={plotB} stroke="#6B7280" strokeWidth="1" />
                {/* X-axis solid line */}
                <line x1={plotL} y1={plotB} x2={plotR} y2={plotB} stroke="#6B7280" strokeWidth="1" />

                {/* Y-axis labels and tick marks */}
                {ticks.map((t, i) => {
                    const y = plotB - (t / yMax) * plotH;
                    return (
                        <g key={`yt-${i}`}>
                            <line x1={plotL - 4} y1={y} x2={plotL} y2={y} stroke="#6B7280" strokeWidth="1" />
                            <text x={plotL - 8} y={y + 4} textAnchor="end" fill="#64748B" fontSize="12" fontFamily="Inter, sans-serif">
                                {t}
                            </text>
                        </g>
                    );
                })}

                {/* X-axis labels and tick marks (every Nth + last) */}
                {data.map((d, i) => {
                    if (i % labelStep !== 0 && i !== data.length - 1) return null;
                    const x = plotL + (i / (data.length - 1)) * plotW;
                    return (
                        <g key={`xt-${i}`}>
                            <line x1={x} y1={plotB} x2={x} y2={plotB + 4} stroke="#6B7280" strokeWidth="1" />
                            <text x={x} y={plotB + 20} textAnchor="middle" fill="#64748B" fontSize="12" fontFamily="Inter, sans-serif">
                                {d.label}
                            </text>
                        </g>
                    );
                })}

                {/* Smooth curve line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data points - filled blue with blue border, last has white border */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="5"
                        fill="#3B82F6"
                        stroke={i === points.length - 1 ? '#FFFFFF' : '#3B82F6'}
                        strokeWidth="2"
                    />
                ))}
            </svg>
        </div>
    );
}

function UserRolesChart({ data }: { data?: { role: string; count: number }[] }) {
    const roleColors: Record<string, string> = {
        'Member': '#10b981',
        'Community Creator': '#3b82f6',
        'Verified': '#f59e0b',
        'Premium': '#8b5cf6',
        'Admin': '#3b82f6',
        'Moderator': '#f59e0b',
        'default': '#6b7280'
    };

    // Use API data or show empty state
    const roles = data && data.length > 0 ? data : [];
    const total = roles.reduce((sum, r) => sum + r.count, 0) || 1;

    // Calculate stroke dash arrays for the donut chart
    const circumference = 2 * Math.PI * 40; // radius = 40
    let offset = 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BsPeople className="text-blue-600" />
                </div>
                <span className="text-gray-900 font-semibold">User Roles</span>
            </div>
            {roles.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No role data available</p>
            ) : (
                <>
                    <div className="flex items-center justify-center">
                        <div className="relative w-40 h-40">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                {roles.map((role, i) => {
                                    const percentage = (role.count / total) * 100;
                                    const dashLength = (percentage / 100) * circumference;
                                    const color = roleColors[role.role] || roleColors['default'];
                                    const currentOffset = offset;
                                    offset += dashLength;

                                    return (
                                        <circle
                                            key={i}
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke={color}
                                            strokeWidth="20"
                                            strokeDasharray={`${dashLength} ${circumference}`}
                                            strokeDashoffset={-currentOffset}
                                            transform="rotate(-90 50 50)"
                                        />
                                    );
                                })}
                                <circle cx="50" cy="50" r="28" fill="white" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4 flex-wrap">
                        {roles.map((role) => (
                            <div key={role.role} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: roleColors[role.role] || roleColors['default'] }}
                                />
                                <span className="text-sm text-gray-600">{role.role}</span>
                                <span className="text-sm font-semibold text-gray-800">({role.count.toLocaleString()})</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function TopCountriesChart({ data }: { data?: { country: string; count: number }[] }) {
    // Use API data or show empty state
    const countries = data && data.length > 0 ? data : [];
    const max = countries.length > 0 ? Math.max(...countries.map(c => c.count)) : 1;

    // Generate Y-axis tick values
    const ticks = Array.from({ length: 6 }, (_, i) => Math.round((max / 5) * (5 - i)));

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BsGlobe className="text-blue-600" />
                </div>
                <span className="text-gray-900 font-semibold">Top Countries</span>
            </div>
            {countries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No country data available</p>
            ) : (
                <div className="flex">
                    {/* Y-axis labels */}
                    <div className="flex flex-col justify-between h-52 pr-3 text-xs text-gray-400 py-1">
                        {ticks.map((t, i) => (
                            <span key={i} className="text-right min-w-7.5">
                                {t >= 1000 ? `${(t / 1000).toFixed(0)}k` : t}
                            </span>
                        ))}
                    </div>
                    {/* Bars area */}
                    <div className="flex-1">
                        <div className="h-52 flex items-end justify-center gap-4 border-l border-b border-gray-200 pl-2 pb-1">
                            {countries.map((c) => (
                                <div key={c.country} className="flex flex-col items-center" style={{ width: `${Math.max(100 / Math.max(countries.length, 6), 10)}%`, maxWidth: '60px' }}>
                                    <span className="text-xs font-semibold text-gray-700 mb-1">{c.count.toLocaleString()}</span>
                                    <div
                                        className="w-full bg-blue-500 rounded-t-md transition-all duration-300"
                                        style={{
                                            height: `${(c.count / max) * 100}%`,
                                            minHeight: '4px',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        {/* X-axis labels */}
                        <div className="flex justify-center gap-4 mt-2">
                            {countries.map((c) => (
                                <span key={c.country} className="text-xs text-gray-500 text-center" style={{ width: `${Math.max(100 / Math.max(countries.length, 6), 10)}%`, maxWidth: '60px' }}>
                                    {c.country}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
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
            <div className="h-full bg-gray-50 flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 md:px-8 pt-6 md:pt-8 pb-4 shrink-0">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                    <FiTrendingUp className="text-teal-600 text-xl" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
                    <p className="text-gray-500">Actionable, real-time insights for data-driven decisions.</p>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 md:px-8 pb-6 md:pb-8">
            {/* Metrics Grid - 4x3 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {metricDefs.map((m) => (
                    <MetricCard
                        key={m.key}
                        label={m.label}
                        value={(stats as Record<string, number | undefined>)[m.key]}
                        Icon={m.icon}
                        gradient={m.gradient}
                        bgTint={m.bgTint}
                        delta={formatDelta((stats as Record<string, number | undefined>)[m.deltaKey])}
                    />
                ))}
            </div>

            {/* User Growth Chart - Full Width */}
            <div className="mb-6">
                <UserGrowthChart data={stats.userGrowth || []} />
            </div>

            {/* Posts Trend Chart - Full Width */}
            <div className="mb-6">
                <PostsTrendChart data={stats.postGrowth || []} />
            </div>

            {/* Daily Active Users Chart - Full Width */}
            <div className="mb-6">
                <DailyActiveUsersChart data={stats.activeUsersChart || []} />
            </div>

            {/* Bottom Charts - 2 Column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UserRolesChart data={stats.roleDistribution ? Object.entries(stats.roleDistribution).map(([role, count]) => ({ role, count })) : undefined} />
                <TopCountriesChart data={stats.countryDistribution ? Object.entries(stats.countryDistribution).map(([country, count]) => ({ country, count })) : undefined} />
            </div>
            </div>
        </div>
    );
}
