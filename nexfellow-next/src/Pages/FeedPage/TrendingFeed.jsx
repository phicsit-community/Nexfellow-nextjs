"use client";

import { useRef, useState, useEffect, useCallback, useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import api from "../../lib/axios";
import styles from "./TrendingFeed.module.css";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { ThreeDots, TailSpin } from "react-loader-spinner";
import { IoVolumeMuteOutline, IoEyeOffOutline, IoBanOutline } from "react-icons/io5";
import Post from "../../components/Post/Post.jsx";
import ReportModal from "../../components/ReportModal/ReportModal";
import MuteUserModal from "../../components/MuteUserModal/MuteUserModal";
import BlockUserModal from "../../components/BlockUserModal/BlockUserModal";
import HidePostModal from "../../components/Modals/HidePostModal";
import { toast } from "sonner";
import { saveFeedCache, getFeedCache, clearFeedCache } from "../../utils/feedCache";

import { getSocket } from "../../utils/socket";
const socket = getSocket();
const PAGE_SIZE = 10;
const PULL_THRESHOLD = 50;

const PostSkeleton = () => (
    <>
        {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeletonPost}>
                <div className={styles.skeletonHeader}>
                    <div className={styles.skeletonAvatar}></div>
                    <div className={styles.skeletonDetails}>
                        <div className={styles.skeletonText}></div>
                        <div className={styles.skeletonText}></div>
                    </div>
                </div>
                <div className={styles.skeletonContent}>
                    <div className={styles.skeletonText}></div>
                    <div className={styles.skeletonText}></div>
                    {i > 0 && (
                        <div className={styles.skeletonImageGrid}>
                            {[...Array(4)].map((_, idx) => (
                                <div key={idx} className={styles.skeletonImageItem}></div>
                            ))}
                        </div>
                    )}
                    <div className={styles.skeletonText}></div>
                </div>
                <div className={styles.skeletonActions}>
                    {[...Array(3)].map((_, idx) => (
                        <div key={idx} className={styles.skeletonAction}></div>
                    ))}
                </div>
            </div>
        ))}
    </>
);

