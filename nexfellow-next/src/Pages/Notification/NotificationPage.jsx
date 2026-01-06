"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";
import styles from "./NotificationPage.module.css";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { getSocket } from "../../utils/socket";
import DOMPurify from "dompurify";
import defaultProfilePic from "./assets/default.jpg";
import NoNotification from "./assets/NoNotification.svg";
import BackButton from "../../components/BackButton/BackButton";
import { ThreeDots } from "react-loader-spinner";
import { Bell, Trash2 } from "lucide-react";

const NotificationPage = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const socket = getSocket();
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? JSON.parse(storedUser) : null;
  const loggedInUserId = user?._id || user?.id;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const LIMIT = 20;

  // Fetch notifications (system + community)
  const fetchNotifications = async (pageNum = 1) => {
    setLoading(true);
    try {
      const [systemRes, communityRes] = await Promise.all([
        api.get(`/systemNotifications?page=${pageNum}&limit=${LIMIT}`),
        api.get(`/notifications?page=${pageNum}&limit=${LIMIT}`),
      ]);

      // add demo notification for testing
      // systemRes.data.notifications.push({
      //   _id: "demo-system-notification",
      //   title: "New Follower!",
      //   message:
      //     'DemoUser started following you. <a href="#" target="_blank" style="color: #007bff; text-decoration: underline;">View Profile</a>',
      //   createdAt: new Date().toISOString(),
      //   sender: {
      //     _id: "demo-user-id",
      //     name: "Demo User",
      //     username: "DemoUser",
      //     picture: defaultProfilePic,
      //     verified: true,
      //     verificationBadge: true,
      //   },
      //   senderModel: "User",
      //   community: null,
      //   recipients: [
      //     {
      //       user: loggedInUserId,
      //       read: false,
      //       _id: "demo-recipient-id",
      //     },
      //   ],
      //   type: "system",
      //   priority: "normal",
      //   updatedAt: new Date().toISOString(),
      // });

      const combined = [
        ...systemRes.data.notifications.map((n) => ({ ...n, type: "system" })),
        ...communityRes.data.notifications.map((n) => ({
          ...n,
          type: "community",
        })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (pageNum === 1) {
        setNotifications(combined);
      } else {
        setNotifications((prev) => [...prev, ...combined]);
      }

      setHasMore(combined.length === LIMIT * 2);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchNotifications();
    setPage(1);

    const addNotification = (type) => (notif) => {
      setNotifications((prev) =>
        [{ ...notif, type }, ...prev].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    };
    console.log("no", notifications);
    socket.on("newSystemNotification", addNotification("system"));
    socket.on("newCommunityNotification", addNotification("community"));

    return () => {
      socket.off("newSystemNotification");
      socket.off("newCommunityNotification");
    };
  }, []);

  // Mark as read (single) - always update recipients array
  const markAsRead = async (id, type) => {
    try {
      await api.patch(
        `/${type === "system" ? "systemNotifications" : "notifications"
        }/${id}/read`
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id
            ? {
              ...n,
              recipients: n.recipients.map((r) =>
                r.user === loggedInUserId ? { ...r, read: true } : r
              ),
            }
            : n
        )
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // Mark all as read (bulk, unified controller) - always update recipients array
  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await api.post("/systemNotifications/read/all");
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          recipients: n.recipients.map((r) =>
            r.user === loggedInUserId ? { ...r, read: true } : r
          ),
        }))
      );
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
    setLoading(false);
  };

  // Delete all notifications (bulk, unified controller)
  // const deleteAllNotifications = async () => {
  //   if (!window.confirm("Are you sure you want to delete all notifications?"))
  //     return;
  //   setLoading(true);
  //   try {
  //     await api.delete("/systemNotifications/delete/all");
  //     setNotifications([]);
  //   } catch (err) {
  //     console.error("Error deleting all notifications:", err);
  //   }
  //   setLoading(false);
  // };

  // Delete single notification for user
  const deleteNotification = async (notification) => {
    try {
      await api.delete(`/systemNotifications/${notification._id}/user`);
      setNotifications((prev) =>
        prev.filter((n) => n._id !== notification._id)
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Infinite scroll
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Check if we're near the bottom (within 50px)
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
      console.log("Loading more notifications...");
      const nextPage = page + 1;
      fetchNotifications(nextPage);
      setPage(nextPage);
    }
  };

  // Notification click
  const handleClick = async (notif) => {
    if (!isNotificationRead(notif)) await markAsRead(notif._id, notif.type);
    router.push(`/notifications/${notif._id}`);
  };

  // Profile click
  const handleProfileClick = (notification) => {
    const sender = notification?.sender;
    const senderModel = notification?.senderModel;
    if (!sender || !senderModel) return;
    if (senderModel === "Admin") return;
    if (senderModel === "User") {
      if (sender.createdCommunity && sender.isCommunityAccount) {
        if (sender.username) router.push(`/community/${sender.username}`);
        return;
      }
      if (sender.username) router.push(`/user/${sender.username}`);
      return;
    }
    if (senderModel === "Community") {
      if (sender.username) router.push(`/community/${sender.username}`);
      return;
    }
  };

  // Clean HTML text and extract links
  const cleanText = (html) => {
    // Sanitize the HTML first
    const sanitized = DOMPurify.sanitize(html);

    // Create temporary element to parse HTML
    const tmp = document.createElement("div");
    tmp.innerHTML = sanitized;

    // Extract link texts
    const links = Array.from(tmp.querySelectorAll("a")).map((a) => ({
      text: a.textContent,
      url: a.getAttribute("href"),
    }));

    // Get the main text content
    const mainText = tmp.textContent || tmp.innerText || "";

    // Return both the text and any link information
    return {
      text: mainText,
      links: links,
    };
  };
  // Handle the content of notifications, separating text and links
  const processNotificationContent = (html) => {
    const { text, links } = cleanText(html);

    // Return the plain text without the link text
    const mainContent = links
      .reduce((acc, link) => {
        return acc.replace(link.text, "");
      }, text)
      .trim();

    // Return buttons based on links
    const buttons = links.map((link) => ({
      text: link.text,
      url: link.url,
    }));

    return {
      mainContent,
      buttons,
    };
  };

  // Is notification read? - always use recipients array
  const isNotificationRead = (notification) => {
    return notification.recipients?.some(
      (r) => r.user === loggedInUserId && r.read
    );
  };

  // Format date
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // Filtered notifications
  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  // Any unread notifications?
  const anyUnread = notifications.some((n) => !isNotificationRead(n));

  // Calculate unread count
  const unreadCount = notifications.filter(
    (n) => !isNotificationRead(n)
  ).length;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.notificationPage}>
        <header className={styles.pageHeader}>
          <div className="w-full">
            <div
              className="border rounded-lg hover:bg-accent text-sm w-fit"
              style={{ padding: "3px 10px" }}
            >
              <BackButton
                onClick={() => router.back()}
                showText={true}
                smallText={true}
              />
            </div>
            <div
              style={{ marginTop: "8px" }}
              className="flex items-center gap-2 justify-between w-full"
            >
              <div>
                <h2
                  className="flex items-center gap-2"
                  style={{ fontSize: "30px" }}
                >
                  <Bell size={30} />
                  Notifications
                </h2>
                <h4 className="text-gray-600 text-sm">
                  Stay updated with your latest activities and important
                  announcements
                </h4>
              </div>
              <div>
                <button
                  className="flex items-center gap-2 text-sm border cursor-pointer hover:bg-accent rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    padding: "8px 12px",
                    cursor: loading || !anyUnread ? "not-allowed" : "pointer",
                  }}
                  onClick={markAllAsRead}
                  disabled={loading || !anyUnread}
                >
                  <IoCheckmarkDoneSharp size={16} />
                  <span className={styles.buttonText}>
                    Mark all as read {unreadCount ? `(${unreadCount})` : ""}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.tabContainer}>
          <div className="search-container w-full mb-4 flex-1">
            <div className="relative w-full rounded-lg border focus-within:ring-2 focus-within:ring-[#24b2b4] transition-all">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search notifications..."
                className="w-[-webkit-fill-available] rounded-lg pl-10 pr-4 focus:outline-none bg-white dark:bg-gray-800"
                style={{ padding: "8px 12px", marginLeft: "24px" }}
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  if (searchTerm) {
                    const filtered = notifications.filter(
                      (n) =>
                        n.title?.toLowerCase().includes(searchTerm) ||
                        n.message?.toLowerCase().includes(searchTerm)
                    );
                    setNotifications(filtered);
                  } else {
                    fetchNotifications();
                  }
                }}
              />
            </div>
          </div>

          <div className={styles.tabButtons}>
            {["all", "system", "community"].map((tab) => (
              <button
                key={tab}
                className={`${styles.tabButton} ${activeTab === tab ? styles.active : ""
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notification List */}
        <div className={styles.notificationBody}>
          <div
            className={styles.notificationsList}
            onScroll={handleScroll}
            style={{ overflowY: "auto", maxHeight: "70vh" }}
          >
            {loading && page === 1 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 200,
                }}
              >
                <ThreeDots
                  visible={true}
                  height="60"
                  width="60"
                  color="#4e8cff"
                  ariaLabel="three-dots-loading"
                />
              </div>
            ) : filtered.length ? (
              filtered.map((notification) => {
                const read = isNotificationRead(notification);
                const { mainContent: messageText } = processNotificationContent(
                  notification.message
                );
                const { buttons: messageButtons } = processNotificationContent(
                  notification.message
                );
                return (
                  <div
                    key={notification._id}
                    className={`${styles.notificationItem} ${read ? styles.read : styles.unread
                      }`}
                    onClick={() => handleClick(notification)}
                  >
                    <div className={styles.profileContainer}>
                      <img
                        src={notification.sender?.picture || defaultProfilePic}
                        alt="Profile"
                        className={styles.profilePic}
                        style={{
                          cursor:
                            notification.sender &&
                              notification.senderModel &&
                              notification.senderModel !== "Admin"
                              ? "pointer"
                              : "default",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileClick(notification);
                        }}
                      />
                    </div>
                    <div className={styles.notificationContent}>
                      <div className={styles.titleContainer}>
                        <p className={styles.notificationContentTitle}>
                          {notification.title}
                        </p>
                        {!read && (
                          <span className={styles.unreadIndicator}></span>
                        )}
                      </div>
                      <p className={styles.notificationContentDescription}>
                        {messageText.length > 200
                          ? messageText.slice(0, 200) + "..."
                          : messageText}
                      </p>
                      <span className={styles.timestamp}>
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>

                    {/* DELETE ICON ON HOVER */}
                    <button
                      className={styles.deleteIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification);
                      }}
                      aria-label="Delete notification"
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Buttons */}
                    {messageButtons.length > 0 && (
                      <div className={styles.buttonsContainer}>
                        {messageButtons.map((button, index) => (
                          <a
                            key={index}
                            href={button.url}
                            className={styles.button}
                          >
                            {button.text}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={styles.noNotificationsContainer}>
                <img
                  className={styles.noNotificationsIcon}
                  src={NoNotification?.src || NoNotification}
                  alt="No Notifications"
                />
                <p>You don&apos;t have any notifications yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
