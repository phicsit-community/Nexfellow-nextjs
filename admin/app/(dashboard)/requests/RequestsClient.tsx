'use client';

import { useEffect, useState } from 'react';
import { IoIosSearch } from 'react-icons/io';
import { LuDot } from 'react-icons/lu';
import { Loader } from '@/components/ui/Loader';
import { Pagination } from '@/components/ui/Pagination';
import styles from './Requests.module.css';

interface User {
    name?: string;
    username?: string;
}

interface Request {
    _id: string;
    userId?: User;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
}

interface RequestViewProps {
    request: Request;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onClose: () => void;
}

function RequestView({ request, onApprove, onReject, onClose }: RequestViewProps) {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h3>Request Details</h3>
                <div className={styles.requestDetails}>
                    <p><strong>Name:</strong> {request.userId?.name || 'Unknown'}</p>
                    <p><strong>Username:</strong> {request.userId?.username || 'Unknown'}</p>
                    <p><strong>Status:</strong> {request.status}</p>
                    <p><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                </div>
                <div className={styles.modalActions}>
                    {request.status === 'Pending' && (
                        <>
                            <button className={styles.approveBtn} onClick={() => onApprove(request._id)}>
                                Approve
                            </button>
                            <button className={styles.rejectBtn} onClick={() => onReject(request._id)}>
                                Reject
                            </button>
                        </>
                    )}
                    <button className={styles.closeBtn} onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export function RequestsClient() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [activeUsers, setActiveUsers] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        const fetchActiveUsers = async () => {
            try {
                const res = await fetch(`${apiUrl}/admin/active-users/count`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Failed');
                const data = await res.json();
                setActiveUsers(data.activeUsers);
            } catch {
                setActiveUsers(0);
            }
        };
        fetchActiveUsers();
    }, [apiUrl]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/requests/`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || 'Failed to fetch requests');
            setRequests(data);
        } catch (error: any) {
            console.error('Failed to fetch requests:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const totalCount = requests.length;
    const pendingCount = requests.filter((r) => r.status === 'Pending').length;
    const approvedCount = requests.filter((r) => r.status === 'Approved').length;
    const rejectedCount = requests.filter((r) => r.status === 'Rejected').length;

    const filteredRequests = requests.filter((request) => {
        const name = request.userId?.name?.toLowerCase() || '';
        const username = request.userId?.username?.toLowerCase() || '';
        const matchesSearch =
            name.includes(searchQuery.toLowerCase()) ||
            username.includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'All' || request.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const statusBadge = (status: string) => {
        if (status === 'Approved') return styles.statusApproved;
        if (status === 'Pending') return styles.statusPending;
        if (status === 'Rejected') return styles.statusRejected;
        return '';
    };

    const handleApproveRequest = async (id: string) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/requests/${id}/approve`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to approve request');
            }
            setSelectedRequest(null);
            await fetchRequests();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRejectRequest = async (id: string) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/requests/${id}/reject`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reject request');
            }
            setSelectedRequest(null);
            await fetchRequests();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.requestsPage}>
            {loading && <Loader />}

            {/* Header */}
            <div className={styles.headerRow}>
                <div>
                    <div className={styles.pageTitle}>Verification</div>
                    <div className={styles.pageSubtitle}>
                        Manage verification requests
                    </div>
                </div>
                <div className={styles.activeUsersBadge}>
                    <LuDot color="#00ff00" size={50} />
                    {activeUsers.toLocaleString()} Active Users
                </div>
            </div>

            {/* Summary Cards */}
            <div className={styles.summaryCardsContainer}>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryCardLabel}>
                        <p>Total Requests</p>
                        <div className={styles.summaryCardCount}>{totalCount}</div>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryCardLabel}>
                        <p>Pending</p>
                        <div className={styles.summaryCardCount}>{pendingCount}</div>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryCardLabel}>
                        <p>Approved</p>
                        <div className={styles.summaryCardCount}>{approvedCount}</div>
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryCardLabel}>
                        <p>Rejected</p>
                        <div className={styles.summaryCardCount}>{rejectedCount}</div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className={styles.tableHeaderRow}>
                <div className={styles.searchContainer}>
                    <IoIosSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or community..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className={styles.statusFilter}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>

            {/* Table */}
            <div className={styles.tableContainer}>
                <div className={styles.tableWrapper}>
                    <div className={styles.table}>
                        <div className={styles.tableRowHeader}>
                            <div>Name</div>
                            <div>Username</div>
                            <div>Status</div>
                            <div>Actions</div>
                        </div>
                        {paginatedRequests.map((request) => (
                            <div className={styles.tableRow} key={request._id}>
                                <div>{request.userId?.name || 'Unknown'}</div>
                                <div>{request.userId?.username || 'Unknown'}</div>
                                <div>
                                    <span
                                        className={`${styles.statusBadge} ${statusBadge(
                                            request.status
                                        )}`}
                                    >
                                        {request.status}
                                    </span>
                                </div>
                                <div>
                                    <button
                                        className={styles.viewBtn}
                                        onClick={() => setSelectedRequest(request)}
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                        {paginatedRequests.length === 0 && (
                            <div className={styles.noRequestsMessage}>
                                No requests available.
                            </div>
                        )}
                    </div>
                </div>
                <Pagination
                    totalPages={Math.ceil(filteredRequests.length / itemsPerPage)}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </div>

            {selectedRequest && (
                <RequestView
                    request={selectedRequest}
                    onApprove={handleApproveRequest}
                    onReject={handleRejectRequest}
                    onClose={() => setSelectedRequest(null)}
                />
            )}
        </div>
    );
}
