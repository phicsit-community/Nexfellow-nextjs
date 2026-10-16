'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { saveAs } from "file-saver";
import {
    FiTrash2, FiChevronLeft, FiChevronRight, FiSearch, FiDownload,
    FiUsers, FiActivity, FiCreditCard, FiUserPlus, FiMapPin,
} from "react-icons/fi";
import { toast } from "sonner";
import { useAuth, authFetch } from "@/hooks/useAuth";
import Loader from "@/components/Loader/Loader";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import UserDrawer from "./UserDrawer";
import { Avatar, PLAN_META, formatDate, formatDateTime, time, timeAgo, type User } from "./userShared";

type Filter = "all" | "online" | "paid" | "free";
type Sort = "joined" | "active" | "login";

const ITEMS_PER_PAGE = 12;
// Re-render interval for relative times ("5m ago")
const CLOCK_TICK_MS = 30_000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "online", label: "Online" },
    { key: "paid", label: "Paid" },
    { key: "free", label: "Free" },
];

const csvEscape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const StatCard = ({ icon, label, value, hint, accent }: {
    icon: React.ReactNode; label: string; value: number; hint?: string; accent: string;
}) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${accent}`}>
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">{value.toLocaleString()}</p>
            {hint && <p className="text-xs text-gray-500 truncate">{hint}</p>}
        </div>
    </div>
);

const UsersPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const { adminId, token, isReady } = useAuth();
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState<Filter>("all");
    const [sort, setSort] = useState<Sort>("joined");
    // Online status is tracked separately from the rows so live presence events
    // can't be overwritten by a row update that was built a moment earlier.
    const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
    const [loaded, setLoaded] = useState(false);
    const [live, setLive] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const closeDrawer = useCallback(() => setSelectedId(null), []);
    // Lets socket handlers see the current rows without resubscribing
    const knownIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        knownIds.current = new Set(data.map(u => u._id));
    }, [data]);

    const fetchUsers = useCallback(async ({ silent = false } = {}) => {
        if (!isReady || !adminId) return;

        if (!silent) setLoading(true);
        try {
            const response = await authFetch(
                `${apiUrl}/admin/${adminId}/registered-users`,
                token,
                { method: "GET" }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }
            const users: User[] = await response.json();
            setData(users);
            setOnlineIds(new Set(users.filter(u => u.isOnline).map(u => u._id)));
            setLoaded(true);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error("Failed to load users");
        }
        if (!silent) setLoading(false);
    }, [apiUrl, adminId, token, isReady]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Live updates: presence, sign-ins, signups, plan/profile changes, deletions
    useEffect(() => {
        if (!loaded || !token) return;

        const socket = io(`${apiUrl}/admin`, {
            auth: { token },
            transports: ["websocket", "polling"],
        });
        let hasConnected = false;

        socket.on("connect", () => {
            setLive(true);
            // Events sent while we were disconnected are lost, so resync once
            if (hasConnected) fetchUsers({ silent: true });
            hasConnected = true;
        });
        socket.on("disconnect", () => setLive(false));
        socket.on("connect_error", (err) => {
            setLive(false);
            console.error("Admin socket connection error:", err.message);
        });

        socket.on("admin:presence:sync", ({ userIds }: { userIds: string[] }) => {
            setOnlineIds(new Set(userIds));
        });

        socket.on("admin:presence", ({ userId, isOnline, lastSeenAt }: { userId: string; isOnline: boolean; lastSeenAt: string | null }) => {
            setOnlineIds(prev => {
                const next = new Set(prev);
                if (isOnline) next.add(userId);
                else next.delete(userId);
                return next;
            });
            if (!isOnline && lastSeenAt) {
                setData(prev => prev.map(u => (u._id === userId ? { ...u, lastSeenAt } : u)));
            }
        });

        socket.on("admin:user:upsert", (row: User) => {
            if (!knownIds.current.has(row._id)) {
                knownIds.current.add(row._id);
                toast.success(`New signup: ${row.name || row.email}`);
            }
            setData(prev =>
                prev.some(u => u._id === row._id)
                    ? prev.map(u => (u._id === row._id ? row : u))
                    : [row, ...prev]
            );
        });

        socket.on("admin:user:removed", ({ userId }: { userId: string }) => {
            setData(prev => prev.filter(u => u._id !== userId));
        });

        return () => {
            socket.disconnect();
        };
    }, [apiUrl, token, loaded, fetchUsers]);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
        return () => clearInterval(interval);
    }, []);

    const query = searchQuery.trim().toLowerCase();
    const filteredData = data
        .filter(user => {
            if (filter === "online") return onlineIds.has(user._id);
            if (filter === "paid") return user.plan && user.plan !== "free";
            if (filter === "free") return !user.plan || user.plan === "free";
            return true;
        })
        .filter(user =>
            !query ||
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.username?.toLowerCase().includes(query) ||
            user.country?.toLowerCase().includes(query)
        )
        .sort((a, b) => {
            if (sort === "active") {
                const aOnline = onlineIds.has(a._id);
                const bOnline = onlineIds.has(b._id);
                if (aOnline !== bOnline) return aOnline ? -1 : 1;
                return time(b.lastSeenAt) - time(a.lastSeenAt);
            }
            if (sort === "login") return time(b.lastLoginAt) - time(a.lastLoginAt);
            return time(b.createdAt) - time(a.createdAt);
        });

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const selectedUser = selectedId ? data.find(u => u._id === selectedId) : undefined;
    const onlineCount = data.filter(u => onlineIds.has(u._id)).length;
    const paidUsers = data.filter(u => u.plan && u.plan !== "free");
    const founderCount = paidUsers.filter(u => u.plan === "founder").length;
    const newThisWeek = data.filter(u => now - time(u.createdAt) < WEEK_MS).length;

    const filterCounts: Record<Filter, number> = {
        all: data.length,
        online: onlineCount,
        paid: paidUsers.length,
        free: data.length - paidUsers.length,
    };

    const deleteUser = (id: string) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className="bg-white rounded-xl p-6 shadow-xl max-w-md">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h2>
                        <p className="text-gray-600 mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await authFetch(
                                            `${apiUrl}/admin/deleteuser/${id}`,
                                            token,
                                            { method: "DELETE" }
                                        );
                                        if (res.ok) {
                                            setData(prev => prev.filter(u => u._id !== id));
                                            setSelectedId(current => (current === id ? null : current));
                                            toast.success("User deleted");
                                        } else {
                                            toast.error("Failed to delete user");
                                        }
                                    } catch (error) {
                                        console.error("Error deleting user:", error);
                                        toast.error("Failed to delete user");
                                    }
                                    onClose();
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                );
            },
        });
    };

    const setPlanBadge = async (id: string, color: "blue" | "orange" | null) => {
        try {
            const res = await authFetch(
                `${apiUrl}/admin/plan-badge/${id}`,
                token,
                {
                    method: "PUT",
                    body: JSON.stringify({ badgeColor: color }),
                }
            );
            if (res.ok) {
                const result = await res.json();
                setData(prev => prev.map(u =>
                    u._id === id ? { ...u, planBadge: result.planBadge } : u
                ));
            } else {
                const message = await res.text();
                toast.error(message || "Failed to update plan badge");
            }
        } catch (error) {
            console.error("Error setting plan badge:", error);
            toast.error("Failed to update plan badge");
        }
    };

    const togglePlanBadge = (id: string, currentColor: "blue" | "orange" | null | undefined, color: "blue" | "orange") => {
        setPlanBadge(id, currentColor === color ? null : color);
    };

    const downloadCSV = () => {
        if (!data || data.length === 0) return;

        const columns: [string, (u: User) => unknown][] = [
            ["Name", u => u.name],
            ["Username", u => u.username],
            ["Email", u => u.email],
            ["Phone", u => u.phoneNumber],
            ["Country", u => u.country],
            ["Occupation", u => u.occupation],
            ["Plan", u => PLAN_META[u.plan || "free"].label],
            ["Billing", u => u.subscriptionInterval],
            ["Plan Expires", u => u.subscriptionExpiresAt],
            ["Plan Badge", u => u.planBadge],
            ["Status", u => (onlineIds.has(u._id) ? "Online" : "Offline")],
            ["Last Seen", u => u.lastSeenAt],
            ["Last Login", u => u.lastLoginAt],
            ["Joined", u => u.createdAt],
            ["Coins", u => u.coins],
        ];

        const csvRows = [
            columns.map(([header]) => csvEscape(header)).join(","),
            ...data.map(user => columns.map(([, get]) => csvEscape(get(user))).join(",")),
        ];

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `registered_users_${new Date().toISOString()}.csv`);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        const endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex items-center gap-1">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <FiChevronLeft className="text-sm" />
                    <span className="text-sm">Prev</span>
                </button>

                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => setCurrentPage(1)}
                            className="w-8 h-8 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="text-gray-400">...</span>}
                    </>
                )}

                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm transition-colors ${currentPage === page
                            ? 'bg-teal-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {page}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            className="w-8 h-8 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="text-sm">Next</span>
                    <FiChevronRight className="text-sm" />
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="h-full bg-gray-50 flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    const thClass = "text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap";

    return (
        <div className="min-h-full bg-gray-50 p-4 sm:p-6 md:p-8 overflow-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Users</h1>
                        <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${live ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                            title={live ? "Updates appear automatically" : "Trying to reconnect for live updates"}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                            {live ? "Live" : "Reconnecting…"}
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm">Everyone who has signed up, their plan and how recently they were around.</p>
                </div>

                <button
                    onClick={downloadCSV}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium whitespace-nowrap"
                >
                    <FiDownload />
                    Download CSV
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard icon={<FiUsers />} label="Total users" value={data.length} accent="bg-teal-50 text-teal-600" />
                <StatCard
                    icon={<FiActivity />}
                    label="Online now"
                    value={onlineCount}
                    hint={data.length ? `${((onlineCount / data.length) * 100).toFixed(1)}% of users` : undefined}
                    accent="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                    icon={<FiCreditCard />}
                    label="Paid users"
                    value={paidUsers.length}
                    hint={`${paidUsers.length - founderCount} Builder Pro · ${founderCount} Founder`}
                    accent="bg-blue-50 text-blue-600"
                />
                <StatCard icon={<FiUserPlus />} label="New this week" value={newThisWeek} accent="bg-orange-50 text-orange-600" />
            </div>

            {/* Table card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 border-b border-gray-100">
                    <div className="flex flex-wrap items-center gap-1 bg-gray-100 rounded-lg p-1 self-start">
                        {FILTERS.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => { setFilter(key); setCurrentPage(1); }}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === key
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {label}
                                <span className={`ml-1.5 text-xs ${filter === key ? "text-teal-600" : "text-gray-400"}`}>
                                    {filterCounts[key]}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative sm:w-72">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search name, email, username, country"
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>
                        <select
                            value={sort}
                            onChange={e => { setSort(e.target.value as Sort); setCurrentPage(1); }}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        >
                            <option value="joined">Newest first</option>
                            <option value="active">Recently active</option>
                            <option value="login">Last login</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px]">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className={thClass}>User</th>
                                <th className={thClass}>Contact</th>
                                <th className={thClass}>Plan</th>
                                <th className={thClass}>Status</th>
                                <th className={thClass}>Last login</th>
                                <th className={thClass}>Joined</th>
                                <th className={`${thClass} text-center`}>Plan badge</th>
                                <th className={`${thClass} text-center`}>Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-16 text-gray-500 text-sm">
                                        No users match these filters
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((user) => {
                                    const plan = PLAN_META[user.plan || "free"];
                                    const isOnline = onlineIds.has(user._id);
                                    return (
                                        <tr
                                            key={user._id}
                                            onClick={() => setSelectedId(user._id)}
                                            onKeyDown={e => {
                                                if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                                                    e.preventDefault();
                                                    setSelectedId(user._id);
                                                }
                                            }}
                                            tabIndex={0}
                                            aria-label={`View details for ${user.name || user.username}`}
                                            data-testid="user-row"
                                            className={`cursor-pointer transition-colors focus:outline-none focus-visible:bg-teal-50/60 ${selectedId === user._id ? "bg-teal-50/70" : "hover:bg-gray-50/80"}`}
                                        >
                                            {/* User */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar user={user} isOnline={isOnline} />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{user.name || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500 truncate max-w-[200px]">@{user.username || 'username'}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact + country (from onboarding) */}
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-gray-900 truncate max-w-[240px]" title={user.email}>{user.email || 'No email'}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <FiMapPin className="shrink-0" />
                                                    {user.country || 'Unknown'}
                                                </p>
                                            </td>

                                            {/* Plan */}
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset whitespace-nowrap ${plan.className}`}
                                                    title={user.subscriptionExpiresAt ? `Renews / expires ${formatDate(user.subscriptionExpiresAt)}` : undefined}
                                                >
                                                    {plan.label}
                                                </span>
                                                {user.subscriptionInterval && (
                                                    <p className="text-xs text-gray-500 mt-1 capitalize">{user.subscriptionInterval}</p>
                                                )}
                                            </td>

                                            {/* Live status */}
                                            <td className="px-4 py-3">
                                                {isOnline ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                                        <span className="relative flex w-2 h-2">
                                                            <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                                                            <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                                                        </span>
                                                        Online
                                                    </span>
                                                ) : (
                                                    <div>
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200">
                                                            <span className="w-2 h-2 rounded-full bg-gray-400" />
                                                            Offline
                                                        </span>
                                                        {user.lastSeenAt && (
                                                            <p className="text-xs text-gray-500 mt-1" title={formatDateTime(user.lastSeenAt)}>
                                                                Seen {timeAgo(user.lastSeenAt, now)}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Last login (Clerk sign-in) */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {user.lastLoginAt ? (
                                                    <div title={formatDateTime(user.lastLoginAt)}>
                                                        <p className="text-sm text-gray-900">{timeAgo(user.lastLoginAt, now)}</p>
                                                        <p className="text-xs text-gray-500">{formatDate(user.lastLoginAt)}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400" title="No sign-in recorded">—</p>
                                                )}
                                            </td>

                                            {/* Joined */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <p className="text-sm text-gray-900">{formatDate(user.createdAt)}</p>
                                            </td>

                                            {/* Plan Badge (blue = Builder Pro, orange = Founder) */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); togglePlanBadge(user._id, user.planBadge, "blue"); }}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${user.planBadge === "blue"
                                                            ? 'opacity-100 bg-blue-50 hover:opacity-80'
                                                            : 'opacity-30 grayscale hover:opacity-60'
                                                            }`}
                                                        title={user.planBadge === "blue" ? 'Remove Blue Badge' : 'Give Blue Badge (Builder Pro)'}
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src="/images/badges/plan-blue.svg" alt="Blue Badge" className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={e => { e.stopPropagation(); togglePlanBadge(user._id, user.planBadge, "orange"); }}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${user.planBadge === "orange"
                                                            ? 'opacity-100 bg-orange-50 hover:opacity-80'
                                                            : 'opacity-30 grayscale hover:opacity-60'
                                                            }`}
                                                        title={user.planBadge === "orange" ? 'Remove Orange Badge' : 'Give Orange Badge (Founder)'}
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src="/images/badges/plan-orange.svg" alt="Orange Badge" className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Action */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        onClick={e => { e.stopPropagation(); deleteUser(user._id); }}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        {filteredData.length === 0
                            ? "No results"
                            : `Showing ${startIndex + 1}–${Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)} of ${filteredData.length.toLocaleString()}`}
                    </p>
                    {renderPagination()}
                </div>
            </div>

            {/* Rows come from live state, so the drawer updates (and closes on delete) on its own */}
            {selectedUser && (
                <UserDrawer
                    user={selectedUser}
                    isOnline={onlineIds.has(selectedUser._id)}
                    now={now}
                    apiUrl={apiUrl}
                    token={token}
                    onClose={closeDrawer}
                    onDelete={deleteUser}
                />
            )}
        </div>
    );
};

export default UsersPage;
