import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./NotificationReadPage.module.css";
import BackButton from "../../components/BackButton/BackButton";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import userImg from "./assets/Frame.svg";
import timeAgo from "./../../utils/timeAgo";
import { X } from "lucide-react";

const NotificationReadPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [appealing, setAppealing] = useState(false);
  const [postStatus, setPostStatus] = useState(null);
  const [checkingReview, setCheckingReview] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const isSystem = location.pathname.includes("system");
        const endpoint = isSystem
          ? `/systemNotifications/${id}`
          : `/notifications/${id}`;
        const res = await axios.get(endpoint);
        setNotification(res.data.notification);
      } catch (error) {
        console.error("Error fetching notification:", error);
      }
    };
    fetchNotification();
  }, [id, location.pathname]);

  useEffect(() => {
    const fetchPostStatus = async () => {
      if (
        notification &&
        notification.meta?.postId &&
        notification.type === "system" &&
        notification.title &&
        notification.title.toLowerCase().includes("taken down")
      ) {
        setCheckingReview(true);
        try {
          const res = await axios.get(`/post/${notification.meta.postId}`);
          setPostStatus(res.data.post);
        } catch (e) {
          setPostStatus(null);
        }
        setCheckingReview(false);
      }
    };
    fetchPostStatus();
  }, [notification]);

  const handleAppeal = async () => {
    if (!notification?.meta?.postId) {
      toast.error("Post ID not found for appeal.");
      return;
    }
    setAppealing(true);
    try {
      await axios.post(
        `/admin/posts/${notification.meta.postId}/request-review`,
        {},
        { withCredentials: true }
      );
      toast.success("Appeal submitted! Our team will review your post.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit appeal.");
    }
    setAppealing(false);
  };

  const handleProfileClick = () => {
    const sender = notification?.sender;
    const senderModel = notification?.senderModel;
    if (!sender || !senderModel) return;
    if (senderModel === "Admin") return;
    if (senderModel === "User") {
      if (sender.createdCommunity && sender.isCommunityAccount) {
        if (sender.username) navigate(`/community/${sender.username}`);
        return;
      }
      if (sender.username) navigate(`/user/${sender.username}`);
      return;
    }
    if (senderModel === "Community") {
      if (sender.username) navigate(`/community/${sender.username}`);
      return;
    }
  };

  if (!notification) return <div className={styles.loading}>Loading...</div>;

  const senderName = notification?.sender?.name || "System";
  const senderPic = notification?.sender?.picture || notification?.sender?.avatar || userImg;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.badge}>
              {notification.type === "broadcast"
                ? "Broadcast message"
                : notification.type === "system"
                  ? "System Notification"
                  : "Notification"}
            </div>
            <h2 className={styles.title}>{notification.title}</h2>
            <div className={styles.meta}>
              <div className={styles.senderInfo} onClick={handleProfileClick}>
                <img
                  src={senderPic}
                  className={styles.avatar}
                  alt="Sender"
                  onError={(e) => { e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + notification._id; }}
                />
                <span className={styles.senderName}>{senderName}</span>
              </div>
              <span className={styles.dot}>•</span>
              <span className={styles.time}>{timeAgo(notification.createdAt)}</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => navigate(-1)}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.body}>
          <ReactQuill
            value={notification.message}
            readOnly={true}
            theme="bubble"
            modules={{ toolbar: false }}
            className={styles.quillContent}
          />

          <div className={styles.actionsArea}>
            {notification &&
              notification.type === "system" &&
              notification.title &&
              notification.title.toLowerCase().includes("taken down") &&
              notification.meta?.postId &&
              (checkingReview ? (
                <div className={styles.statusMsg}>Checking post status...</div>
              ) : !postStatus ? null : !postStatus.isDeleted ? (
                <div className={`${styles.statusMsg} ${styles.success}`}>
                  This post has been restored and is now visible to users.
                </div>
              ) : postStatus.underReview === "pending" ? (
                <div className={`${styles.statusMsg} ${styles.warning}`}>
                  Review already requested. Awaiting admin action.
                </div>
              ) : postStatus.underReview === "rejected" ? (
                <div className={`${styles.statusMsg} ${styles.error}`}>
                  Your appeal was rejected by the admin.
                  {postStatus.rejectionReason && (
                    <div className={styles.reason}>
                      Reason: {postStatus.rejectionReason}
                    </div>
                  )}
                </div>
              ) : postStatus.underReview === "approved" ? (
                <div className={`${styles.statusMsg} ${styles.success}`}>
                  Your post appeal was approved and the post is restored.
                </div>
              ) : (
                <Button
                  className={styles.appealButton}
                  onClick={handleAppeal}
                  disabled={appealing}
                >
                  {appealing ? "Submitting..." : "Request Review"}
                </Button>
              ))}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            <span>ID: {notification._id}</span>
            <span>Received: {timeAgo(notification.createdAt)}</span>
          </div>
          <button
            className={styles.markReadBtn}
            onClick={() => navigate(-1)}
          >
            Mark as Read & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationReadPage;
