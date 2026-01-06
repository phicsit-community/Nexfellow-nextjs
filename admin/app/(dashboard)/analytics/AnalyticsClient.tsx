'use client';

import { useEffect, useState } from 'react';
import {
    BsPeople, BsCardText, BsActivity, BsChatDots, BsBookmarkCheck,
    BsAward, BsCalendar2Check, BsFlag, BsHandThumbsUp, BsGift,
    BsPersonWorkspace, BsEnvelope, BsBarChart, BsPieChart, BsGlobe
} from 'react-icons/bs';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement,
    Title, Tooltip, Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import styles from './Analytics.module.css';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend
);

interface MetricDef {
    key: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    deltaKey: string;
}

const metricDefs: MetricDef[] = [
    { key: 'totalUsers', label: 'Total Users', icon: <BsPeople />, color: '#2563eb', deltaKey: 'totalUsersDelta' },
    { key: 'totalPosts', label: 'Posts', icon: <BsCardText />, color: '#fb923c', deltaKey: 'postsDelta' },
    { key: 'activeUsers', label: 'Active Users (30d)', icon: <BsActivity />, color: '#16a34a', deltaKey: 'activeUsersDelta' },
    { key: 'totalComments', label: 'Comments', icon: <BsChatDots />, color: '#8b5cf6', deltaKey: 'commentsDelta' },
    { key: 'totalBookmarks', label: 'Bookmarks', icon: <BsBookmarkCheck />, color: '#2563eb', deltaKey: 'bookmarksDelta' },
    { key: 'totalQuizzes', label: 'Quizzes', icon: <BsAward />, color: '#fb923c', deltaKey: 'quizzesDelta' },
    { key: 'totalEvents', label: 'Events', icon: <BsCalendar2Check />, color: '#16a34a', deltaKey: 'eventsDelta' },
    { key: 'totalChallenges', label: 'Challenges', icon: <BsFlag />, color: '#8b5cf6', deltaKey: 'challengesDelta' },
    { key: 'totalLikes', label: 'Likes', icon: <BsHandThumbsUp />, color: '#2563eb', deltaKey: 'likesDelta' },
    { key: 'totalRewards', label: 'Rewards', icon: <BsGift />, color: '#fb923c', deltaKey: 'rewardsDelta' },
    { key: 'totalCommunities', label: 'Communities', icon: <BsPersonWorkspace />, color: '#16a34a', deltaKey: 'communitiesDelta' },
    { key: 'totalNotifications', label: 'Notifications Sent', icon: <BsEnvelope />, color: '#8b5cf6', deltaKey: 'notificationsDelta' }
];

interface DeltaInfo {
    icon: string;
    color: string;
    value: string;
}

function formatDelta(delta: string | number | undefined): DeltaInfo | null {
    if (typeof delta !== 'string' && typeof delta !== 'number') return null;
    const value = parseFloat(String(delta));
    if (isNaN(value)) return null;
    return {
        icon: value < 0 ? '▼' : '▲',
        color: value < 0 ? '#e11d48' : '#16a34a',
        value: Math.abs(value).toFixed(2)
    };
}

interface MetricCardProps {
    label: string;
    value: number | undefined;
    icon: React.ReactNode;
    color: string;
    delta: DeltaInfo | null;
}

function MetricCard({ label, value, icon, color, delta }: MetricCardProps) {
    return (
        <div className={styles.metricCard}>
            <span className={styles.metricIcon} style={{ background: color + '18', color }}>{icon}</span>
            <div className={styles.metricContent}>
                <div className={styles.metricValue}>{(value !== undefined && value !== null) ? value.toLocaleString() : '—'}</div>
                <div className={styles.metricLabel}>{label}</div>
                {delta && (
                    <div className={styles.metricTrend} style={{ color: delta.color }}>
                        {delta.icon} {delta.value}%
                    </div>
                )}
            </div>
        </div>
    );
}

interface ChartCardProps {
    icon: React.ReactNode;
    title: string;
    type: 'line' | 'bar';
    color: string;
    labels: string[];
    data: number[];
    predictionData?: (number | null)[];
    predictionLabel?: string;
    predictionValue?: number;
}

function ChartCard({ icon, title, type, color, labels, data, predictionData, predictionLabel, predictionValue }: ChartCardProps) {
    const datasets: any[] = [{
        label: 'Actual',
        data,
        borderColor: color,
        backgroundColor: type === 'bar' ? color : color + '22',
        fill: type === 'line',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: color,
        pointBorderColor: '#fff'
    }];

    if (Array.isArray(predictionData) && predictionData.some(v => v != null)) {
        datasets.push({
            label: 'Prediction',
            data: predictionData,
            borderColor: '#64748b',
            backgroundColor: type === 'bar' ? '#cbd5e1' : '#64748b25',
            borderDash: [8, 5],
            pointRadius: 6,
            pointBackgroundColor: '#64748b',
            pointBorderColor: '#64748b',
            fill: false,
            tension: 0.4
        });
    }

    const chartData = { labels, datasets };
    const options = {
        plugins: {
            legend: { display: datasets.length > 1 },
            tooltip: { mode: 'index' as const, intersect: false }
        },
        scales: {
            x: { grid: { color: '#f1f5f9' } },
            y: { grid: { color: '#f1f5f9' } }
        },
        maintainAspectRatio: false
    };

    return (
        <div className={styles.chartCard}>
            <div className={styles.chartTitle}>{icon} {title}</div>
            <div className={styles.customChart}>
                {type === 'line' ? (
                    <Line data={chartData} options={options} height={220} />
                ) : (
                    <Bar data={chartData} options={options} height={220} />
                )}
            </div>
            {(predictionLabel && predictionValue !== undefined) && (
                <div className={styles.predictionLabel}>
                    Prediction for <b>{predictionLabel}</b>: <b>{predictionValue}</b>
                </div>
            )}
        </div>
    );
}

