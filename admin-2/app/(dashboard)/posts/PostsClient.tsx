'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { FiSearch, FiTrash2, FiEyeOff, FiRotateCw } from 'react-icons/fi';
import { toast } from 'sonner';
import axios from 'axios';
import styles from './Posts.module.css';

const PAGE_SIZE = 20;

interface Author {
    name?: string;
    username?: string;
}

interface Post {
    _id: string;
    content: string;
    title?: string;
    author?: Author;
    createdAt: string;
    isDeleted: boolean;
    takedownReason?: string;
    underReview?: string;
    deletedAt?: string;
}

export function PostsClient() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const [posts, setPosts] = useState<Post[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showTakedown, setShowTakedown] = useState(false);
    const [showRestore, setShowRestore] = useState(false);
    const [takedownReason, setTakedownReason] = useState('');
    const [activeTab, setActiveTab] = useState<'posts' | 'appealed'>('posts');
    const [showReject, setShowReject] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${apiUrl}/admin/posts`, {
                params: { page, limit: PAGE_SIZE, search },
                withCredentials: true,
            })
            .then((res) => {
                if (page === 1) {
                    setPosts(res.data.posts);
                } else {
                    setPosts((prev) => [...prev, ...res.data.posts]);
                }
                setHasMore(res.data.posts.length === PAGE_SIZE);
            })
            .catch(() => toast.error('Failed to load posts'))
            .finally(() => setLoading(false));
    }, [page, search, apiUrl]);

    const lastPostRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (loading || !hasMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) setPage((p) => p + 1);
        });
        if (lastPostRef.current && activeTab === 'posts') observer.current.observe(lastPostRef.current);
    }, [loading, hasMore, activeTab]);

    const handleDelete = (postId: string) => {
        setShowConfirm(false);
        setSending(true);
        axios
            .delete(`${apiUrl}/admin/posts/${postId}`, { withCredentials: true })
            .then(() => {
                toast.success('Post deleted');
                setPosts((prev) => prev.filter((p) => p._id !== postId));
            })
            .catch(() => toast.error('Failed to delete post'))
            .finally(() => setSending(false));
    };

    const handleTakedown = (postId: string, reason: string) => {
        setShowTakedown(false);
        setSending(true);
        axios
            .patch(`${apiUrl}/admin/posts/${postId}/takedown`, { reason }, { withCredentials: true })
            .then(() => {
                toast.success('Post taken down');
                setPosts((prev) =>
                    prev.map((p) =>
                        p._id === postId ? { ...p, isDeleted: true, takedownReason: reason } : p
                    )
                );
            })
            .catch(() => toast.error('Failed to take down post'))
            .finally(() => setSending(false));
    };

    const handleRestore = (postId: string) => {
        setShowRestore(false);
        setSending(true);
        axios
            .patch(`${apiUrl}/admin/posts/${postId}/restore`, {}, { withCredentials: true })
            .then(() => {
                toast.success('Post restored');
                setPosts((prev) =>
                    prev.map((p) =>
                        p._id === postId
                            ? { ...p, isDeleted: false, takedownReason: '', deletedAt: undefined, underReview: undefined }
                            : p
                    )
                );
            })
            .catch(() => toast.error('Failed to restore post'))
            .finally(() => setSending(false));
    };

    const handleRejectAppeal = (postId: string, reason: string) => {
        setShowReject(false);
        setSending(true);
        axios
            .post(`${apiUrl}/admin/posts/${postId}/reject-appeal`, { rejectionReason: reason }, { withCredentials: true })
            .then(() => {
                toast.success('Appeal rejected');
                setPosts((prev) =>
                    prev.map((p) =>
                        p._id === postId ? { ...p, underReview: 'rejected' } : p
                    )
                );
            })
            .catch(() => toast.error('Failed to reject appeal'))
            .finally(() => setSending(false));
    };

    useEffect(() => {
        setPage(1);
        setHasMore(true);
    }, [search]);

    const appealedPosts = posts.filter(
        (p) => p.isDeleted && (p.underReview === 'pending' || p.underReview === 'rejected')
    );
    const regularPosts = posts.filter(
        (p) => !(p.isDeleted && p.underReview === 'pending')
    );

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.panelContainer}>
                <div className={styles.panel}>
                    <div className={styles.header}>
                        <h2 className={styles.heading}>Admin Posts Control</h2>
                        <div className={styles.searchBox}>
                            <FiSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search posts by content, author, or community"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'posts' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('posts')}
                        >
                            Posts
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 'appealed' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('appealed')}
                        >
                            Appealed Posts
                        </button>
                    </div>

                    {/* Tab Panels */}
                    <div className={styles.tabContent}>
                        {activeTab === 'posts' && (
                            <div className={styles.postsList}>
                                {regularPosts.length === 0 && !loading && (
                                    <div className={styles.empty}>No posts found.</div>
                                )}
                                {regularPosts.map((post, idx) => (
                                    <div
                                        key={post._id}
                                        className={`${styles.postCard} ${post.isDeleted ? styles.takenDown : ''}`}
                                        ref={idx === regularPosts.length - 1 ? lastPostRef : null}
                                    >
                                        <div className={styles.postMeta}>
                                            <span className={styles.author}>
                                                {post.author?.name || 'Unknown'} (@{post.author?.username || 'user'})
                                            </span>
                                            <span className={styles.date}>
                                                {new Date(post.createdAt).toLocaleString()}
                                            </span>
                                            {post.isDeleted && (
                                                <span className={styles.takedownLabel}>Taken Down</span>
                                            )}
                                        </div>
                                        <div className={styles.content}>
                                            <p>
                                                {post.content?.slice(0, 150)}
                                                {post.content?.length > 150 ? '...' : ''}
                                            </p>
                                        </div>
                                        <div className={styles.actions}>
                                            {!post.isDeleted && (
                                                <button
                                                    className={styles.takedownBtn}
                                                    onClick={() => {
                                                        setSelectedPost(post);
                                                        setShowTakedown(true);
                                                        setTakedownReason('');
                                                    }}
                                                    disabled={sending}
                                                    title="Temporarily take down"
                                                >
                                                    <FiEyeOff />
                                                    Takedown
                                                </button>
                                            )}
                                            {post.isDeleted && (
                                                <button
                                                    className={styles.restoreBtn}
                                                    onClick={() => {
                                                        setSelectedPost(post);
                                                        setShowRestore(true);
                                                    }}
                                                    disabled={sending}
                                                    title="Restore Post"
                                                >
                                                    <FiRotateCw />
                                                    Restore
                                                </button>
                                            )}
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => {
                                                    setSelectedPost(post);
                                                    setShowConfirm(true);
                                                }}
                                                disabled={sending}
                                                title="Delete permanently"
                                            >
                                                <FiTrash2 />
                                                Delete
                                            </button>
                                        </div>
                                        {post.isDeleted && post.takedownReason && (
                                            <div className={styles.takedownReason}>
                                                <strong>Reason:</strong> {post.takedownReason}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {loading && <div className={styles.loading}>Loading...</div>}
                            </div>
                        )}

                        {activeTab === 'appealed' && (
                            <div className={styles.postsList}>
                                {appealedPosts.length === 0 && !loading && (
                                    <div className={styles.empty}>No appealed posts.</div>
                                )}
                                {appealedPosts.map((post) => (
                                    <div
                                        key={post._id}
                                        className={`${styles.postCard} ${styles.takenDown}`}
                                    >
                                        <div className={styles.postMeta}>
                                            <span className={styles.author}>
                                                {post.author?.name || 'Unknown'} (@{post.author?.username || 'user'})
                                            </span>
                                            <span className={styles.date}>
                                                {new Date(post.createdAt).toLocaleString()}
                                            </span>
                                            {post.underReview === 'pending' && <span>Appealed</span>}
                                            {post.underReview === 'rejected' && <span style={{ color: '#e74c3c' }}>Appeal Rejected</span>}
                                        </div>
                                        <div className={styles.content}>
                                            <p>
                                                {post.content?.slice(0, 150)}
                                                {post.content?.length > 150 ? '...' : ''}
                                            </p>
                                        </div>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.restoreBtn}
                                                onClick={() => {
                                                    setSelectedPost(post);
                                                    setShowRestore(true);
                                                }}
                                                disabled={sending}
                                                title="Restore Post"
                                            >
                                                <FiRotateCw />
                                                Restore
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => {
                                                    setSelectedPost(post);
                                                    setShowConfirm(true);
                                                }}
                                                disabled={sending}
                                                title="Delete permanently"
                                            >
                                                <FiTrash2 />
                                                Delete
                                            </button>
                                            {post.underReview === 'pending' && (
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => {
                                                        setSelectedPost(post);
                                                        setShowReject(true);
                                                        setRejectReason('');
                                                    }}
                                                    disabled={sending}
                                                    title="Reject Appeal"
                                                >
                                                    Reject Appeal
                                                </button>
                                            )}
                                        </div>
                                        {post.takedownReason && (
                                            <div className={styles.takedownReason}>
                                                <strong>Reason:</strong> {post.takedownReason}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reject Appeal Modal */}
                    {showReject && selectedPost && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modal}>
                                <h4>Reject Appeal</h4>
                                <textarea
                                    className={styles.reasonInput}
                                    placeholder="Reason for rejection (optional)"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={3}
                                    disabled={sending}
                                />
                                <div className={styles.modalActions}>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleRejectAppeal(selectedPost._id, rejectReason)}
                                        disabled={sending}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        className={styles.cancelBtn}
                                        onClick={() => setShowReject(false)}
                                        disabled={sending}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Confirm Delete Modal */}
                    {showConfirm && selectedPost && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modal}>
                                <h4>Confirm Delete</h4>
                                <p>
                                    Are you sure you want to permanently delete this post? This action cannot be undone.
                                </p>
                                <div className={styles.modalActions}>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(selectedPost._id)}
                                        disabled={sending}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className={styles.cancelBtn}
                                        onClick={() => setShowConfirm(false)}
                                        disabled={sending}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Takedown Modal */}
                    {showTakedown && selectedPost && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modal}>
                                <h4>Take Down Post</h4>
                                <textarea
                                    className={styles.reasonInput}
                                    placeholder="Reason for takedown (required)"
                                    value={takedownReason}
                                    onChange={(e) => setTakedownReason(e.target.value)}
                                    rows={3}
                                    disabled={sending}
                                />
                                <div className={styles.modalActions}>
                                    <button
                                        className={styles.takedownBtn}
                                        onClick={() => handleTakedown(selectedPost._id, takedownReason)}
                                        disabled={!takedownReason.trim() || sending}
                                    >
                                        Take Down
                                    </button>
                                    <button
                                        className={styles.cancelBtn}
                                        onClick={() => setShowTakedown(false)}
                                        disabled={sending}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Restore Modal */}
                    {showRestore && selectedPost && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modal}>
                                <h4>Restore Post</h4>
                                <p>
                                    Are you sure you want to restore this post? It will become visible to users again.
                                </p>
                                <div className={styles.modalActions}>
                                    <button
                                        className={styles.restoreBtn}
                                        onClick={() => handleRestore(selectedPost._id)}
                                        disabled={sending}
                                    >
                                        Restore
                                    </button>
                                    <button
                                        className={styles.cancelBtn}
                                        onClick={() => setShowRestore(false)}
                                        disabled={sending}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
