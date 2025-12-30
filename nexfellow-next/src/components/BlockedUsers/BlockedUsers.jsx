import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import styles from "./BlockedUsers.module.css";

const BlockedUsers = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/user/blocked-users");
      setBlockedUsers(response.data.blockedUsers || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching blocked users:", err);
      setError("Failed to load blocked users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userId, username) => {
    try {
      const response = await axios.post(`/user/unblock/${userId}`);
      toast.success(
        response.data.message || `Unblocked ${username} successfully`
      );

      // Update the local state to remove the unblocked user
      setBlockedUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userId)
      );
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error(error.response?.data?.message || "Failed to unblock user");
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading blocked users...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.blockedUsersContainer}>
      <h2 className={styles.title}>Blocked Users</h2>

      {blockedUsers.length === 0 ? (
        <p className={styles.emptyState}>
          You haven&apos;t blocked any users yet.
        </p>
      ) : (
        <div className={styles.usersList}>
          {blockedUsers.map((user) => (
            <div key={user._id} className={styles.userItem}>
              <div className={styles.userInfo}>
                <img
                  src={user.picture || "/default-profile.png"}
                  alt={user.username}
                  className={styles.userAvatar}
                />
                <div className={styles.userData}>
                  <h3 className={styles.userName}>{user.name}</h3>
                  <p className={styles.userUsername}>@{user.username}</p>
                </div>
              </div>
              <button
                className={styles.unblockButton}
                onClick={() => handleUnblockUser(user._id, user.username)}
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockedUsers;
