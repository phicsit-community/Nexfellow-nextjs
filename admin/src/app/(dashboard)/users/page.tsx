'use client';

import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { IoIosSearch } from "react-icons/io";
import { FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BsCheckCircleFill, BsStarFill } from "react-icons/bs";
import { toast } from "sonner";
import { useAuth, authFetch } from "@/hooks/useAuth";
import Loader from "@/components/Loader/Loader";
import Image from "next/image";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    phone?: string;
    picture?: string;
    createdAt?: string;
    country?: string;
    occupation?: string;
    verificationBadge?: boolean;
    premiumBadge?: boolean;
    communityBadge?: boolean;
    planBadge?: "blue" | "orange" | null;
    subscriptionTier?: string;
    createdCommunity?: {
        accountType?: string;
    };
}

const ITEMS_PER_PAGE = 12;

const UsersPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const { adminId, token, isReady } = useAuth();
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!isReady || !adminId) return;

            setLoading(true);
            try {
                const response = await authFetch(
                    `${apiUrl}/admin/${adminId}/registered-users`,
                    token,
                    { method: "GET" }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                const result = await response.json();
                const sortedUsers = result.sort((a: User, b: User) =>
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                );
                setData(sortedUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
            setLoading(false);
        };

        fetchUsers();
    }, [apiUrl, adminId, token, isReady]);

    const handleSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const filteredData = data.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
                                            `${apiUrl}/admin/${adminId}/users/${id}`,
                                            token,
                                            { method: "DELETE" }
                                        );
                                        if (res.ok) {
                                            setData(prev => prev.filter(u => u._id !== id));
                                        }
                                    } catch (error) {
                                        console.error("Error deleting user:", error);
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

        const headers = Object.keys(data[0]).filter(
            (key) => key !== "__v" && key !== "_id"
        );

        const csvRows = [
            headers.join(","),
            ...data.map((user) =>
                headers.map((field) => `"${(user as unknown as Record<string, unknown>)[field] ?? ""}"`).join(",")
            ),
        ];

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
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
            <div className="flex items-center justify-center gap-2 py-4">
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

    return (
        <div className="min-h-full bg-gray-50 p-4 sm:p-6 md:p-8 overflow-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 shrink-0">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Total Users: {data.length.toLocaleString()}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    {/* Search */}
                    <div className="relative flex-1 md:w-80">
                        <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={handleSearchQuery}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        />
                    </div>

                    <button
                        onClick={downloadCSV}
                        className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                        Download CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Users</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Contact</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Occupation</th>
                                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Plan Badge</th>
                                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((user) => (
                                    <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        {/* User Info */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                                    {user.picture ? (
                                                        <Image
                                                            src={user.picture}
                                                            alt={user.name}
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-teal-100 flex items-center justify-center text-teal-600 font-semibold">
                                                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{user.name || 'Unknown'}</p>
                                                    <p className="text-sm text-gray-500">@{user.username || 'username'}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">{user.email || 'No email'}</p>
                                            <p className="text-sm text-gray-500">{user.phone || 'No phone'}</p>
                                        </td>

                                        {/* Occupation */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">{user.occupation || user.createdCommunity?.accountType || 'Freelance'}</p>
                                        </td>

                                        {/* Plan Badge (blue = Builder Pro, orange = Founder) */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => togglePlanBadge(user._id, user.planBadge, "blue")}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${user.planBadge === "blue"
                                                        ? 'opacity-100 hover:opacity-80'
                                                        : 'opacity-30 grayscale hover:opacity-50'
                                                        }`}
                                                    title={user.planBadge === "blue" ? 'Remove Blue Badge' : 'Give Blue Badge (Builder Pro)'}
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src="/images/badges/plan-blue.svg" alt="Blue Badge" className="w-6 h-6" />
                                                </button>
                                                <button
                                                    onClick={() => togglePlanBadge(user._id, user.planBadge, "orange")}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${user.planBadge === "orange"
                                                        ? 'opacity-100 hover:opacity-80'
                                                        : 'opacity-30 grayscale hover:opacity-50'
                                                        }`}
                                                    title={user.planBadge === "orange" ? 'Remove Orange Badge' : 'Give Orange Badge (Founder)'}
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src="/images/badges/plan-orange.svg" alt="Orange Badge" className="w-6 h-6" />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Action */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() => deleteUser(user._id)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <FiTrash2 className="text-lg" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {renderPagination()}
            </div>
        </div>
    );
};

export default UsersPage;
