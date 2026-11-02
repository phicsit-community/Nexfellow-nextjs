"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios';
import noPosts from "./assets/no_posts.png";
import Post from "../Post/Post";

// styles
import styles from './User.module.css';

const UserCommunityBody = ({ userId }) => {
    const [activeTab, setActiveTab] = useState('Posts');
    const [userPosts, setUserPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [postsError, setPostsError] = useState(null);
    const [postsNeedSignIn, setPostsNeedSignIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        setPostsLoading(true);
        setPostsError(null);
        setPostsNeedSignIn(false);
        api.get(`/post/user/${userId}`, { params: { limit: 50 } })
            .then((res) => { if (!cancelled) setUserPosts(res.data.posts || []); })
            .catch((err) => {
                if (cancelled) return;
                // Posts are members-only; signed-out visitors of a shared profile link land here.
                if (err?.response?.status === 401) setPostsNeedSignIn(true);
                else setPostsError("Error retrieving posts: " + err.message);
            })
            .finally(() => { if (!cancelled) setPostsLoading(false); });
        return () => { cancelled = true; };
    }, [userId]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
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
                    onClick={() => handleTabClick('Achievements')}
                    className={`${styles.tab} ${activeTab === 'Achievements' ? styles.activeTab : ''}`}
                >
                    Achievements
                </button>
            </div>

            <div className={styles.contentSection}>
                {/* Posts Tab */}
                {activeTab === 'Posts' && postsLoading && <p>Loading posts...</p>}
                {activeTab === 'Posts' && postsError && <p className={styles.errorBox}>⚠️ {postsError}</p>}
                {activeTab === 'Posts' && !postsLoading && postsNeedSignIn && (
                    <div className={styles.noPostsContainer}>
                        <p className={styles.noPostsHead}>Sign in to see posts</p>
                        <p className={styles.noPostsMessage}>Posts on NexFellow are visible to members.</p>
                        <button className={styles.followButton} onClick={() => router.push('/sign-in')}>
                            Sign in
                        </button>
                    </div>
                )}
                {activeTab === 'Posts' && !postsLoading && !postsError && !postsNeedSignIn && (
                    userPosts.length > 0 ? (
                        <div className={styles.userPostsList}>
                            {userPosts.map((post) => (
                                <Post
                                    key={post._id}
                                    post={post}
                                    options={[{
                                        label: "View post",
                                        action: () => router.push(`/post/${post._id}`),
                                    }]}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noPostsContainer}>
                            <img className={styles.noPostsImage} src={noPosts?.src || noPosts} alt="No Posts" />
                            <p className={styles.noPostsHead}>Oops! Nothing To See Here Yet!</p>
                            <p className={styles.noPostsMessage}>There are no posts to show at the moment.</p>
                            <p className={styles.noPostsMessage}>Check back later to see updates!</p>
                        </div>
                    )
                )}

                {/* Achievements Tab - Coming Soon */}
                {activeTab === 'Achievements' && (
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
