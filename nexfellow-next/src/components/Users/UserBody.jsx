"use client";

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios';
import ProfileImage from "./assets/profile_image.svg";
import noPosts from "./assets/no_posts.png";

// styles
import styles from './User.module.css';

const UserCommunityBody = ({ userId, otherUserId }) => {
    const [activeTab, setActiveTab] = useState('Posts');
    const [mutualConnections, setMutualConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [followingStatus, setFollowingStatus] = useState({});
    const [loadingFollow, setLoadingFollow] = useState({});
    const router = useRouter();
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

    useEffect(() => {
        fetchMutualConnections();
    }, [userId, otherUserId]);

    const fetchMutualConnections = async () => {
        if (!otherUserId) return;
        setLoading(true);
        setError(null);

        try {
            if (!isLoggedIn) { setMutualConnections([]); return; }
            const response = await api.get(`/user/mutual-connections/${userId}/${otherUserId}`);
            const connections = response.data.mutualConnections || [];
            setMutualConnections(connections);

            // Fetch follow status for each connection
            const followStatuses = await Promise.all(
                connections.map(async (connection) => {
                    if (!isLoggedIn) return { id: connection._id, isFollowing: false };
                    const res = await api.get(`/user/followStatus/${connection._id}`);
                    return { id: connection._id, isFollowing: res.data.isFollowing };
                })
            );

            // Convert array to an object: { userId1: true, userId2: false, ... }
            const followStatusMap = followStatuses.reduce((acc, curr) => {
                acc[curr.id] = curr.isFollowing;
                return acc;
            }, {});

            setFollowingStatus(followStatusMap);
        } catch (err) {
            setError("Error retrieving mutual connections: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleFollow = async (targetUserId) => {
        if (loadingFollow[targetUserId]) return;

        const action = followingStatus[targetUserId] ? "unfollow" : "follow";

        setLoadingFollow(prev => ({ ...prev, [targetUserId]: true }));

        try {
            if (!isLoggedIn) return;
            await api.post(`/user/toggleFollow/${targetUserId}`, { action });

            setFollowingStatus(prev => ({ ...prev, [targetUserId]: !prev[targetUserId] }));
        } catch (err) {
            console.error("Error following/unfollowing:", err.message);
        } finally {
            setLoadingFollow(prev => ({ ...prev, [targetUserId]: false }));
        }
    };


    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleProfileClick = (connection) => {
        if (connection.isCommunityAccount && connection.createdCommunity) {
            router.push(`/community/${connection.username}`);
        } else {
            router.push(`/user/${connection.username}`);
        }
    };

    return (
        <div className={styles.CommunityBodyContainer}>
            <div className={styles.tabs}>
                <button
                    onClick={() => handleTabClick('Posts')}
                    className={`${styles.tab} ${activeTab === 'Posts' ? styles.activeTab : ''}`}
                >
                    Posts
                </button>
                <button
                    onClick={() => handleTabClick('Mutual Connections')}
                    className={`${styles.tab} ${activeTab === 'Mutual Connections' ? styles.activeTab : ''}`}
                >
                    Connections
                </button>
                <button
                    onClick={() => handleTabClick('Achievements')}
                    className={`${styles.tab} ${activeTab === 'Achievements' ? styles.activeTab : ''}`}
                >
                    Achievements
                </button>
            </div>

            <div className={styles.contentSection}>
                {loading && <p>Loading...</p>}
                {error && <p className={styles.errorBox}>⚠️ {error}</p>}

                {/* Posts Tab - Coming Soon */}
                {activeTab === 'Posts' && !loading && !error && (
                    <div className={styles.noPostsContainer}>
                        <img className={styles.noPostsImage} src={noPosts?.src || noPosts} alt="No Posts" />
                        <p className={styles.noPostsHead}>Oops! Nothing To See Here Yet!</p>
                        <p className={styles.noPostsMessage}>There are no posts to show at the moment.</p>
                        <p className={styles.noPostsMessage}>Check back later to see updates!</p>
                    </div>
                )}

                {/* Mutual Connections Tab */}
                {activeTab === 'Mutual Connections' && !loading && !error && (
                    <div className={styles.membersList}>
                        {mutualConnections.length > 0 ? (
                            mutualConnections.map((connection) => (
                                <div key={connection._id} className={styles.memberItem}>
                                    <div className={styles.memberProfile}>
                                        <img
                                            src={connection.picture || ProfileImage}
                                            alt="Profile"
                                            className={styles.profileImage}
                                            onClick={() => handleProfileClick(connection)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <div className={styles.profileDetails}>
                                            <h4
                                                className={styles.profileName}
                                                onClick={() => handleProfileClick(connection)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {connection.name}
                                            </h4>
                                            <p
                                                className={styles.profileUsername}
                                                onClick={() => handleProfileClick(connection)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                @{connection.username}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        className={styles.followButton}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFollow(connection._id);
                                        }}
                                        disabled={loadingFollow[connection._id]}
                                    >
                                        {loadingFollow[connection._id] ? "Loading..." : followingStatus[connection._id] ? "Unfollow" : "Follow"}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No mutual connections to display.</p>
                        )}
                    </div>
                )}

                {/* Achievements Tab - Coming Soon */}
                {activeTab === 'Achievements' && !loading && !error && (
                    <div className={styles.noPostsContainer}>
                        <img className={styles.noPostsImage} src={noPosts?.src || noPosts} alt="No Achievements" />
                        <p className={styles.noPostsHead}>Achievements Coming Soon!</p>
                        <p className={styles.noPostsMessage}>This section is under development.</p>
                        <p className={styles.noPostsMessage}>Stay tuned for updates!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserCommunityBody;
