'use client';

import { useState } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Image from 'next/image';
import { Pagination } from '@/components/ui/Pagination';
import { Loader } from '@/components/ui/Loader';
import styles from './Table.module.css';

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

interface TableProps {
    searchQuery: string;
    data: User[];
    setData: React.Dispatch<React.SetStateAction<User[]>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Table({ searchQuery, data, setData, loading, setLoading }: TableProps) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const filteredData = data.filter(
        (user) =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Delete User Confirmation
    const deleteUser = async (id: string) => {
        confirmAlert({
            title: 'Confirm',
            message: 'Are you sure you want to delete this user?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        setLoading(true);
                        try {
                            const response = await fetch(`${apiUrl}/admin/deleteuser/${id}`, {
                                method: 'DELETE',
                                credentials: 'include',
                            });

                            const result = await response.json();

                            if (response.ok) {
                                setData((prevData) => prevData.filter((user) => user._id !== id));
                                alert(result.message || 'User deleted successfully');
                            } else {
                                alert(result.message || 'Failed to delete user');
                            }
                        } catch (error) {
                            console.error('Error deleting user:', error);
                            alert('An error occurred while deleting the user. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
                {
                    label: 'No',
                    onClick: () => { },
                },
            ],
        });
    };

    // Toggle Verification Badge
    const onToggleVerification = (id: string, currentStatus: boolean) => {
        confirmAlert({
            title: 'Confirm',
            message: 'Are you sure you want to change the verification status of this user?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        const newStatus = !currentStatus;
                        setData((prevData) =>
                            prevData.map((user) =>
                                user._id === id ? { ...user, verificationBadge: newStatus } : user
                            )
                        );

                        try {
                            const response = await fetch(`${apiUrl}/admin/givebadge/${id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                            });

                            if (!response.ok) {
                                throw new Error('Failed to update user verification status');
                            }

                            const updatedUser = await response.json();
                            setData((prevData) =>
                                prevData.map((user) =>
                                    user._id === id
                                        ? {
                                            ...user,
                                            verificationBadge: updatedUser.verificationBadge,
                                            communityBadge: updatedUser.communityBadge,
                                            createdCommunity: user.createdCommunity
                                                ? { ...user.createdCommunity, accountType: updatedUser.accountType }
                                                : user.createdCommunity,
                                        }
                                        : user
                                )
                            );
                        } catch (error) {
                            console.error('Error updating user verification status:', error);
                            alert('An error occurred while updating the verification status. Please try again.');
                        }
                    },
                },
                {
                    label: 'No',
                    onClick: () => { },
                },
            ],
        });
    };

    // Give Community Badge
    const giveCommunityBadge = (id: string, currentStatus: boolean) => {
        confirmAlert({
            title: 'Confirm',
            message: 'Are you sure you want to change the community badge status?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        const newStatus = !currentStatus;

                        setData((prevData) =>
                            prevData.map((user) =>
                                user._id === id ? { ...user, communityBadge: newStatus } : user
                            )
                        );

                        try {
                            const response = await fetch(`${apiUrl}/admin/communitybadge/${id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                            });

                            if (!response.ok) {
                                throw new Error('Failed to update community badge');
                            }

                            const updatedUser = await response.json();

                            setData((prevData) =>
                                prevData.map((user) =>
                                    user._id === id
                                        ? {
                                            ...user,
                                            communityBadge: updatedUser.communityBadge,
                                            verificationBadge: updatedUser.verificationBadge,
                                            createdCommunity: user.createdCommunity
                                                ? { ...user.createdCommunity, accountType: updatedUser.accountType }
                                                : user.createdCommunity,
                                        }
                                        : user
                                )
                            );
                        } catch (error) {
                            console.error('Error updating community badge:', error);
                            alert('Failed to update community badge. Please try again.');
                        }
                    },
                },
                {
                    label: 'No',
                    onClick: () => { },
                },
            ],
        });
    };

    return (
        <div className={styles.tableContainer}>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Users</th>
                            <th>Contact</th>
                            <th>Occupation</th>
                            <th>Verified Badge</th>
                            <th>Action</th>
                        </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5}>
                                <div className={styles.loaderContainer}>
                                    <Loader />
                                </div>
                            </td>
                        </tr>
                    ) : (
                        paginatedData.map((user, index) => (
                            <tr key={`${user._id}-${index}`}>
                                <td className={styles.userCell}>
                                    <div className={styles.userImg}>
                                        <Image
                                            src={user?.picture || '/assets/Userpage/Nopicture.png'}
                                            alt="User"
                                            width={35}
                                            height={35}
                                            unoptimized
                                        />
                                    </div>
                                    <div className={styles.userInfo}>
                                        <div className={styles.userName}>{user.name}</div>
                                        <div className={styles.username}>@{user.username}</div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.contactInfo}>
                                        <div className={styles.email}>{user.email}</div>
                                        <div className={styles.phone}>{user.phoneNumber || ''}</div>
                                    </div>
                                </td>
                                <td>
                                    {user.createdCommunity?.accountType || 'Freelance'}
                                </td>
                                <td className={styles.badgeCell}>
                                    {/* Verification Badge */}
                                    <button onClick={() => onToggleVerification(user._id, user.verificationBadge)}>
                                        <Image
                                            src="/assets/badges/verified.svg"
                                            width={28}
                                            height={28}
                                            alt="Verification Badge"
                                            className={user.verificationBadge ? styles.verifiedimg : styles.unverifiedimg}
                                        />
                                    </button>

                                    {/* Community Badge */}
                                    <button
                                        onClick={() =>
                                            user.createdCommunity &&
                                            giveCommunityBadge(user._id, user.communityBadge)
                                        }
                                        disabled={!user.createdCommunity}
                                        title={
                                            user.createdCommunity
                                                ? 'Toggle Community Badge'
                                                : 'User has not created a community'
                                        }
                                        className={`${styles.badgeButton} ${!user.createdCommunity ? styles.disabled : ''}`}
                                    >
                                        <Image
                                            src="/assets/badges/community.svg"
                                            width={28}
                                            height={28}
                                            alt="Community Badge"
                                            className={user.communityBadge ? styles.verifiedimg : styles.unverifiedimg}
                                        />
                                    </button>
                                </td>
                                <td>
                                    <button onClick={() => deleteUser(user._id)} className={styles.deleteBtn}>
                                        <Image
                                            src="/assets/Icons/delete.png"
                                            width={20}
                                            height={20}
                                            alt="Delete"
                                        />
                                    </button>
                                </td>
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
    );
}
