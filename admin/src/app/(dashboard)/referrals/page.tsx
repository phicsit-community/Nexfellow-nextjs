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
        <div className="min-h-screen p-6">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <FiTrendingUp className="text-2xl text-teal-400" />
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Referral Leaderboard</h1>
                        <p className="text-slate-400">Top users by referral coins</p>
                    </div>
                </div>

                <div className="relative">
                    <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                    <input
                        type="text"
                        placeholder="Search user"
                        className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Total Participants</p>
                    <p className="text-2xl font-bold text-white">{data.length}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-lg p-4 border border-yellow-500/30">
                    <p className="text-yellow-400 text-sm">🥇 Top Referrer</p>
                    <p className="text-xl font-bold text-white">{sortedData[0]?.username || 'N/A'}</p>
                    <p className="text-yellow-400 text-sm">{sortedData[0]?.coins || 0} coins</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Total Coins</p>
                    <p className="text-2xl font-bold text-teal-400">{data.reduce((acc, u) => acc + (u.coins || 0), 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Active Referrers</p>
                    <p className="text-2xl font-bold text-white">{data.filter((u) => (u.coins || 0) > 0).length}</p>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-slate-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 gap-4 p-4 bg-slate-700 text-slate-300 font-semibold">
                    <div>Rank</div>
                    <div className="col-span-2">Username</div>
                    <div className="text-right">Referral Coins</div>
                </div>

                <div className="divide-y divide-slate-700">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader />
                        </div>
                    ) : paginatedData.length === 0 ? (
                        <div className="text-slate-400 text-center py-12">No users found</div>
                    ) : (
                        paginatedData.map((user, index) => {
                            const globalRank = (currentPage - 1) * itemsPerPage + index + 1;
                            return (
                                <div
                                    key={user._id}
                                    className={`grid grid-cols-4 gap-4 p-4 items-center hover:bg-slate-700/50 transition-colors ${globalRank <= 3 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
                                        }`}
                                >
                                    <div className="text-2xl">{getRankBadge(globalRank)}</div>
                                    <div className="col-span-2 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-600 rounded-full overflow-hidden">
                                            {user.picture && (
                                                <img src={user.picture} alt={user.username} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{user.username}</p>
                                            <p className="text-slate-400 text-sm">{user.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-teal-400 font-bold text-lg">{(user.coins || 0).toLocaleString()}</span>
                                        <span className="text-slate-400 text-sm ml-1">coins</span>
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
