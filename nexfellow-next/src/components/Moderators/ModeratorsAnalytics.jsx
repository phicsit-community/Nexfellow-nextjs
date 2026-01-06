import React, { useEffect, useState } from "react";
import api from "../../lib/axios";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import styles from "./ModeratorsAnalytics.module.css";

const ACCENT = "#24b2b4";

function AnalyticsIcon() {
    return (
        <svg className={styles.analyticsIcon} width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="3" y="3" width="16" height="16" rx="3.2" fill="#E0F8F8" />
            <rect x="7.7" y="10.5" width="2.9" height="6" rx="1.1" fill={ACCENT} />
            <rect x="12" y="7.5" width="2.9" height="9" rx="1.1" fill={ACCENT} />
            <rect x="16.2" y="14" width="2.1" height="2" rx="0.97" fill={ACCENT} />
        </svg>
    );
}
function DashboardIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
            <path d="M5 9.2H14M11.3 6L14 9.2L11.3 12.4" stroke={ACCENT} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function ChevronUp() {
    return (
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M3 8L7 4L11 8" stroke={ACCENT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function ChevronDown() {
    return (
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M3 6L7 10L11 6" stroke="#F33B50" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function Growth({ growth = 0 }) {
    if (growth === 0) return <span className={styles.growth + " " + styles.flat}>0%</span>;
    return (
        <span className={styles.growth + " " + (growth > 0 ? styles.up : styles.down)}>
            {growth > 0 ? <ChevronUp /> : <ChevronDown />}
            {Math.abs(growth)}%
        </span>
    );
}

// NEW: generates dynamic X axis (hours/days/months) as per filter
function getTimeBuckets(filter) {
    const now = new Date();
    let buckets = [];
    if (filter === "day") {
        // 24 hours (e.g. 04:00 for each past hour)
        for (let i = 0; i < 24; i++) {
            const date = new Date(now); date.setHours(now.getHours() - (23 - i));
            buckets.push(date.getHours().toString().padStart(2, '0') + ":00");
        }
    } else if (filter === "week") {
        // last 7 days: Sun..Sat
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now); date.setDate(now.getDate() - i);
            buckets.push(weekdays[date.getDay()]);
        }
    } else if (filter === "month") {
        // last 30 days: MM/DD
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now); date.setDate(now.getDate() - i);
            buckets.push((date.getMonth() + 1) + "/" + date.getDate());
        }
    } else if (filter === "quarter") {
        // Last 3 months - use months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 2; i >= 0; i--) {
            let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            buckets.push(months[d.getMonth()]);
        }
    } else if (filter === "half") {
        // Last 6 months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 5; i >= 0; i--) {
            let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            buckets.push(months[d.getMonth()]);
        }
    } else if (filter === "year" || filter === "all") {
        // 12 months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 11; i >= 0; i--) {
            let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            buckets.push(months[d.getMonth()]);
        }
    }
    return buckets;
}

// Makes dummy stats, but truly dynamic X axis
function createSyntheticLineDynamic(val, filter) {
    const buckets = getTimeBuckets(filter);
    let v = Math.max(val || 10, 10);
    // Spread value, gently wavy with index
    return buckets.map((label, idx) => ({
        label,
        value: Math.round(v * (1 + 0.08 * Math.sin((idx / buckets.length) * Math.PI * 2))),
    }));
}

const tabDefs = [
    { key: "views", label: "Views", statKey: "filteredViews", growthKey: "viewGrowth" },
    { key: "likes", label: "Likes", statKey: "newLikes", growthKey: "likeGrowth" },
    { key: "followers", label: "Followers", statKey: "newMembers", growthKey: "memberGrowth" }
];
const FILTERS = [
    { value: "day", label: "Last 24 Hours" },
    { value: "week", label: "Last 7 Days" },
    { value: "month", label: "Last 1 Month" },
    { value: "quarter", label: "Last 3 Months" },
    { value: "half", label: "Last 6 Months" },
    { value: "year", label: "Last 1 Year" },
    { value: "all", label: "All Time" },
];

export default function ModeratorsAnalytics({
    communityId,
    dashboardUrl = `/dashboard/analytics/${communityId}`,
    initialFilter = "week"
}) {
    const [data, setData] = useState(null);
    const [tab, setTab] = useState("views");
    const [loading, setLoading] = useState(true);
    const [analyticsFilter, setAnalyticsFilter] = useState(initialFilter);

    useEffect(() => {
        setLoading(true);
        api.get(`/analytics/${communityId}?filter=${analyticsFilter}`)
            .then(res => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [communityId, analyticsFilter]);

    function handleAnalyticsFilterChange(e) {
        setAnalyticsFilter(e.target.value);
    }

    if (loading) return <div className={styles.loader}>Loading…</div>;
    if (!data) return <div className={styles.loader}><span className={styles.error}>Failed to load analytics.</span></div>;

    const curTab = tabDefs.find(t => t.key === tab);
    const chartData = createSyntheticLineDynamic(data[curTab.statKey] ?? 0, analyticsFilter);
    const filterLabel = FILTERS.find(f => f.value === analyticsFilter)?.label || "Last 7 Days";

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <span className={styles.title}><AnalyticsIcon />Profile Analytics</span>
                <select
                    className={styles.analyticsFilter}
                    value={analyticsFilter}
                    onChange={handleAnalyticsFilterChange}
                >
                    {FILTERS.map(f =>
                        <option value={f.value} key={f.value}>{f.label}</option>
                    )}
                </select>
            </div>

            {/* Removed inline padding/font-size → now styled via CSS */}
            <div className={styles.time}>
                {filterLabel}
            </div>

            <div className={styles.statsRow}>
                {tabDefs.map((t) => (
                    <div className={styles.statCol} key={t.key}>
                        <span className={styles.statValue} style={{ color: ACCENT }}>
                            {data[t.statKey] ?? 0}
                        </span>
                        <span className={styles.statLabel}>
                            {t.label}
                            <Growth growth={data[t.growthKey]} />
                        </span>
                    </div>
                ))}
            </div>

            <div className={styles.tabs}>
                {tabDefs.map(t => (
                    <button
                        key={t.key}
                        className={`${styles.tabBtn} ${tab === t.key ? styles.tabActive : ""}`}
                        onClick={() => setTab(t.key)}
                        tabIndex={0}
                    >
                        {t.label}
                        {tab === t.key && <span className={styles.tabLine}></span>}
                    </button>
                ))}
            </div>

            {/* Chart height controlled by CSS only */}
            <div className={styles.chartWrap}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ left: 0, top: 12, right: 20, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="2 6" stroke="#E9F0F7" />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#BCD2ED", fontSize: 12 }}
                            interval={
                                analyticsFilter === 'day' ? 2 :
                                    analyticsFilter === 'month' ? 6 :
                                        0
                            }
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#BCD2ED", fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                background: "#fff", borderRadius: 8, border: `1px solid #E6ECF4`
                            }}
                            formatter={value => [`${value}`, curTab.label]}
                            cursor={{ stroke: "#E5F0FD", strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={ACCENT}
                            strokeWidth={2.5}
                            dot={{ r: 3.5, fill: "#fff", stroke: ACCENT, strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: "#fff", stroke: ACCENT, strokeWidth: 3 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
