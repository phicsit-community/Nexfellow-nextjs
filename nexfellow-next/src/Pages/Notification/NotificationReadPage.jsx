"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import axios from "axios";
import styles from "./NotificationReadPage.module.css";
import BackButton from "../../components/BackButton/BackButton";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import userImg from "./assets/Frame.svg";
import timeAgo from "./../../utils/timeAgo";

const NotificationReadPage = () => {
  const params = useParams();
  const id = params?.id;
  const pathname = usePathname();
  const router = useRouter();
  const [notification, setNotification] = useState(null);
  const [appealing, setAppealing] = useState(false);
  const [postStatus, setPostStatus] = useState(null);
  const [checkingReview, setCheckingReview] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const isSystem = pathname?.includes("system");
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
  }, [id, pathname]);

  const handleBack = () => {
    router.back();
  };

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

  if (!notification) return <div className={styles.loading}>Loading...</div>;

  const senderName = notification?.sender?.name || "System";
  const senderPic = notification?.sender?.picture || userImg;

  return (
    <div className={styles.mainContainer}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerBottom}>
            <span className={styles.badge}>
              <img src={userImg} alt="Notification type icon" />
              {notification.type === "broadcast"
                ? "Broadcast message"
                : notification.type === "system"
                  ? "System Notification"
                  : notification.type === "user"
                    ? "User Notification"
                    : "Notification"}
            </span>
            <h2 className={styles.title}>{notification.title}</h2>
            <div className={styles.meta}>
              <span className={styles.user}>
                <img
                  src={senderPic}
                  className={styles.userImg}
                  onClick={() => handleProfileClick()}
                  alt="Sender"
                />{" "}
                {senderName}
              </span>
              <span className={styles.dot}>•</span>
              <span className={styles.time}>
                {timeAgo(notification.createdAt)}
              </span>
            </div>
          </div>
          <div className={styles.closeModel}>
            <button onClick={() => router.back()} aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        <ReactQuill
          value={notification.message}
          readOnly={true}
          theme="bubble"
          modules={{ toolbar: false }}
          className={styles.body}
        />
        <div className={styles.notificationDetailsMeta}>
          {notification &&
            notification.type === "system" &&
            notification.title &&
            notification.title.toLowerCase().includes("taken down") &&
            notification.meta?.postId &&
            (checkingReview ? (
              <div style={{ marginTop: "1.2rem" }}>Checking post status...</div>
            ) : !postStatus ? null : !postStatus.isDeleted ? (
              <div
                className={styles.appealInfoMsg}
                style={{ marginTop: "1.2rem", color: "#218838" }}
              >
                This post has been restored and is now visible to users.
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
                {postStatus.rejectionReason && (
                  <div style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
                    Reason: {postStatus.rejectionReason}
                  </div>
                )}
              </div>
            ) : postStatus.underReview === "approved" ? (
              <div
                className={styles.appealInfoMsg}
                style={{ marginTop: "1.2rem", color: "#218838" }}
              >
                Your post appeal was approved and the post is restored.
              </div>
            ) : (
              <Button
                className={styles.appealButton}
                onClick={handleAppeal}
                disabled={appealing}
                style={{ marginTop: "1.2rem" }}
              >
                {appealing ? "Submitting..." : "Request Review"}
              </Button>
            ))}
        </div>
        <div className={styles.footer}>
          <span className={styles.footerMeta}>
            <p>Notification ID: {notification._id}</p> •
            <p>Received: {timeAgo(notification.createdAt)}</p>•<p>Read</p>
          </span>
          <button
            className={styles.closeButton}
            onClick={() => router.back()}
            aria-label="Mark as Read and Close"
          >
            Mark as Read & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationReadPage;
