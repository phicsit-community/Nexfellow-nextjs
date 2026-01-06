import React, { useState, useEffect } from "react";
import styles from "./HiddenPosts.module.css";
import api from "../../lib/axios";
import { toast } from "sonner";
import { FaEyeSlash } from "react-icons/fa";
import HiddenPostItem from "./HiddenPostItem";

const HiddenPosts = () => {
  const [hiddenPosts, setHiddenPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHiddenPosts();
  }, []);

  const fetchHiddenPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/user/hidden-posts");
      setHiddenPosts(response.data.hiddenPosts || []);
    } catch (error) {
      console.error("Error fetching hidden posts:", error);
      toast.error("Failed to fetch hidden posts");
    } finally {
      setLoading(false);
    }
  };

  const handleUnhidePost = async (postId) => {
    try {
      await api.post(`/user/unhide-post/${postId}`);
      toast.success("Post unhidden successfully");
      setHiddenPosts(hiddenPosts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error("Error unhiding post:", error);
      toast.error("Failed to unhide post");
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading hidden posts...</p>
      </div>
    );
  }

  if (hiddenPosts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FaEyeSlash size={48} />
        <h3>No Hidden Posts</h3>
        <p>Posts you hide will appear here. You can unhide them at any time.</p>
      </div>
    );
  }

  return (
    <div className={styles.hiddenPostsContainer}>
      <h2>Hidden Posts</h2>
      <p className={styles.subText}>
        Posts you&apos;ve hidden from your feed. You can unhide them to see them
        again.
      </p>
      <div className={styles.postsList}>
        {hiddenPosts.map((post) => (
          <HiddenPostItem
            key={post._id}
            post={post}
            onUnhide={() => handleUnhidePost(post._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default HiddenPosts;
