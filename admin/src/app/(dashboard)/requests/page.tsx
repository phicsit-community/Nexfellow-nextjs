'use client';

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiX, FiCheck, FiEye } from 'react-icons/fi';
import { AiOutlineUser } from 'react-icons/ai';
import { MdPending, MdCheckCircle, MdCancel } from 'react-icons/md';
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

export default function RequestsPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
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
                toast.error('Failed to approve request');
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
                toast.error('Failed to reject request');
            }
        } catch {
            toast.error('Failed to reject request');
        }
    };

    const filteredRequests = requests.filter((req) =>
        filter === 'all' ? true : req.status === filter
    );

    const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.status === 'Pending').length,
        approved: requests.filter((r) => r.status === 'Approved').length,
        rejected: requests.filter((r) => r.status === 'Rejected').length,
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending':
                return <MdPending className="text-yellow-600" />;
            case 'Approved':
                return <MdCheckCircle className="text-green-600" />;
            case 'Rejected':
                return <MdCancel className="text-red-600" />;
            default:
                return null;
        }
    };

    return (
        <div className="h-full bg-gray-50 p-6 md:p-8 flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 mb-4 shrink-0">
                <FiCheckCircle className="text-2xl text-teal-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Verification Requests</h1>
                    <p className="text-gray-500">Review and manage user verification requests</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 shrink-0">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <AiOutlineUser className="text-xl text-teal-600" />
                        <p className="text-gray-500 text-sm">Active Users</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{activeUsers.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-yellow-700 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-700 text-sm">Approved</p>
                    <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-700 text-sm">Rejected</p>
                    <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 shrink-0">
                {(['all', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                            ? 'bg-teal-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        {status === 'all' ? 'All' : status}
                        {status !== 'all' && (
                            <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded text-xs">
                                {stats[status as keyof typeof stats]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
                {loading ? (
                    <p className="text-gray-500 text-center py-8">Loading...</p>
                ) : filteredRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No requests found</p>
                ) : (
                    filteredRequests.map((request) => (
                        <div
                            key={request._id}
                            className="bg-white rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0">
                                    {request.userId?.picture ? (
                                        <img
                                            src={request.userId.picture}
                                            alt="User"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <AiOutlineUser className="text-xl" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-gray-900 font-medium">{request.communityName || request.userId?.name || request.userId?.username}</p>
                                    <p className="text-gray-500 text-sm">@{request.userId?.username} • {request.userId?.email || request.email}</p>
                                    <p className="text-gray-400 text-xs mt-1">
                                        Category: <span className="text-teal-600">{request.category}</span> •{' '}
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(request.status)}
                                    <span
                                        className={`px-3 py-1 rounded text-sm capitalize font-medium ${request.status === 'Approved'
                                            ? 'bg-green-100 text-green-700'
                                            : request.status === 'Rejected'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                    >
                                        {request.status}
                                    </span>
                                </div>
                                <button
                                    onClick={() => { setSelectedRequest(request); setShowDetail(true); }}
                                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                >
                                    <FiEye />
                                </button>
                                {request.status === 'Pending' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(request._id)}
                                            className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                                        >
                                            <FiCheck />
                                        </button>
                                        <button
                                            onClick={() => handleReject(request._id)}
                                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                        >
                                            <FiX />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            {showDetail && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
                                <button
                                    onClick={() => setShowDetail(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FiX className="text-gray-600" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                                    {selectedRequest.userId?.picture ? (
                                        <img
                                            src={selectedRequest.userId.picture}
                                            alt="User"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <AiOutlineUser className="text-2xl" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-gray-900 font-medium text-lg">{selectedRequest.communityName || selectedRequest.userId?.name || selectedRequest.userId?.username}</p>
                                    <p className="text-gray-500">@{selectedRequest.userId?.username}</p>
                                    <p className="text-gray-400 text-sm">{selectedRequest.userId?.email || selectedRequest.email}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <p className="text-gray-500 text-sm">Category</p>
                                    <p className="text-gray-900">{selectedRequest.category}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <p className="text-gray-500 text-sm">Account Type</p>
                                    <p className="text-gray-900">{selectedRequest.accountType}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <p className="text-gray-500 text-sm">Submitted On</p>
                                    <p className="text-gray-900">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <p className="text-gray-500 text-sm">Current Status</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getStatusIcon(selectedRequest.status)}
                                        <span className="text-gray-900 capitalize">{selectedRequest.status}</span>
                                    </div>
                                </div>
                                {selectedRequest.description && (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                        <p className="text-gray-500 text-sm">Description</p>
                                        <p className="text-gray-900">{selectedRequest.description}</p>
                                    </div>
                                )}
                            </div>

                            {selectedRequest.status === 'Pending' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApprove(selectedRequest._id)}
                                        className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiCheck /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedRequest._id)}
                                        className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FiX /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
