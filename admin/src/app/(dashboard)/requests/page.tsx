'use client';

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiX, FiCheck, FiEye } from 'react-icons/fi';
import { AiOutlineUser } from 'react-icons/ai';
import { MdPending, MdCheckCircle, MdCancel } from 'react-icons/md';
import { toast } from 'sonner';
import Image from 'next/image';

interface Request {
    _id: string;
    user: {
        _id: string;
        username: string;
        email: string;
        name?: string;
        picture?: string;
    };
    type: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    documents?: string[];
    reason?: string;
}

export default function RequestsPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [activeUsers, setActiveUsers] = useState(0);

    useEffect(() => {
        const fetchActiveUsers = async () => {
            try {
                const res = await fetch(`${apiUrl}/admin/active-users/count`, { credentials: 'include' });
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
                const res = await fetch(`${apiUrl}/admin/verification-requests`, { credentials: 'include' });
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
            const res = await fetch(`${apiUrl}/admin/verification-requests/${id}/approve`, {
                method: 'POST',
                credentials: 'include',
            });
            if (res.ok) {
                setRequests((prev) =>
                    prev.map((req) => (req._id === id ? { ...req, status: 'approved' } : req))
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
            const res = await fetch(`${apiUrl}/admin/verification-requests/${id}/reject`, {
                method: 'POST',
                credentials: 'include',
            });
            if (res.ok) {
                setRequests((prev) =>
                    prev.map((req) => (req._id === id ? { ...req, status: 'rejected' } : req))
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
        pending: requests.filter((r) => r.status === 'pending').length,
        approved: requests.filter((r) => r.status === 'approved').length,
        rejected: requests.filter((r) => r.status === 'rejected').length,
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <MdPending className="text-yellow-400" />;
            case 'approved':
                return <MdCheckCircle className="text-green-400" />;
            case 'rejected':
                return <MdCancel className="text-red-400" />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="flex items-center gap-3 mb-8">
                <FiCheckCircle className="text-2xl text-teal-400" />
                <div>
                    <h1 className="text-2xl font-semibold text-white">Verification Requests</h1>
                    <p className="text-slate-400">Review and manage user verification requests</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <AiOutlineUser className="text-xl text-teal-400" />
                        <p className="text-slate-400 text-sm">Active Users</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{activeUsers.toLocaleString()}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Total Requests</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-400 text-sm">Approved</p>
                    <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 text-sm">Rejected</p>
                    <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                ? 'bg-teal-500 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {status !== 'all' && (
                            <span className="ml-2 bg-slate-600 px-2 py-0.5 rounded text-xs">
                                {stats[status as keyof typeof stats]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            <div className="space-y-3">
                {loading ? (
                    <p className="text-slate-400 text-center py-8">Loading...</p>
                ) : filteredRequests.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No requests found</p>
                ) : (
                    filteredRequests.map((request) => (
                        <div
                            key={request._id}
                            className="bg-slate-700 rounded-lg p-4 flex items-center justify-between hover:bg-slate-600/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-600 rounded-full overflow-hidden flex-shrink-0">
                                    {request.user?.picture ? (
                                        <img
                                            src={request.user.picture}
                                            alt="User"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <AiOutlineUser className="text-xl" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-medium">{request.user?.name || request.user?.username}</p>
                                    <p className="text-slate-400 text-sm">@{request.user?.username} • {request.user?.email}</p>
                                    <p className="text-slate-500 text-xs mt-1">
                                        Type: <span className="text-teal-400">{request.type}</span> •{' '}
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(request.status)}
                                    <span
                                        className={`px-3 py-1 rounded text-sm capitalize ${request.status === 'approved'
                                                ? 'bg-green-500/20 text-green-400'
                                                : request.status === 'rejected'
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-yellow-500/20 text-yellow-400'
                                            }`}
                                    >
                                        {request.status}
                                    </span>
                                </div>
                                <button
                                    onClick={() => { setSelectedRequest(request); setShowDetail(true); }}
                                    className="p-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                                >
                                    <FiEye />
                                </button>
                                {request.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(request._id)}
                                            className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                                        >
                                            <FiCheck />
                                        </button>
                                        <button
                                            onClick={() => handleReject(request._id)}
                                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
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
                    <div className="bg-slate-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-white">Request Details</h2>
                                <button
                                    onClick={() => setShowDetail(false)}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <FiX className="text-slate-400" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-slate-600 rounded-full overflow-hidden">
                                    {selectedRequest.user?.picture ? (
                                        <img
                                            src={selectedRequest.user.picture}
                                            alt="User"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <AiOutlineUser className="text-2xl" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-medium text-lg">{selectedRequest.user?.name || selectedRequest.user?.username}</p>
                                    <p className="text-slate-400">@{selectedRequest.user?.username}</p>
                                    <p className="text-slate-500 text-sm">{selectedRequest.user?.email}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="bg-slate-700 rounded-lg p-4">
                                    <p className="text-slate-400 text-sm">Request Type</p>
                                    <p className="text-white">{selectedRequest.type}</p>
                                </div>
                                <div className="bg-slate-700 rounded-lg p-4">
                                    <p className="text-slate-400 text-sm">Submitted On</p>
                                    <p className="text-white">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="bg-slate-700 rounded-lg p-4">
                                    <p className="text-slate-400 text-sm">Current Status</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getStatusIcon(selectedRequest.status)}
                                        <span className="text-white capitalize">{selectedRequest.status}</span>
                                    </div>
                                </div>
                                {selectedRequest.reason && (
                                    <div className="bg-slate-700 rounded-lg p-4">
                                        <p className="text-slate-400 text-sm">Reason Provided</p>
                                        <p className="text-white">{selectedRequest.reason}</p>
                                    </div>
                                )}
                            </div>

                            {selectedRequest.status === 'pending' && (
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
