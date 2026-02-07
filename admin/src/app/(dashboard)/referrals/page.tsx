'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { IoIosSearch } from 'react-icons/io';
import { FiTrendingUp } from 'react-icons/fi';
import Pagination from '@/components/Pagination/Pagination';
import Loader from '@/components/Loader/Loader';
import { safeFetch, getAdminId } from '@/lib/safeFetch';

interface User {
    _id: string;
    username: string;
    name: string;
    coins: number;
    picture?: string;
}

export default function ReferralsPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const { user } = useSelector((state: RootState) => state.user);
    const adminId = user;

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await safeFetch(`${apiUrl}/admin/${adminId}/registered-users`);

                if (!response.ok) throw new Error('Failed to fetch users');
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (adminId) fetchUsers();
    }, [apiUrl, adminId]);

    const sortedData = [...data].sort((a, b) => (b.coins || 0) - (a.coins || 0));
    const filteredData = sortedData.filter((user) =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const getRankBadge = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <FiTrendingUp className="text-2xl text-teal-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Referral Leaderboard</h1>
                        <p className="text-gray-500">Top users by referral coins</p>
                    </div>
                </div>

                <div className="relative">
                    <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                    <input
                        type="text"
                        placeholder="Search user"
                        className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 w-64 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Participants</p>
                    <p className="text-2xl font-bold text-gray-900">{data.length}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                    <p className="text-yellow-700 text-sm">🥇 Top Referrer</p>
                    <p className="text-xl font-bold text-gray-900">{sortedData[0]?.username || 'N/A'}</p>
                    <p className="text-yellow-700 text-sm">{sortedData[0]?.coins || 0} coins</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Coins</p>
                    <p className="text-2xl font-bold text-teal-600">{data.reduce((acc, u) => acc + (u.coins || 0), 0).toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm">Active Referrers</p>
                    <p className="text-2xl font-bold text-gray-900">{data.filter((u) => (u.coins || 0) > 0).length}</p>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
                    <div>Rank</div>
                    <div className="col-span-2">Username</div>
                    <div className="text-right">Referral Coins</div>
                </div>

                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader />
                        </div>
                    ) : paginatedData.length === 0 ? (
                        <div className="text-gray-500 text-center py-12">No users found</div>
                    ) : (
                        paginatedData.map((user, index) => {
                            const globalRank = (currentPage - 1) * itemsPerPage + index + 1;
                            return (
                                <div
                                    key={user._id}
                                    className={`grid grid-cols-4 gap-4 p-4 items-center hover:bg-gray-50 transition-colors ${globalRank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''
                                        }`}
                                >
                                    <div className="text-2xl">{getRankBadge(globalRank)}</div>
                                    <div className="col-span-2 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                            {user.picture && (
                                                <img src={user.picture} alt={user.username} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-medium">{user.username}</p>
                                            <p className="text-gray-500 text-sm">{user.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-teal-600 font-bold text-lg">{(user.coins || 0).toLocaleString()}</span>
                                        <span className="text-gray-500 text-sm ml-1">coins</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-6">
                <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
}
