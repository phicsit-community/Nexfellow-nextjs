import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import styles from "./MutedUsers.module.css";

const MutedUsers = () => {
  const [mutedUsers, setMutedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMutedUsers();
  }, []);

  const fetchMutedUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/user/muted-users");
      setMutedUsers(response.data.mutedUsers || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching muted users:", err);
      setError("Failed to load muted users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnmuteUser = async (userId, username) => {
    try {
      const response = await axios.post(`/user/unmute/${userId}`);
      toast.success(
        response.data.message || `Unmuted ${username} successfully`
      );

      // Update the local state to remove the unmuted user
      setMutedUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userId)
      );
    } catch (error) {
      console.error("Error unmuting user:", error);
      toast.error(error.response?.data?.message || "Failed to unmute user");
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading muted users...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.mutedUsersContainer}>
      <h2 className={styles.title}>Muted Users</h2>

      {mutedUsers.length === 0 ? (
        <p className={styles.emptyState}>
          You haven&apos;t muted any users yet.
        </p>
      ) : (
        <div className={styles.usersList}>
          {mutedUsers.map((user) => (
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
                className={styles.unmuteButton}
                onClick={() => handleUnmuteUser(user._id, user.username)}
              >
                Unmute
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MutedUsers;
