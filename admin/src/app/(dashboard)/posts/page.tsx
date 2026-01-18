'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { FiSearch, FiTrash2, FiEyeOff, FiRotateCw } from 'react-icons/fi';
import { toast } from 'sonner';
import { safeFetch } from '@/lib/safeFetch';

interface Post {
    _id: string;
    content: string;
    author: { name?: string; username?: string };
    createdAt: string;
    isDeleted?: boolean;
    takedownReason?: string;
    underReview?: 'pending' | 'rejected' | boolean;
}

const PAGE_SIZE = 20;

export default function PostsPage() {
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

    // Fetch posts
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const res = await safeFetch(`${apiUrl}/admin/posts?page=${page}&limit=${PAGE_SIZE}&search=${search}`);
                if (res.ok) {
                    const data = await res.json();
                    if (page === 1) {
                        setPosts(data.posts || []);
                    } else {
                        setPosts((prev) => [...prev, ...(data.posts || [])]);
                    }
                    setHasMore((data.posts || []).length === PAGE_SIZE);
                }
            } catch {
                toast.error('Failed to load posts');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [page, search, apiUrl]);

    // Infinite scroll
    const lastPostRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (loading || !hasMore) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && activeTab === 'posts') {
                    setPage((p) => p + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, activeTab]
    );

    // Delete post
    const handleDelete = async (postId: string) => {
        setShowConfirm(false);
        setSending(true);
        try {
            const res = await safeFetch(`${apiUrl}/admin/posts/${postId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('Post deleted');
                setPosts((prev) => prev.filter((p) => p._id !== postId));
            } else {
                toast.error('Failed to delete post');
            }
        } catch {
            toast.error('Failed to delete post');
        } finally {
            setSending(false);
        }
    };

    // Takedown post
    const handleTakedown = async (postId: string, reason: string) => {
        setShowTakedown(false);
        setSending(true);
        try {
            const res = await safeFetch(`${apiUrl}/admin/posts/${postId}/takedown`, {
                method: 'PATCH',
                body: JSON.stringify({ reason }),
            });
            if (res.ok) {
                toast.success('Post taken down');
                setPosts((prev) =>
                    prev.map((p) => (p._id === postId ? { ...p, isDeleted: true, takedownReason: reason } : p))
                );
            } else {
                toast.error('Failed to take down post');
            }
        } catch {
            toast.error('Failed to take down post');
        } finally {
            setSending(false);
        }
    };

    // Restore post
    const handleRestore = async (postId: string) => {
        setShowRestore(false);
        setSending(true);
        try {
            const res = await safeFetch(`${apiUrl}/admin/posts/${postId}/restore`, {
                method: 'PATCH',
            });
            if (res.ok) {
                toast.success('Post restored');
                setPosts((prev) =>
                    prev.map((p) => (p._id === postId ? { ...p, isDeleted: false, takedownReason: '', underReview: false } : p))
                );
            } else {
                toast.error('Failed to restore post');
            }
        } catch {
            toast.error('Failed to restore post');
        } finally {
            setSending(false);
        }
    };

    // Reject appeal
    const handleRejectAppeal = async (postId: string, reason: string) => {
        setShowReject(false);
        setSending(true);
        try {
            const res = await safeFetch(`${apiUrl}/admin/posts/${postId}/reject-appeal`, {
                method: 'POST',
                body: JSON.stringify({ rejectionReason: reason }),
            });
            if (res.ok) {
                toast.success('Appeal rejected');
                setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, underReview: 'rejected' } : p)));
            } else {
                toast.error('Failed to reject appeal');
            }
        } catch {
            toast.error('Failed to reject appeal');
        } finally {
            setSending(false);
        }
    };

    // Reset page on search change
    useEffect(() => {
        setPage(1);
        setHasMore(true);
    }, [search]);

    const appealedPosts = posts.filter((p) => p.isDeleted && (p.underReview === 'pending' || p.underReview === 'rejected'));
    const regularPosts = posts.filter((p) => !(p.isDeleted && p.underReview === 'pending'));

    return (
        <div className="min-h-screen p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-white">Admin Posts Control</h1>
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 w-80"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b-2 border-slate-600 mb-6">
                <button
                    className={`pb-3 font-semibold transition-colors ${activeTab === 'posts' ? 'text-teal-400 border-b-2 border-teal-400 -mb-0.5' : 'text-slate-400'}`}
                    onClick={() => setActiveTab('posts')}
                >
                    Posts
                </button>
                <button
                    className={`pb-3 font-semibold transition-colors ${activeTab === 'appealed' ? 'text-teal-400 border-b-2 border-teal-400 -mb-0.5' : 'text-slate-400'}`}
                    onClick={() => setActiveTab('appealed')}
                >
                    Appealed Posts ({appealedPosts.length})
                </button>
            </div>

            {/* Posts List */}
            <div className="space-y-4 max-h-[65vh] overflow-y-auto">
                {activeTab === 'posts' && (
                    <>
                        {regularPosts.length === 0 && !loading && <div className="text-slate-400 text-center py-8">No posts found.</div>}
                        {regularPosts.map((post, idx) => (
                            <div
                                key={post._id}
                                ref={idx === regularPosts.length - 1 ? lastPostRef : null}
                                className={`p-4 rounded-xl ${post.isDeleted ? 'bg-red-900/20 border border-red-500/30' : 'bg-slate-700'}`}
                            >
                                <div className="flex flex-wrap items-center gap-3 mb-2 text-sm">
                                    <span className="text-teal-400 font-semibold">{post.author?.name || 'Unknown'} (@{post.author?.username || 'user'})</span>
                                    <span className="text-slate-500">{new Date(post.createdAt).toLocaleString()}</span>
                                    {post.isDeleted && <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-xs font-semibold">Taken Down</span>}
                                </div>
                                <p className="text-slate-300 mb-3">{post.content?.slice(0, 200)}{post.content && post.content.length > 200 ? '...' : ''}</p>
                                <div className="flex gap-3">
                                    {!post.isDeleted && (
                                        <button
                                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
                                            onClick={() => { setSelectedPost(post); setShowTakedown(true); setTakedownReason(''); }}
                                            disabled={sending}
                                        >
                                            <FiEyeOff /> Takedown
                                        </button>
                                    )}
                                    {post.isDeleted && (
                                        <button
                                            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                                            onClick={() => { setSelectedPost(post); setShowRestore(true); }}
                                            disabled={sending}
                                        >
                                            <FiRotateCw /> Restore
                                        </button>
                                    )}
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                        onClick={() => { setSelectedPost(post); setShowConfirm(true); }}
                                        disabled={sending}
                                    >
                                        <FiTrash2 /> Delete
                                    </button>
                                </div>
                                {post.isDeleted && post.takedownReason && (
                                    <div className="mt-3 bg-orange-500/10 text-orange-400 px-4 py-2 rounded-lg text-sm">
                                        <strong>Reason:</strong> {post.takedownReason}
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && <div className="text-slate-400 text-center py-4">Loading...</div>}
                    </>
                )}

                {activeTab === 'appealed' && (
                    <>
                        {appealedPosts.length === 0 && !loading && <div className="text-slate-400 text-center py-8">No appealed posts.</div>}
                        {appealedPosts.map((post) => (
                            <div key={post._id} className="p-4 rounded-xl bg-red-900/20 border border-red-500/30">
                                <div className="flex flex-wrap items-center gap-3 mb-2 text-sm">
                                    <span className="text-teal-400 font-semibold">{post.author?.name || 'Unknown'} (@{post.author?.username || 'user'})</span>
                                    <span className="text-slate-500">{new Date(post.createdAt).toLocaleString()}</span>
                                    {post.underReview === 'pending' && <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-lg text-xs">Appealed</span>}
                                    {post.underReview === 'rejected' && <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-xs">Appeal Rejected</span>}
                                </div>
                                <p className="text-slate-300 mb-3">{post.content?.slice(0, 200)}{post.content && post.content.length > 200 ? '...' : ''}</p>
                                <div className="flex gap-3">
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                                        onClick={() => { setSelectedPost(post); setShowRestore(true); }}
                                        disabled={sending}
                                    >
                                        <FiRotateCw /> Restore
                                    </button>
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                        onClick={() => { setSelectedPost(post); setShowConfirm(true); }}
                                        disabled={sending}
                                    >
                                        <FiTrash2 /> Delete
                                    </button>
                                    {post.underReview === 'pending' && (
                                        <button
                                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                            onClick={() => { setSelectedPost(post); setShowReject(true); setRejectReason(''); }}
                                            disabled={sending}
                                        >
                                            Reject Appeal
                                        </button>
                                    )}
                                </div>
                                {post.takedownReason && (
                                    <div className="mt-3 bg-orange-500/10 text-orange-400 px-4 py-2 rounded-lg text-sm">
                                        <strong>Reason:</strong> {post.takedownReason}
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Modals */}
            {showConfirm && selectedPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 animate-fade-in">
                        <h3 className="text-lg font-semibold text-white mb-4">Confirm Delete</h3>
                        <p className="text-slate-300 mb-6">Are you sure you want to permanently delete this post? This action cannot be undone.</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                onClick={() => handleDelete(selectedPost._id)}
                                disabled={sending}
                            >
                                Delete
                            </button>
                            <button
                                className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                                onClick={() => setShowConfirm(false)}
                                disabled={sending}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showTakedown && selectedPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Take Down Post</h3>
                        <textarea
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
                            placeholder="Reason for takedown (required)"
                            rows={3}
                            value={takedownReason}
                            onChange={(e) => setTakedownReason(e.target.value)}
                            disabled={sending}
                        />
                        <div className="flex gap-3 justify-center mt-4">
                            <button
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors"
                                onClick={() => handleTakedown(selectedPost._id, takedownReason)}
                                disabled={!takedownReason.trim() || sending}
                            >
                                Take Down
                            </button>
                            <button
                                className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                                onClick={() => setShowTakedown(false)}
                                disabled={sending}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRestore && selectedPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Restore Post</h3>
                        <p className="text-slate-300 mb-6">Are you sure you want to restore this post? It will become visible to users again.</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                onClick={() => handleRestore(selectedPost._id)}
                                disabled={sending}
                            >
                                Restore
                            </button>
                            <button
                                className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                                onClick={() => setShowRestore(false)}
                                disabled={sending}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReject && selectedPost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Reject Appeal</h3>
                        <textarea
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
                            placeholder="Reason for rejection (optional)"
                            rows={3}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            disabled={sending}
                        />
                        <div className="flex gap-3 justify-center mt-4">
                            <button
                                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                onClick={() => handleRejectAppeal(selectedPost._id, rejectReason)}
                                disabled={sending}
                            >
                                Reject
                            </button>
                            <button
                                className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                                onClick={() => setShowReject(false)}
                                disabled={sending}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
