'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Home.module.css';

interface Contest {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    status?: string;
    startTime?: string;
    createdAt?: string;
}

export function HomeClient() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const response = await fetch(`${apiUrl}/admin/getallquizzes`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setContests(data);
                }
            } catch (error) {
                console.error('Failed to fetch contests:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchContests();
    }, [apiUrl]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contest?')) return;
        
        try {
            const response = await fetch(`${apiUrl}/admin/deletequiz/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                setContests(contests.filter(c => c._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete contest:', error);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const filteredContests = contests.filter(contest => {
        const matchesSearch = contest.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contest.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || contest.category === categoryFilter;
        const matchesStatus = !statusFilter || contest.status === statusFilter;
        
        let matchesMonth = true;
        let matchesYear = true;
        
        if (contest.createdAt || contest.startTime) {
            const date = new Date(contest.createdAt || contest.startTime || '');
            if (monthFilter) {
                matchesMonth = date.getMonth() + 1 === parseInt(monthFilter);
            }
            if (yearFilter) {
                matchesYear = date.getFullYear() === parseInt(yearFilter);
            }
        }
        
        return matchesSearch && matchesCategory && matchesStatus && matchesMonth && matchesYear;
    });

    const categories = [...new Set(contests.map(c => c.category).filter(Boolean))];
    const statuses = [...new Set(contests.map(c => c.status).filter(Boolean))];
    const years = [...new Set(contests.map(c => {
        const date = new Date(c.createdAt || c.startTime || '');
        return date.getFullYear();
    }).filter(y => !isNaN(y)))];

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <h1 className={styles.title}>Contests</h1>
                <Link href="/quiz/create" className={styles.createBtn}>
                    + Create Contest
                </Link>
            </div>

            <div className={styles.filtersRow}>
                <div className={styles.searchBox}>
                    <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Status</option>
                        {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>

                    <select
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>

                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Year</option>
                        {years.sort((a, b) => b - a).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading contests...</div>
            ) : filteredContests.length === 0 ? (
                <div className={styles.empty}>No contests found.</div>
            ) : (
                <div className={styles.contestsGrid}>
                    {filteredContests.map((contest) => (
                        <div key={contest._id} className={styles.contestCard}>
                            <h3 className={styles.contestTitle}>{contest.title}</h3>
                            <p className={styles.contestDescription}>
                                {contest.description || 'Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi.'}
                            </p>
                            <p className={styles.contestDate}>
                                Date: {formatDate(contest.createdAt || contest.startTime)}
                            </p>
                            <div className={styles.cardActions}>
                                <button
                                    onClick={() => handleDelete(contest._id)}
                                    className={styles.deleteBtn}
                                >
                                    Delete
                                </button>
                                <Link href={`/quiz/${contest._id}`} className={styles.viewBtn}>
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
