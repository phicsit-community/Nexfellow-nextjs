'use client';

import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import styles from "./Users.module.css";
import Table from "@/components/Table/Table";
import { IoIosSearch } from "react-icons/io";
import { useAuth, authFetch } from "@/hooks/useAuth";

interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    picture?: string;
    createdAt?: string;
    country?: string;
    verificationBadge?: boolean;
    premiumBadge?: boolean;
    communityBadge?: boolean;
    createdCommunity?: {
        accountType?: string;
    };
}

const UsersPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const { adminId, token, isReady } = useAuth();
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

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

    return (
        <div className={styles.maincontainer}>
            <div className={styles.userHeader}>
                <div>
                    <div className={styles.title}>Users</div>
                    <div className={styles.totalUser}>Total User : {data.length}</div>
                </div>

                <div className={styles.searchBarAndFilter}>
                    <div className={styles.searchContainer}>
                        <IoIosSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search user"
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={handleSearchQuery}
                        />
                    </div>
                </div>

                <button onClick={downloadCSV} className={styles.downloadBtn}>
                    Download CSV
                </button>
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
};

export default UsersPage;
