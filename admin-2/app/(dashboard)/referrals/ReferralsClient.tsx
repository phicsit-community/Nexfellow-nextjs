'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { IoIosSearch } from 'react-icons/io';
import { Pagination } from '@/components/ui/Pagination';
import { Loader } from '@/components/ui/Loader';
import type { RootState } from '@/lib/store/store';
import styles from './Referrals.module.css';

interface User {
    _id: string;
    username: string;
    coins: number;
}

export function ReferralsClient() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const { user } = useSelector((state: RootState) => state.user);
    const adminId = user;
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!adminId) return;
            setLoading(true);
            try {
                const response = await fetch(
                    `${apiUrl}/admin/${adminId}/registered-users`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };

        fetchUsers();
    }, [apiUrl, adminId]);

    const sortedData = [...data].sort((a, b) => b.coins - a.coins);
    const filteredData = sortedData.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.header}>
                <div className={styles.title}>Referral Leaderboard</div>

                <div className={styles.searchContainer}>
                    <IoIosSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search"
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={handleSearchQuery}
                    />
                </div>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Username</th>
                                <th>Referrals</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3}>
                                        <div className={styles.loader}>
                                            <Loader />
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((user, index) => (
                                    <tr key={`${user._id}-${index}`}>
                                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td>{user.username}</td>
                                        <td>{user.coins}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    totalPages={Math.ceil(filteredData.length / itemsPerPage)}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