const TrendingFeed = ({ type = "trending" }) => {
    const pathname = usePathname();
    const router = useRouter();
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const [isPostsRendered, setIsPostsRendered] = useState(false);
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loadingUserData, setLoadingUserData] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [error, setError] = useState(null);

    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [muteModalOpen, setMuteModalOpen] = useState(false);
    const [blockModalOpen, setBlockModalOpen] = useState(false);
    const [hidePostModalOpen, setHidePostModalOpen] = useState(false);

    const [selectedPost, setSelectedPost] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    const [mutedUsers, setMutedUsers] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [hiddenPosts, setHiddenPosts] = useState([]);

    // Pull-to-refresh state
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [cursor, setCursor] = useState(null);
    const [page, setPage] = useState(1);
    const hasRestoredRef = useRef(false);

    const draggingRef = useRef(false);
    const startYRef = useRef(0);

    const feedContainerRef = useRef(null);

    const springBack = (target = 0) => {
        let position = pullDistance;
        let velocity = 0;
        const stiffness = 0.1;
        const damping = 0.8;
        const step = () => {
            const force = (target - position) * stiffness;
            velocity = velocity * damping + force;
            position += velocity;
            if (Math.abs(position - target) < 0.5 && Math.abs(velocity) < 0.5) {
                setPullDistance(target);
                return;
            }
            setPullDistance(position);
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    // Fetch muted, blocked, hidden posts/users
    useEffect(() => {
        if (!isLoggedIn) {
            setLoadingUserData(false);
            return;
        }

        const fetchData = async () => {
            setLoadingUserData(true);
            try {
                const mutedResponse = await api.get("/user/muted-users");
                setMutedUsers(mutedResponse.data.mutedUsers || []);
                const blockedResponse = await api.get("/user/blocked-users");
                setBlockedUsers(blockedResponse.data.blockedUsers || []);
                const hiddenResponse = await api.get("/user/hidden-posts");
                setHiddenPosts(hiddenResponse.data.hiddenPosts || []);
            } catch (err) {
                setError("Error fetching user settings: " + err.message);
            } finally {
                setLoadingUserData(false);
            }
        };
        fetchData();
    }, [isLoggedIn]);

    // Reset when type changes
    useEffect(() => {
        setPosts([]);
        setCursor(null);
        setPage(1);
        setHasMore(true);
        setLoadingPosts(true);
        fetchPosts(true);
    }, [type]);

    // Fetch dynamic posts!
    const fetchPosts = useCallback(
        async (isRefresh = false, append = false) => {
            if (loadingPosts && !isRefresh && posts.length > 0) return;
            if (!hasMore && !isRefresh) return;

            setLoadingPosts(true);
            if (isRefresh) setIsRefreshing(true);

            try {
                let res;
                let newCursor = null;
                let newPage = page;

                if (type === "following") {
                    res = await api.get("/post/followed-communities/posts");
                    const data = Array.isArray(res.data) ? res.data : (res.data.posts || []);
                    if (isRefresh) {
                        setPosts(data);
                    } else {
                        setPosts(data);
                    }
                    setHasMore(false);
                } else if (type === "newest") {
                    const p = isRefresh ? 1 : page;
                    res = await api.get("/post", {
                        params: {
                            limit: PAGE_SIZE,
                            page: p,
                        },
                    });
                    const data = res.data.posts || [];
                    if (isRefresh) {
                        setPosts(data);
                        setPage(2);
                    } else {
                        setPosts(prev => [...prev, ...data.filter(x => !prev.some(y => y._id === x._id))]);
                        setPage(p + 1);
                    }
                    if (data.length < PAGE_SIZE) setHasMore(false);
                } else {
                    // Trending (Default)
                    res = await api.get("/post/dynamic/feed", {
                        params: {
                            limit: PAGE_SIZE,
                            cursor: isRefresh ? null : cursor,
                        },
                        timeout: 10000,
                    });

                    const data = res.data.posts || [];
                    newCursor = res.data.nextCursor;

                    if (isRefresh) {
                        setPosts(data);
                        setCursor(newCursor);
                    } else {
                        setPosts((prev) => [
                            ...prev,
                            ...data.filter((p) => !prev.some((q) => q._id === p._id)),
                        ]);
                        setCursor(newCursor);
                    }
                    setHasMore(!!newCursor);
                }
            } catch (err) {
                // Silently ignore errors
            } finally {
                setLoadingPosts(false);
                if (isRefresh) {
                    setIsRefreshing(false);
                    springBack();
                }
            }
        },
        [loadingPosts, cursor, hasMore, page, type]
    );

    // Initial load
    useEffect(() => {
        const { posts: cachedPosts } = getFeedCache();

        if (cachedPosts && cachedPosts.length > 0) {
            setPosts(cachedPosts);
            setLoadingPosts(false);
            setLoadingUserData(false);
            setHasMore(true);
            setIsPostsRendered(false);
        } else {
            fetchPosts(true, false);
        }
    }, []);

    useLayoutEffect(() => {
        if (posts.length === 0) return;
        setIsPostsRendered(true);
    }, [posts]);

    useEffect(() => {
        if (!isPostsRendered) return;
        const { selectedPostId, scrollTop } = getFeedCache();
        if (feedContainerRef.current) {
            if (selectedPostId) {
                const postElement = feedContainerRef.current.querySelector(
                    `[data-post-id="${selectedPostId}"]`
                );
                if (postElement) {
                    const containerHeight = feedContainerRef.current.clientHeight;
                    const postTop = postElement.offsetTop;
                    const postHeight = postElement.offsetHeight;
                    const scrollTo = postTop - containerHeight / 2 + postHeight / 2;
                    feedContainerRef.current.scrollTop = scrollTo;
                    return;
                }
            }
            feedContainerRef.current.scrollTop = scrollTop;
        }
    }, [isPostsRendered]);


    // Infinite scroll
    const handleFeedScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (
            scrollHeight - scrollTop <= clientHeight + 50 &&
            hasMore &&
            !loadingPosts
        ) {
            fetchPosts(false, true);
        }
    };

    // Pull-to-refresh events
    const startPull = (y) => {
        if (feedContainerRef.current.scrollTop === 0 && !isRefreshing) {
            draggingRef.current = true;
            startYRef.current = y;
        }
    };
    const movePull = (y) => {
        if (!draggingRef.current) return;
        const diff = y - startYRef.current;
        if (diff > 0) setPullDistance(diff / 2);
    };
    const endPull = () => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        if (pullDistance > PULL_THRESHOLD) {
            fetchPosts(true, false);
        } else {
            springBack();
        }
    };
    const handleTouchStart = (e) => startPull(e.touches[0].clientY);
    const handleTouchMove = (e) => movePull(e.touches[0].clientY);
    const handleTouchEnd = () => endPull();
    const handleMouseDown = (e) => startPull(e.clientY);
    const handleMouseMove = (e) => movePull(e.clientY);
    const handleMouseUp = () => endPull();

    // POST FILTERING
    const isPostVisible = useCallback(
        (p) =>
            p.author &&
            !mutedUsers.some((u) => u._id === p.author?._id) &&
            !blockedUsers.some((u) => u._id === p.author?._id) &&
            !hiddenPosts.some((hp) => hp._id === p._id),
        [mutedUsers, blockedUsers, hiddenPosts]
    );

    useEffect(() => {
        if (!socket) return;
        const handler = (post) => {
            setPosts((prev) => {
                if (
                    prev.some((p) => p._id === post._id) ||
                    !isPostVisible(post)
                )
                    return prev;
                return [post, ...prev];
            });
            toast.success("New post arrived!");
        };

        socket.on("newPost", handler);
        return () => socket.off("newPost", handler);
    }, [isPostVisible]);

    // Post actions
    const handleHidePost = async () => {
        if (!selectedPost) return;
        try {
            await api.post(`/user/hide-post/${selectedPost._id}`);
            setHiddenPosts([...hiddenPosts, selectedPost]);
            setPosts((posts) => posts.filter((p) => p._id !== selectedPost._id));
            toast.success("Post hidden successfully");
        } catch (err) {
            toast.error("Failed to hide post");
        } finally {
            setHidePostModalOpen(false);
        }
    };

    const handleNavigateToPost = (postId) => {
        saveFeedCache(posts, feedContainerRef.current?.scrollTop || 0, postId);
        router.push(`/post/${postId}`);
    };

    const filteredPosts = posts.filter(isPostVisible);

    const feedOptions = [
        {
            label: "Mute",
            icon: <IoVolumeMuteOutline />,
            action: (post) => {
                setSelectedUser(post.author);
                setMuteModalOpen(true);
            },
        },
        {
            label: "Hide",
            icon: <IoEyeOffOutline />,
            action: (post) => {
                setSelectedPost(post);
                setHidePostModalOpen(true);
            },
        },
        {
            label: "Block",
            icon: <IoBanOutline />,
            action: (post) => {
                setSelectedUser(post.author);
                setBlockModalOpen(true);
            },
        },
        {
            label: "Report",
            icon: <AiOutlineExclamationCircle />,
            action: (post) => {
                setSelectedPost(post);
                setReportModalOpen(true);
            },
        },
    ];
    return (
        <>
            {loadingUserData ? (
                <div className={styles.feedContainer}>
                    <PostSkeleton />
                </div>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <div
                    className={styles.feedContainer}
                    ref={feedContainerRef}
                    onScroll={handleFeedScroll}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    style={{
                        transform: draggingRef.current
                            ? `translateY(${pullDistance}px)`
                            : "translateY(0px)",
                        transition: draggingRef.current ? "none" : "transform 0.2s ease",
                    }}
                >
                    {/* Pull-to-refresh indicator */}
                    {!isRefreshing && pullDistance > 10 && (
                        <div className={styles.refreshIndicator}>
                            {pullDistance > PULL_THRESHOLD
                                ? "↻ Release to refresh"
                                : "↓ Pull to refresh"}
                        </div>
                    )}

                    {/* Pull-to-refresh loader */}
                    {isRefreshing && (
                        <div className={styles.refreshSpinner}>
                            <ThreeDots height="40" width="40" color="#24b2b4" ariaLabel="refreshing" />
                        </div>
                    )}

                    {/* Posts list */}
                    {filteredPosts.length > 0 &&
                        filteredPosts.map((post) => (
                            <Post
                                key={post._id}
                                post={post}
                                options={feedOptions.map((o) => ({
                                    label: o.label,
                                    icon: o.icon,
                                    action: () => o.action(post),
                                }))}
                                onNavigateToPost={handleNavigateToPost}
                            />
                        ))}

                    {/* Infinite scroll loader */}
                    {!loadingUserData && !isRefreshing && loadingPosts && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 120,
                            }}
                        >
                            <TailSpin visible={true} height="40" width="40" color="#24b2b4" />
                        </div>
                    )}

                    {/* No posts fallback */}
                    {filteredPosts.length === 0 && !loadingUserData && !isRefreshing && !loadingPosts && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 120,
                            }}
                        >
                            <p>No posts available</p>
                        </div>
                    )}
                </div>
            )}

            {reportModalOpen && selectedPost && (
                <ReportModal
                    isOpen
                    onClose={() => setReportModalOpen(false)}
                    postId={selectedPost._id}
                    authorId={selectedPost.author?._id}
                />
            )}
            {muteModalOpen && selectedUser && (
                <MuteUserModal
                    isOpen
                    onClose={() => setMuteModalOpen(false)}
                    user={selectedUser}
                />
            )}
            {blockModalOpen && selectedUser && (
                <BlockUserModal
                    isOpen
                    onClose={(wasBlocked) => {
                        setBlockModalOpen(false);
                        if (wasBlocked) {
                            api
                                .get("/user/blocked-users")
                                .then((res) => setBlockedUsers(res.data.blockedUsers || []))
                                .catch((err) => console.error("Error fetching blocked users:", err));
                        }
                    }}
                    user={selectedUser}
                />
            )}
            {hidePostModalOpen && selectedPost && (
                <HidePostModal
                    isOpen
                    onClose={() => setHidePostModalOpen(false)}
                    onConfirm={handleHidePost}
                    postAuthor={selectedPost.author?.name}
                />
            )}
        </>
    );
};

export default TrendingFeed;