export function AnalyticsClient() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [stats, setStats] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${apiUrl}/admin/analytics/overview`, {
                    credentials: 'include'
                });
                if (!res.ok) throw new Error('Failed to fetch analytics');
                const data = await res.json();
                setStats(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load analytics');
            }
            setLoading(false);
        };
        fetchData();
    }, [apiUrl]);

    const userGrowthData = stats.userGrowth || [];
    const postGrowthData = stats.postGrowth || [];
    const activeUsersData = stats.activeUsersChart || [];
    const userGrowthPrediction = stats.userGrowthPrediction;
    const postGrowthPrediction = stats.postGrowthPrediction;
    const roleDist = stats.roleDistribution || { member: 0, admin: 0, moderator: 0 };
    const countryDist = stats.countryDistribution || {};

    const userLabels = [
        ...userGrowthData.map((d: any) => d.label),
        userGrowthPrediction?.label
    ].filter(Boolean);
    const userActual = userGrowthData.map((d: any) => d.value);

    const userPredictionStart = userGrowthData[userGrowthData.length - 1]?.value ?? null;
    const userPred = userGrowthPrediction && userGrowthPrediction.label
        ? [
            ...Array(userGrowthData.length - 1).fill(null),
            userPredictionStart,
            userGrowthPrediction.value
        ]
        : [];

    const postLabels = [
        ...postGrowthData.map((d: any) => d.label),
        postGrowthPrediction?.label
    ].filter(Boolean);
    const postActual = postGrowthData.map((d: any) => d.value);

    const postPredictionStart = postGrowthData[postGrowthData.length - 1]?.value ?? null;
    const postPred = postGrowthPrediction && postGrowthPrediction.label
        ? [
            ...Array(postGrowthData.length - 1).fill(null),
            postPredictionStart,
            postGrowthPrediction.value
        ]
        : [];

    return (
        <div className={styles.pageWrapper}>
            <main className={styles.analyticsMain}>
                <header className={styles.pageHeader}>
                    <span className={styles.pageIcon}><BsBarChart /></span>
                    <div>
                        <h1>Platform Analytics</h1>
                        <p>Actionable, real-time insights for data-driven decisions.</p>
                    </div>
                </header>
                <section className={styles.metricsGrid}>
                    {metricDefs.map((m) => (
                        <MetricCard
                            key={m.key}
                            label={m.label}
                            value={stats[m.key]}
                            icon={m.icon}
                            color={m.color}
                            delta={formatDelta(stats[m.deltaKey])}
                        />
                    ))}
                </section>
                {loading ? (
                    <div className={styles.loading}>Loading analytics...</div>
                ) : error ? (
                    <div className={styles.error}>{error}</div>
                ) : (
                    <>
                        <section className={styles.chartsSection}>
                            <ChartCard
                                title={`User Growth (12mo) - Current: ${userGrowthData.at(-1)?.value || 0} users in ${userGrowthData.at(-1)?.label || ''}`}
                                icon={<BsPeople />}
                                type="line"
                                color="#10b981"
                                labels={userLabels}
                                data={userActual}
                                predictionData={userPred}
                                predictionLabel={userGrowthPrediction?.label}
                                predictionValue={userGrowthPrediction?.value}
                            />
                            <ChartCard
                                title={`Posts Trend (12mo) - Current: ${postGrowthData.at(-1)?.value || 0} posts in ${postGrowthData.at(-1)?.label || ''}`}
                                icon={<BsCardText />}
                                type="bar"
                                color="#fb923c"
                                labels={postLabels}
                                data={postActual}
                                predictionData={postPred}
                                predictionLabel={postGrowthPrediction?.label}
                                predictionValue={postGrowthPrediction?.value}
                            />
                            <ChartCard
                                title={`Daily Active Users (30d) - Current: ${activeUsersData.at(-1)?.value || 0} users on ${activeUsersData.at(-1)?.label || ''}`}
                                icon={<BsActivity />}
                                type="line"
                                color="#2563eb"
                                labels={activeUsersData.map((d: any) => d.label)}
                                data={activeUsersData.map((d: any) => d.value)}
                            />
                        </section>
                        <section className={styles.bottomCharts}>
                            <div className={styles.bottomCard}>
                                <div className={styles.chartTitle}><BsPieChart /> User Roles</div>
                                <Pie
                                    data={{
                                        labels: Object.keys(roleDist).map(r =>
                                            r ? r[0].toUpperCase() + r.slice(1) : ''),
                                        datasets: [{
                                            data: Object.values(roleDist) as number[],
                                            backgroundColor: ['#10b981', '#2563eb', '#fbbf24']
                                        }]
                                    }}
                                    options={{ plugins: { legend: { position: 'bottom' } } }}
                                />
                            </div>
                            <div className={styles.bottomCard}>
                                <div className={styles.chartTitle}><BsGlobe /> Top Countries</div>
                                <Bar
                                    data={{
                                        labels: Object.keys(countryDist),
                                        datasets: [{
                                            label: 'Users',
                                            data: Object.values(countryDist) as number[],
                                            backgroundColor: '#0ea5e9'
                                        }]
                                    }}
                                    options={{ plugins: { legend: { display: false } } }}
                                />
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
