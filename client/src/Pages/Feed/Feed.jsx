import React, { useState, useEffect, useRef } from "react";
import styles from "./Feed.module.css";

// Import components
import Post from "../../components/Post/Post";
import Header from "../../components/Header/Header";
import Rightbar from "../../components/Rightbar/Rightbar";
import Leftbar from "../../components/Leftbar/Leftbar";
import CreatePost from "../../components/Post/CreatePost";
import BackToTop from "../../components/BackToTop/BackToTop";
import PostSkeleton from "../../components/Skeleton/PostSkeleton";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/posts");
        const data = await response.json();
        setPosts(data.posts);
        setHasMore(data.hasMore);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [refreshKey]);

  useEffect(() => {
    const handleObserver = (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loadingMore) {
        setLoadingMore(true);
        fetchMorePosts();
      }
    };

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMoreRef, hasMore, loadingMore]);

  const fetchMorePosts = async () => {
    try {
      const response = await fetch(
        `/api/posts?cursor=${posts[posts.length - 1]._id}`
      );
      const data = await response.json();
      setPosts((prevPosts) => [...prevPosts, ...data.posts]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error fetching more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className={styles.feed}>
      <Header />
      <div className={styles.feedContent}>
        <div className={styles.leftBar}>
          <Leftbar />
        </div>
        <div className={styles.centerBar}>
          <CreatePost key={refreshKey} setRefreshKey={setRefreshKey} />

          {loading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : posts.length === 0 ? (
            <div className={styles.noPosts}>
              <p>
                No posts available. Start following users to see their posts!
              </p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <Post key={post._id} post={post} setPosts={setPosts} />
              ))}
              {hasMore && (
                <div ref={loadMoreRef} className={styles.loadingMore}>
                  {loadingMore && <PostSkeleton />}
                </div>
              )}
            </>
          )}
          <BackToTop />
        </div>
        <div className={styles.rightBar}>
          <Rightbar />
        </div>
      </div>
    </div>
  );
};

export default Feed;
