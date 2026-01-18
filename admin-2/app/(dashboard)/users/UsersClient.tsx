'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { saveAs } from 'file-saver';
import { IoIosSearch } from 'react-icons/io';
import { Table } from '@/components/ui/Table';
import type { RootState } from '@/lib/store/store';
import styles from './Users.module.css';

interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    picture?: string;
    phoneNumber?: string;
    country?: string;
    createdAt: string;
    verificationBadge: boolean;
    premiumBadge: boolean;
    communityBadge: boolean;
    createdCommunity?: {
        accountType?: string;
    };
}

export function UsersClient() {
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const { user } = useSelector((state: RootState) => state.user);
    const adminId = user;

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
                const sortedUsers = result.sort(
                    (a: User, b: User) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setData(sortedUsers);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };

        fetchUsers();
    }, [apiUrl, adminId]);

    const handleSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const downloadCSV = () => {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]).filter(
            (key) => key !== '__v' && key !== '_id'
        );

        const csvRows = [
            headers.join(','),
            ...data.map((user) =>
                headers.map((field) => `"${(user as unknown as Record<string, unknown>)[field] ?? ''}"`).join(',')
            ),
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `registered_users_${new Date().toISOString()}.csv`);
    };

    return (
        <div className={styles.maincontainer}>
            <div className={styles.userHeader}>
                <div>
                    <div className={styles.title}>Users</div>
                    <div className={styles.totalUser}>Total Users: {data.length}</div>
                </div>

                <div className={styles.searchBarAndFilter}>
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
            </div>

            <Table
                searchQuery={searchQuery}
                data={data}
                setData={setData}
                loading={loading}
                setLoading={setLoading}
            />
        </div>
    );
}
