'use client';

import { useEffect, useState } from 'react';
import { FiX, FiEye, FiSearch } from 'react-icons/fi';
import { BsFileText, BsClock, BsCheckCircle, BsXCircle } from 'react-icons/bs';
import { AiOutlineUser } from 'react-icons/ai';
import { toast } from 'sonner';
import { safeFetch } from '@/lib/safeFetch';

interface PopulatedUser {
    _id: string;
    username: string;
    email: string;
    name?: string;
    picture?: string;
}

interface VerificationRequest {
    _id: string;
    action: string;
    userId: PopulatedUser;
    message?: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    communityName: string;
    description: string;
    email: string;
    accountType: 'Individual' | 'Organization';
    socialMediaLink?: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}

export default function VerificationsPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
    const [search, setSearch] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
    const [showDetail, setShowDetail] = useState(false);
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
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const res = await safeFetch(`${apiUrl}/requests`);
                if (res.ok) {
                    const data = await res.json();
                    setRequests(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Failed to load requests:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [apiUrl]);

    const handleApprove = async (id: string) => {
        try {
            const res = await safeFetch(`${apiUrl}/requests/${id}/approve`, {
                method: 'PUT',
            });
            if (res.ok) {
                setRequests((prev) =>
                    prev.map((req) => (req._id === id ? { ...req, status: 'Approved' as const } : req))
                );
                toast.success('Request approved successfully');
                setShowDetail(false);
            } else {
                const data = await res.json().catch(() => null);
                toast.error(data?.message || 'Failed to approve request');
            }
        } catch {
            toast.error('Failed to approve request');
        }
    };

    const handleReject = async (id: string) => {
        try {
            const res = await safeFetch(`${apiUrl}/requests/${id}/reject`, {
                method: 'PUT',
            });
            if (res.ok) {
                setRequests((prev) =>
                    prev.map((req) => (req._id === id ? { ...req, status: 'Rejected' as const } : req))
                );
                toast.success('Request rejected');
                setShowDetail(false);
            } else {
                const data = await res.json().catch(() => null);
                toast.error(data?.message || 'Failed to reject request');
            }
        } catch {
            toast.error('Failed to reject request');
        }
    };

    const filteredRequests = requests
        .filter((req) => filter === 'all' ? true : req.status === filter)
        .filter((req) => {
            if (!search) return true;
            const q = search.toLowerCase();
            return (
                req.communityName?.toLowerCase().includes(q) ||
                req.userId?.name?.toLowerCase().includes(q) ||
                req.userId?.username?.toLowerCase().includes(q) ||
                req.userId?.email?.toLowerCase().includes(q) ||
                req.category?.toLowerCase().includes(q)
            );
        });

    const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.status === 'Pending').length,
        approved: requests.filter((r) => r.status === 'Approved').length,
        rejected: requests.filter((r) => r.status === 'Rejected').length,
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            Pending: 'bg-[#FF8000] text-white',
            Approved: 'bg-[#16A34A] text-white',
            Rejected: 'bg-[#D94040] text-white',
        };
        return (
            <span className={`inline-flex items-center justify-center w-24 py-1.5 rounded-lg text-xs font-semibold ${styles[status] || 'bg-gray-200 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="h-full bg-gray-50 p-4 sm:p-6 md:p-8 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Verification</h1>
                    <p className="text-gray-500 text-sm">Communicate with your users instantly</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-700 text-sm font-medium">{activeUsers.toLocaleString()} Active Users</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 shrink-0">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Requests</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <BsFileText className="text-blue-500 text-lg" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Pending</p>
                            <p className="text-2xl font-bold text-orange-500 mt-1">{stats.pending}</p>
                        </div>
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                            <BsClock className="text-orange-500 text-lg" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Approved</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                            <BsCheckCircle className="text-green-500 text-lg" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Rejected</p>
                            <p className="text-2xl font-bold text-red-500 mt-1">{stats.rejected}</p>
                        </div>
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                            <BsXCircle className="text-red-500 text-lg" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or community..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as typeof filter)}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="overflow-auto flex-1 min-h-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Username</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="text-gray-500 text-center py-12">Loading...</td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-gray-500 text-center py-12">No verification requests found</td>
                                </tr>
                            ) : (
                                filteredRequests.map((request) => (
                                    <tr key={request._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-200">
                                                    {request.userId?.picture ? (
                                                        <img
                                                            src={request.userId.picture}
                                                            alt={request.userId?.name || request.userId?.username || ''}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-200 text-sm font-semibold">
                                                            {(request.communityName || request.userId?.name || request.userId?.username || 'U')
                                                                .split(' ')
                                                                .map((w: string) => w[0])
                                                                .slice(0, 2)
                                                                .join('')
                                                                .toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-gray-900 font-medium">{request.communityName || request.userId?.name || request.userId?.username || 'Unknown'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-500">@{request.userId?.username || '—'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {statusBadge(request.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() => { setSelectedRequest(request); setShowDetail(true); }}
                                                    className="text-gray-700 hover:text-gray-900 font-medium text-sm flex items-center gap-1.5 transition-colors"
                                                >
                                                    <FiEye className="text-base" />
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetail && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-5 sm:px-8">

                        {/* Header */}
                        <div className="flex flex-row flex-wrap justify-between items-start p-2 sm:p-4 gap-3">
                            <h2 className="text-lg sm:text-xl md:text-[26px] leading-tight sm:leading-10 font-bold text-[#121717]">
                                Community Verification Request Details
                            </h2>
                            <button
                                onClick={() => setShowDetail(false)}
                                className="flex items-center justify-center hover:bg-gray-100 transition-colors"
                                style={{ width: 36, height: 36, borderRadius: 8 }}
                            >
                                <FiX style={{ width: 20, height: 20, color: '#9CA3AF' }} />
                            </button>
                        </div>

                        {/* User Profile */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start p-2 sm:p-4 gap-4">
                            <div className="shrink-0 overflow-hidden w-20 h-20 sm:w-[101px] sm:h-[101px] rounded-full">
                                {selectedRequest.userId?.picture ? (
                                    <img
                                        src={selectedRequest.userId.picture}
                                        alt="User"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <AiOutlineUser style={{ fontSize: 40, color: '#9CA3AF' }} />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col justify-center flex-1 min-w-0 p-2 sm:p-4 gap-1">
                                {/* Name + Badge */}
                                <div className="flex flex-row items-center" style={{ gap: 13, height: 30 }}>
                                    <span style={{ fontSize: 18, fontWeight: 700, lineHeight: '23px', color: '#121717' }}>
                                        {selectedRequest.communityName || selectedRequest.userId?.name || selectedRequest.userId?.username}
                                    </span>
                                    <span
                                        className="inline-flex items-center rounded-full capitalize"
                                        style={{
                                            padding: '5px 13px',
                                            gap: 10,
                                            fontSize: 14,
                                            lineHeight: '20px',
                                            background: selectedRequest.status === 'Approved' ? '#DCFCE7' : selectedRequest.status === 'Rejected' ? '#FEE2E2' : '#FEF9C3',
                                            border: `0.76px solid ${selectedRequest.status === 'Approved' ? '#86EFAC' : selectedRequest.status === 'Rejected' ? '#FECACA' : '#FEF08A'}`,
                                            color: selectedRequest.status === 'Approved' ? '#166534' : selectedRequest.status === 'Rejected' ? '#991B1B' : '#854D0E',
                                        }}
                                    >
                                        {selectedRequest.status.toLowerCase()}
                                    </span>
                                </div>

                                {/* Username + Description */}
                                <div className="flex flex-col" style={{ gap: 0 }}>
                                    <p style={{ fontSize: 16, lineHeight: '24px', color: '#638787' }}>
                                        @{selectedRequest.userId?.username}
                                    </p>
                                    {selectedRequest.description && (
                                        <p className="line-clamp-2" style={{ fontSize: 16, lineHeight: '24px', color: '#638787' }}>
                                            {selectedRequest.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="flex flex-col p-2 sm:p-4 gap-4 sm:gap-6">
                            {/* Row 1: Category + Request Date */}
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                <div className="flex flex-col" style={{ width: 186, paddingTop: 20, borderTop: '1px solid #E6E8EB', gap: 12 }}>
                                    <p style={{ fontSize: 14, lineHeight: '21px', color: '#08AAA2' }}>Category</p>
                                    <p style={{ fontSize: 14, lineHeight: '21px', color: '#121717' }}>{selectedRequest.category || 'N/A'}</p>
                                </div>
                                <div className="flex flex-col flex-1" style={{ paddingTop: 20, borderTop: '1px solid #E6E8EB', gap: 12 }}>
                                    <p style={{ fontSize: 14, lineHeight: '21px', color: '#08AAA2' }}>Request Date</p>
                                    <p style={{ fontSize: 14, lineHeight: '21px', color: '#121717' }}>{new Date(selectedRequest.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>
                            {/* Row 2: Account Type + Status */}
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                <div className="flex flex-col" style={{ width: 186, paddingTop: 20, borderTop: '1px solid #E6E8EB', gap: 12 }}>
                                    <p style={{ fontSize: 14, lineHeight: '21px', color: '#08AAA2' }}>Account Type</p>
                                    <p style={{ fontSize: 14, lineHeight: '21px', color: '#121717' }}>{selectedRequest.accountType || 'N/A'}</p>
                                </div>
                                <div className="flex flex-col flex-1" style={{ paddingTop: 20, borderTop: '1px solid #E6E8EB', gap: 12 }}>
                                    <p style={{ fontSize: 14, lineHeight: '21px', color: '#08AAA2' }}>Status</p>
                                    <p style={{ fontSize: 14, lineHeight: '21px', color: '#121717' }}>{selectedRequest.status}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {selectedRequest.status === 'Pending' && (
                            <div className="flex flex-row flex-wrap justify-between items-start" style={{ padding: '12px 16px' }}>
                                <button
                                    onClick={() => handleReject(selectedRequest._id)}
                                    className="flex items-center justify-center transition-colors hover:opacity-80"
                                    style={{ width: 160, height: 40, background: '#F0F5F5', borderRadius: 8, fontSize: 14, fontWeight: 700, lineHeight: '21px', color: '#121717' }}
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleApprove(selectedRequest._id)}
                                    className="flex items-center justify-center transition-colors hover:opacity-90"
                                    style={{ width: 160, height: 40, background: '#24B2B4', borderRadius: 8, fontSize: 14, fontWeight: 700, lineHeight: '21px', color: '#FFFFFF' }}
                                >
                                    Approve
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
