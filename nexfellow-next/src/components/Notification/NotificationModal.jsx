"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";
import { getSocket } from "../../utils/socket";
import styles from "./NotificationModal.module.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoClose, IoArrowBack } from "react-icons/io5";
import DOMPurify from "dompurify";
import { Button } from "../ui/button";
import { IoCheckmarkDoneSharp, IoTrashOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { ThreeDots } from "react-loader-spinner";
import { toast } from "sonner";
import { IoSettingsSharp } from "react-icons/io5";

import defaultProfilePic from "./assets/default.jpg";
import NoNotifcation from "./assets/NoNotification.svg";
import { Trash2 } from "lucide-react";
import { PiConfetti } from "react-icons/pi";

const NotificationModal = ({ closeModal }) => {
  const router = useRouter();
  const socket = getSocket();
  const [mounted, setMounted] = useState(false);
  const [communityNotifications, setCommunityNotifications] = useState([]);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState("all");
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? JSON.parse(storedUser) : null;
  const loggedInUserId = user?._id || user?.id;
  const [loading, setLoading] = useState(false);
  const [communityPage, setCommunityPage] = useState(1);
  const [systemPage, setSystemPage] = useState(1);
  const [communityHasMore, setCommunityHasMore] = useState(true);
  const [systemHasMore, setSystemHasMore] = useState(true);
  const [appealing, setAppealing] = useState(false);
  const [postStatus, setPostStatus] = useState(null);
  const [checkingReview, setCheckingReview] = useState(false);
  const LIMIT = 20; // or whatever you prefer

  function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, x: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: 30,
      scale: 0.9,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const detailsVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const fetchCommunityNotifications = async (pageNum = 1) => {
    try {
      const response = await api.get(
        `/notifications?page=${pageNum}&limit=${LIMIT}`
      );
      const newNotifs = response.data.notifications || [];
      // Uncomment the following line to add a demo notification for testing
      // newNotifs.push({
      //   _id: "demo-notification",
      //   title: "Demo Notification",
      //   message: "This is a demo notification for testing purposes.",
      //   createdAt: new Date().toISOString(),
      //   sender: {
      //     _id: "demo-user",
      //     username: "demo_user",
      //     picture: defaultProfilePic,
      //   },
      //   recipients: [{ user: loggedInUserId, read: false }],
      //   type: "community",
      //   meta: {},
      // });

      setCommunityNotifications((prev) =>
        pageNum === 1 ? newNotifs : [...prev, ...newNotifs]
      );
      setCommunityHasMore(newNotifs.length === LIMIT);
    } catch (error) {
      console.error("Error fetching community notifications:", error);
    }
  };

  const fetchSystemNotifications = async (pageNum = 1) => {
    try {
      const response = await api.get(
        `/systemNotifications?page=${pageNum}&limit=${LIMIT}`
      );
      const newNotifs = response.data.notifications || [];
      console.log("systemnotifications: ", response.data.notifications);
      setSystemNotifications((prev) =>
        pageNum === 1 ? newNotifs : [...prev, ...newNotifs]
      );
      setSystemHasMore(newNotifs.length === LIMIT);
    } catch (error) {
      console.error("Error fetching system notifications:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetchCommunityNotifications(1),
      fetchSystemNotifications(1),
    ]).finally(() => setLoading(false));

    // Listen for real-time system notifications
    socket.on("newSystemNotification", (notification) => {
      setSystemNotifications((prevNotifications) => [
        ...prevNotifications,
        notification,
      ]);
    });

    socket.on("newCommunityNotification", (notification) => {
      setCommunityNotifications((prevNotifications) => [
        ...prevNotifications,
        notification,
      ]);
    });

    return () => {
      socket.off("newSystemNotification");
      socket.off("newCommunityNotification");
    };
  }, []);

  // useEffect(() => {
  //   setCommunityPage(1);
  //   setSystemPage(1);
  //   setCommunityNotifications([]);
  //   setSystemNotifications([]);
  //   setCommunityHasMore(true);
  //   setSystemHasMore(true);
  //   fetchCommunityNotifications(1);
  //   fetchSystemNotifications(1);
  // }, [filter]);

  useEffect(() => {
    const fetchPostStatus = async () => {
      if (
        selectedNotification &&
        selectedNotification.meta?.postId &&
        selectedNotification.type === "system" &&
        selectedNotification.title &&
        selectedNotification.title.toLowerCase().includes("taken down")
      ) {
        setCheckingReview(true);
        try {
          const res = await api.get(
            `/post/${selectedNotification.meta.postId}`
          );
          setPostStatus(res.data.post);
        } catch (e) {
          setPostStatus(null);
        }
        setCheckingReview(false);
      }
    };
    fetchPostStatus();
  }, [selectedNotification]);

  const handleAppeal = async (notification) => {
    if (!notification?.meta?.postId) {
      toast.error("Post ID not found for appeal.");
      return;
    }
    setAppealing(true);
    try {
      await api.post(
        `/admin/posts/${notification.meta.postId}/request-review`,
        {},
        { withCredentials: true }
      );
      toast.success("Appeal submitted! Our team will review your post.");
      // Optionally update UI to reflect appeal
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit appeal.");
    }
    setAppealing(false);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      // 50px from bottom
      if (filter === "all" || filter === "community") {
        if (communityHasMore && !loading) {
          setCommunityPage((prev) => {
            const nextPage = prev + 1;
            fetchCommunityNotifications(nextPage);
            return nextPage;
          });
        }
      }
      if (filter === "all" || filter === "system") {
        if (systemHasMore && !loading) {
          setSystemPage((prev) => {
            const nextPage = prev + 1;
            fetchSystemNotifications(nextPage);
            return nextPage;
          });
        }
      }
    }
  };

  const Topbar = () => (
    <header className={styles.modalHeader}>
      {selectedNotification ? (
        <div className={styles.notificationDetailsHeader}>
          <motion.button
            className={styles.backButton}
            onClick={() => setSelectedNotification(null)}
            whileTap={{ scale: 0.9 }}
          >
            <IoArrowBack />
          </motion.button>
          <p>Notifications</p>
        </div>
      ) : (
            <div className={styles.notificationListHeader}>
              <p>Notifications</p>
              <button className={styles.headerCloseButton} onClick={closeModal}>
                <IoClose size={24} />
              </button>
            </div>
      )}
    </header>
  );

  const truncateText = (text, length) =>
    text.length > length ? text.substring(0, length) + "..." : text;

  const markAsRead = async (notification) => {
    try {
      const endpoint =
        notification.type === "system"
          ? `/systemNotifications/${notification._id}/read`
          : `/notifications/${notification._id}/read`;

      await api.patch(endpoint);

      if (notification.type === "system") {
        setSystemNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id
              ? {
                ...n,
                recipients: n.recipients.map((r) =>
                  r.user === loggedInUserId ? { ...r, read: true } : r
                ),
              }
              : n
          )
        );
      } else {
        setCommunityNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id
              ? {
                ...n,
                recipients: n.recipients.map((r) =>
                  r.user === loggedInUserId ? { ...r, read: true } : r
                ),
              }
              : n
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await api.post("/systemNotifications/read/all");
      // Update UI state: mark all as read for logged-in user
      setSystemNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          recipients: n.recipients.map((r) =>
            r.user === loggedInUserId ? { ...r, read: true } : r
          ),
        }))
      );
      setCommunityNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          recipients: n.recipients.map((r) =>
            r.user === loggedInUserId ? { ...r, read: true } : r
          ),
        }))
      );
      toast.success("All notifications marked as read!");
    } catch (error) {
      toast.error("Failed to mark all as read.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications?"))
      return;
    setLoading(true);
    try {
      await api.delete("/systemNotifications/delete/all");
      setSystemNotifications([]);
      setCommunityNotifications([]);
      toast.success("All notifications deleted!");
    } catch (error) {
      toast.error("Failed to delete all notifications.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notification) => {
    try {
      await api.delete(`/systemNotifications/${notification._id}/user`);
      if (notification.type === "system") {
        setSystemNotifications((prev) =>
          prev.filter((n) => n._id !== notification._id)
        );
      } else {
        setCommunityNotifications((prev) =>
          prev.filter((n) => n._id !== notification._id)
        );
      }
      toast.success("Notification deleted.");
    } catch (error) {
      toast.error("Failed to delete notification.");
      console.error(error);
    }
  };

  const handleProfileClick = (notification) => {
    const sender = notification?.sender;
    const senderModel = notification?.senderModel;

    if (!sender || !senderModel) return;

    // If sender is Admin, do not redirect
    if (senderModel === "Admin") return;

    // If sender is a User
    if (senderModel === "User") {
      // If user has a createdCommunity and isCommunityAccount is true
      if (sender.createdCommunity && sender.isCommunityAccount) {
        if (sender.username) router.push(`/community/${sender.username}`);
        return;
      }
      // Otherwise, go to user profile
      if (sender.username) router.push(`/user/${sender.username}`);
      return;
    }

    // If sender is a Community (if you ever use this model)
    if (senderModel === "Community") {
      if (sender.username) router.push(`/community/${sender.username}`);
      return;
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);

    if (!notification.recipients.find((r) => r.user === loggedInUserId)?.read) {
      markAsRead(notification);
    }
  };

  const renderNotifications = (notifications) => {
    if (notifications.length === 0) return null;

    return (
      <motion.div
        className={styles.notificationsContainer}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {notifications
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((notification) => {
            // Format timestamp to relative time
            const timestamp = new Date(notification.createdAt);
            const now = new Date();
            const diffInSeconds = Math.floor((now - timestamp) / 1000);

            let timeAgo;
            if (diffInSeconds < 60) {
              timeAgo = "just now";
            } else if (diffInSeconds < 3600) {
              const minutes = Math.floor(diffInSeconds / 60);
              timeAgo = `${minutes} ${minutes === 1 ? "minute" : "minutes"
                } ago`;
            } else if (diffInSeconds < 86400) {
              const hours = Math.floor(diffInSeconds / 3600);
              timeAgo = `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
            } else if (diffInSeconds < 604800) {
              const days = Math.floor(diffInSeconds / 86400);
              timeAgo = `${days} ${days === 1 ? "day" : "days"} ago`;
            } else {
              const formattedDate = timestamp.toLocaleDateString();
              const formattedTime = timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              timeAgo = `${formattedDate} at ${formattedTime}`;
            }

            return (
              <motion.div
                key={notification._id}
                className={`${styles.notificationItem} ${notification.recipients.find((r) => r.user === loggedInUserId)
                  ?.read
                  ? styles.readNotification
                  : styles.unreadNotification
                  }`}
                onClick={() => handleNotificationClick(notification)}
                variants={itemVariants}
              >
                <div className={styles.notificationContent}>
                  <div
                    className={`${styles.profileContainer} flex justify-center items-center`}
                  >
                    {notification?.senderModel !== "System" ? (
                      <img
                        src={notification?.sender?.picture || defaultProfilePic}
                        alt="Profile"
                        className={styles.profilePic}
                        style={{
                          cursor: notification?.sender ? "pointer" : "default",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          closeModal();
                          handleProfileClick(notification);
                        }}
                      />
                    ) : notification.type === "milestone" ? (
                      <PiConfetti size={22} />
                    ) : (
                      <IoSettingsSharp
                        size={22}
                      // className={styles.profilePic}
                      />
                    )}
                  </div>
                  <div>
                    <p className={styles.notificationText}>
                      <strong>{notification.title}</strong>{" "}
                      <span
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            stripHtml(notification.message).length > 26
                              ? stripHtml(notification.message).slice(0, 26) +
                              "..."
                              : stripHtml(notification.message)
                          ),
                        }}
                      />
                    </p>
                    <span className={styles.timestamp}>{timeAgo}</span>
                  </div>
                </div>
                  {!notification.recipients.find((r) => r.user === loggedInUserId)
                    ?.read && <span className={styles.unreadIndicator}></span>}
                  <button
                    className={styles.itemMenuButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add menu logic if needed
                    }}
                  >
                    <BsThreeDotsVertical size={16} />
                  </button>
                </motion.div>
            );
          })}
      </motion.div>
    );
  };

  const filteredSystemNotifications =
    filter === "system" || filter === "all" ? systemNotifications : [];
  const filteredCommunityNotifications =
    filter === "community" || filter === "all" ? communityNotifications : [];

  const hasSystemNotifications = filteredSystemNotifications.length > 0;
  const hasCommunityNotifications = filteredCommunityNotifications.length > 0;
  const hasNoNotifications =
    !hasSystemNotifications && !hasCommunityNotifications;

  // Don't render on server side
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className={styles.notificationModalOverlay}
        onClick={closeModal}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.notificationModal}
          onClick={(e) => e.stopPropagation()}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Topbar />

            {/* Filter */}
              {!selectedNotification && (
                  <div className={styles.filter}>
                  <div className={styles.filterContainer}>
                    {["all", "system", "community"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`${styles.filterButton} ${filter === type ? styles.activeFilter : ""
                          }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

          <div
            className={styles.modalBody}
            onScroll={handleScroll}
            style={{ overflowY: "auto", maxHeight: "70vh" }}
          >
            <AnimatePresence mode="wait">
              {selectedNotification ? (
                <motion.div
                  key="details"
                  className={styles.notificationDetailsModal}
                  variants={detailsVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className={styles.notificationDetails}>
                    <div className={styles.notificationDetailsTop}>
                      <div
                        className={`${styles.profileContainer} flex justify-center items-center`}
                      >
                        {selectedNotification?.senderModel !== "System" ? (
                          <img
                            src={
                              selectedNotification?.sender?.picture ||
                              defaultProfilePic
                            }
                            alt="Profile"
                            className={styles.profilePic}
                            style={{
                              cursor: selectedNotification?.sender
                                ? "pointer"
                                : "default",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              closeModal();
                              handleProfileClick(selectedNotification);
                            }}
                          />
                        ) : selectedNotification.type === "milestone" ? (
                          <PiConfetti size={22} />
                        ) : (
                          <IoSettingsSharp size={22} />
                        )}
                      </div>
                      <h3>{selectedNotification.title}</h3>
                      <motion.button
                        className={styles.moreButton}
                        whileTap={{ scale: 0.9 }}
                      >
                        <BsThreeDotsVertical />
                      </motion.button>
                    </div>
                    <div
                      className={styles.notificationDetailsDescription}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          selectedNotification.message
                        ),
                      }}
                    />
                    <div className={styles.notificationDetailsMeta}>
                      {selectedNotification &&
                        selectedNotification.type === "system" &&
                        selectedNotification.title &&
                        selectedNotification.title
                          .toLowerCase()
                          .includes("taken down") &&
                        selectedNotification.meta?.postId &&
                        (checkingReview ? (
                          <div style={{ marginTop: "1.2rem" }}>
                            Checking post status...
                          </div>
                        ) : !postStatus ? null : !postStatus.isDeleted ? (
                          <div
                            className={styles.appealInfoMsg}
                            style={{ marginTop: "1.2rem", color: "#218838" }}
                          >
                            This post has been restored and is now visible to
                            users.
                          </div>
                        ) : postStatus.underReview === "pending" ? (
                          <div
                            className={styles.appealInfoMsg}
                            style={{ marginTop: "1.2rem", color: "#856404" }}
                          >
                            Review already requested. Awaiting admin action.
                          </div>
                        ) : postStatus.underReview === "rejected" ? (
                          <div
                            className={styles.appealInfoMsg}
                            style={{ marginTop: "1.2rem", color: "#b94a48" }}
                          >
                            Your appeal was rejected by the admin.
                          </div>
                        ) : postStatus.underReview === "approved" ? (
                          <div
                            className={styles.appealInfoMsg}
                            style={{ marginTop: "1.2rem", color: "#218838" }}
                          >
                            Your post appeal was approved and the post is
                            restored.
                          </div>
                        ) : (
                          // Default: allow to request review if post is taken down and not appealed yet
                          <Button
                            className={styles.appealButton}
                            onClick={() => handleAppeal(selectedNotification)}
                            disabled={appealing}
                            style={{ marginTop: "1.2rem" }}
                          >
                            {appealing ? "Submitting..." : "Request Review"}
                          </Button>
                        ))}
                    </div>
                    <p className={styles.detailsTimestamp}>
                      {new Date(
                        selectedNotification.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={styles.notificationsList}
                >
                  {loading ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: 180,
                      }}
                    >
                      <ThreeDots
                        height={60}
                        width={60}
                        color="#24b2b4"
                        ariaLabel="loading"
                      />
                    </div>
                  ) : hasNoNotifications ? (
                    <motion.div
                      className={styles.noNotificationsContainer}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.img
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className={styles.noNotificationsIcon}
                        src={NoNotifcation?.src || NoNotifcation}
                        alt="No Notifications"
                      />
                      <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        You don&apos;t have any notifications yet
                      </motion.p>
                    </motion.div>
                  ) : (
                    <>
                      {filter === "all" ? (
                        renderNotifications(
                          [
                            ...systemNotifications,
                            ...communityNotifications,
                          ].sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt)
                          )
                        )
                      ) : (
                        <>
                          {renderNotifications(filteredSystemNotifications)}
                          {renderNotifications(filteredCommunityNotifications)}
                        </>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
            {!selectedNotification && (
              <div className={styles.modalFooter}>
                <button
                  className={styles.viewAllLink}
                  onClick={() => {
                    closeModal();
                    router.push("/notifications");
                  }}
                >
                  View All
                </button>
              </div>
            )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default NotificationModal;
