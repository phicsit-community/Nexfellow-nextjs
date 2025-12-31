"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  MdEdit,
  MdSend,
  MdClose,
  MdArrowDropDown,
  MdOutlineMessage,
} from "react-icons/md";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import styles from "./Broadcast.module.css";
import BackButton from "../../components/BackButton/BackButton";
import DOMPurify from "dompurify";
import Skeleton from "../../components/Skeleton/Skeleton";
import { toast } from "sonner";
import { IoArrowBack, IoSendOutline } from "react-icons/io5";
import { MdMessage } from "react-icons/md";
import {
  Calendar,
  Edit,
  MessageSquare,
  Save,
  Users,
  Bell,
  Send,
} from "lucide-react";
import { Select, TreeSelect, Input, Modal, List, Button } from "antd";
import "antd/dist/reset.css";
import { SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button as ShadCnButton } from "@/components/ui/button";

dayjs.extend(relativeTime);

// Mail Card Skeleton Component
const MailCardSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array(count)
        .fill()
        .map((_, index) => (
          <Skeleton key={index} type="mailCard" />
        ))}
    </>
  );
};

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

const Broadcast = () => {
  const router = useRouter();
  const params = useParams();
  const communityId = params?.communityId;
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const dropdownRef = useRef(null);
  const [recipients, setRecipients] = useState([]);
  const [community, setCommunity] = useState(null);
  const [userData, setUserData] = useState(null);
  const [recipientSource, setRecipientSource] = useState("members");
  const [eventRegistrantGroups, setEventRegistrantGroups] = useState([]);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [isDraftsLoading, setIsDraftsLoading] = useState(false);
  const [activityStats, setActivityStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // reset selected recipients when recipient source changes
  useEffect(() => {
    setSelectedRecipients([]);
  }, [recipientSource]);

  useEffect(() => {
    const fetchRecipients = async () => {
      setIsContentLoading(true);
      try {
        if (recipientSource === "members") {
          const res = await axios.get(`/community/id/${communityId}`);
          setCommunity(res.data);
          const user = await axios.get(`/user/profile`);
          setUserData(user.data);
          if (res.data.community.owner.followers) {
            setRecipients(res.data.community.owner.followers);
          } else {
            setRecipients([]);
          }
          setEventRegistrantGroups([]);
        } else if (recipientSource === "eventRegistrants") {
          const res = await axios.get(
            `/event/community/${communityId}/registrants`
          );
          setEventRegistrantGroups(res.data.events || []);
          setRecipients([]);
        }
      } catch (error) {
        setRecipients([]);
        setEventRegistrantGroups([]);
        console.error("Error fetching recipients:", error);
      }
      setIsContentLoading(false);
    };

    if (communityId) fetchRecipients();
  }, [communityId, recipientSource]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsContentLoading(true);
        const res = await axios.get(
          `/notifications/community/${communityId}/notifications`
        );
        setRecentNotifications(res.data.notifications);
        setIsContentLoading(false);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setIsContentLoading(false);
      }
    };
    if (communityId) fetchNotifications();
  }, [communityId]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get(`/notifications/unread`);
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setIsStatsLoading(true);
      try {
        const res = await axios.get(
          `/notifications/community/${communityId}/broadcast/activity`
        );
        setActivityStats(res.data);
      } catch {
        setActivityStats(null);
      } finally {
        setIsStatsLoading(false);
      }
    };
    if (communityId) fetchStats();
  }, [communityId]);

  const handleSendNotification = async () => {
    if (!subject || !emailContent || selectedRecipients.length === 0) {
      toast("Please fill all fields and select recipients!");
      return;
    }

    setIsLoading(true);
    const cleanContent = DOMPurify.sanitize(emailContent);

    try {
      const res = await axios.post(
        `/notifications/community/${communityId}/send`,
        {
          title: subject,
          message: cleanContent,
          priority: "high",
          recipients: selectedRecipients,
          type: "broadcast",
          broadCastType: recipientSource,
        }
      );

      toast.success("Notification sent successfully!");
      setEmailContent("");
      setSubject("");
      setSelectedRecipients([]);
      setRecentNotifications((prev) => [res.data.notification, ...prev]);
    } catch (err) {
      toast.error("Error sending notification:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraftToLocal = (draft) => {
    const key = `broadcastDrafts_${communityId}`;
    let localDrafts = [];
    try {
      localDrafts = JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      localDrafts = [];
    }
    if (!draft._id) draft._id = `local_${Date.now()}`;
    localDrafts = localDrafts.filter((d) => d._id !== draft._id);
    localDrafts.unshift(draft);
    localStorage.setItem(key, JSON.stringify(localDrafts));
  };

  const getLocalDrafts = () => {
    const key = `broadcastDrafts_${communityId}`;
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      return [];
    }
  };

  const saveDraft = async () => {
    if (!subject || !emailContent || selectedRecipients.length === 0) {
      toast("Please fill all fields and select recipients!");
      return;
    }
    setIsDrafting(true);
    const cleanContent = DOMPurify.sanitize(emailContent);
    const draftObj = {
      title: subject,
      message: cleanContent,
      recipients: selectedRecipients,
      createdAt: new Date().toISOString(),
    };
    try {
      saveDraftToLocal(draftObj);
      toast.success("Draft saved locally!");
    } catch (err) {
      toast.error("Error saving draft locally.");
    } finally {
      setIsDrafting(false);
    }
  };

  const fetchDrafts = async () => {
    setIsDraftsLoading(true);
    try {
      setDrafts(getLocalDrafts());
    } catch (err) {
      setDrafts([]);
      toast.error("Error loading drafts from local storage.");
    } finally {
      setIsDraftsLoading(false);
    }
  };

  const openDrafts = () => {
    setIsDraftsOpen(true);
    fetchDrafts();
  };

  const handleLoadDraft = (draft) => {
    setSubject(draft.title);
    setEmailContent(draft.message);
    setSelectedRecipients(draft.recipients);
    setIsDraftsOpen(false);
  };

  const deleteDraft = (_id) => {
    const key = `broadcastDrafts_${communityId}`;
    let localDrafts = getLocalDrafts();
    localDrafts = localDrafts.filter((d) => d._id !== _id);
    localStorage.setItem(key, JSON.stringify(localDrafts));
    setDrafts(localDrafts);
    toast.success("Draft deleted.");
  };

  const getRecipientOptions = () => {
    if (recipientSource === "members") {
      const options = recipients.map((user) => ({
        label: user.name,
        value: user._id,
      }));
      return [{ label: "Select All", value: "__all__" }, ...options];
    } else {
      const options = eventRegistrantGroups.flatMap((eventGroup) =>
        eventGroup.registrants.map((user) => ({
          label: `${user.name} (${eventGroup.eventTitle})`,
          value: user._id,
        }))
      );
      return [{ label: "Select All", value: "__all__" }, ...options];
    }
  };

  const handleRecipientsChange = (value) => {
    const allOptionValue = "__all__";
    const options = getRecipientOptions()
      .slice(1)
      .map((opt) => opt.value);
    const prevAllSelected =
      selectedRecipients.length === options.length &&
      (selectedRecipients.includes(allOptionValue) ||
        (value.length === options.length + 1 &&
          value.includes(allOptionValue)));

    if (
      prevAllSelected &&
      !value.includes(allOptionValue) &&
      value.length < options.length
    ) {
      setSelectedRecipients([]);
      return;
    }

    if (value.includes(allOptionValue)) {
      setSelectedRecipients(options);
      return;
    }

    setSelectedRecipients(value);
  };

  const getTreeData = () => {
    return eventRegistrantGroups.map((event) => ({
      title: `${event.eventTitle} (${new Date(
        event.eventStartDate
      ).toLocaleString()})`,
      value: event.eventId,
      selectable: false,
      children: event.registrants.map((user) => ({
        title: user.name,
        value: user._id,
        key: user._id,
      })),
    }));
  };

  const typeMeta = {
    challenges: {
      icon: <span style={{ color: "var(--color-primary)" }}><Users size={22} /></span>,
      label: "Challenges",
      color: "var(--color-muted)",
      text: "var(--color-primary)",
    },
    contests: {
      icon: <span style={{ color: "var(--color-primary)" }}><Users size={22} /></span>,
      label: "Contests",
      color: "var(--color-muted)",
      text: "var(--color-primary)",
    },
    events: {
      icon: <span style={{ color: "var(--color-primary)" }}><Calendar size={22} /></span>,
      label: "Events",
      color: "var(--color-muted)",
      text: "var(--color-primary)",
    },
    communication: {
      icon: <span style={{ color: "var(--color-primary)" }}><MessageSquare size={22} /></span>,
      label: "Communication",
      color: "var(--color-muted)",
      text: "var(--color-primary)",
    },
    broadcast: {
      icon: <span style={{ color: "var(--color-primary)" }}><Bell size={22} /></span>,
      label: "Broadcast",
      color: "var(--color-muted)",
      text: "var(--color-primary)",
    },
  };

  function getTypeMeta(type) {
    if (!type) return typeMeta.broadcast;
    const t = type.toLowerCase();
    if (t.includes("challenge")) return typeMeta.challenges;
    if (t.includes("contest")) return typeMeta.contests;
    if (t.includes("event")) return typeMeta.events;
    if (t.includes("communicat")) return typeMeta.communication;
    if (t.includes("broadcast")) return typeMeta.broadcast;
    return typeMeta.broadcast;
  }

  return (
    <div className={styles.container}>
      {/* header section */}
      <div className={styles.headerSection}>
        <div>
          <div className={styles.backButtonWrapper}>
            <BackButton
              onClick={() => router.back()}
              showText={true}
              smallText={true}
            />
          </div>
          <div className={styles.headerTitleRow}>
            <div className={styles.headerIconBox}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h2 className={styles.pageTitle}>BroadCast</h2>
              <p className={styles.pageSubtitle}>
                Notify your followers and boost your reach
              </p>
            </div>
          </div>
        </div>
        <button className={styles.draftsButton} onClick={openDrafts}>
          <Save size={20} />
          <span>View Drafts</span>
        </button>
      </div>

      {/* main content section */}
      <div className={styles.mainContentWrapper}>
        <div className={styles.mailSectionWrapper}>
          <div className={styles.sendMail}>
            <div
              className={styles.recipientSourceSelector}
              style={{ marginBottom: "2rem" }}
            >
              <div
                style={{
                  fontWeight: 500,
                  color: "var(--color-primary)",
                  fontSize: "15px",
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "18px", color: "var(--color-primary)" }}>⦿</span>
                Target Audience
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  width: "100%",
                }}
              >
                <button
                  type="button"
                  onClick={() => setRecipientSource("members")}
                  style={{
                    border:
                      recipientSource === "members"
                        ? "2px solid var(--color-primary)"
                        : "1.5px solid var(--color-border)",
                    background:
                      recipientSource === "members"
                        ? "var(--color-card)"
                        : "var(--color-card)",
                    color: "var(--color-foreground)",
                    borderRadius: "12px",
                    padding: "18px 32px 14px 18px",
                    minWidth: "220px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    cursor: "pointer",
                    boxShadow:
                      recipientSource === "members"
                        ? "0 2px 8px 0 color-mix(in oklch, var(--color-primary) 16%, transparent)"
                        : "none",
                    transition: "border 0.2s, box-shadow 0.2s, background 0.2s",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "2px",
                    }}
                  >
                    <span style={{ color: "var(--color-primary)", fontSize: "20px" }}>
                      <Users size={20} />
                    </span>
                    <span style={{ fontWeight: 600, fontSize: "16px" }}>
                      Community
                    </span>
                  </div>
                  <span style={{ color: "var(--color-muted-foreground)", fontSize: "14px" }}>
                    Members & followers
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientSource("eventRegistrants")}
                  style={{
                    border:
                      recipientSource === "eventRegistrants"
                        ? "2px solid var(--color-primary)"
                        : "1.5px solid var(--color-border)",
                    background:
                      recipientSource === "eventRegistrants"
                        ? "var(--color-card)"
                        : "var(--color-card)",
                    color: "var(--color-foreground)",
                    borderRadius: "12px",
                    padding: "18px 32px 14px 18px",
                    minWidth: "220px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    cursor: "pointer",
                    boxShadow:
                      recipientSource === "eventRegistrants"
                        ? "0 2px 8px 0 color-mix(in oklch, var(--color-primary) 16%, transparent)"
                        : "none",
                    transition: "border 0.2s, box-shadow 0.2s, background 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "2px",
                    }}
                  >
                    <span style={{ color: "var(--color-primary)", fontSize: "20px" }}>
                      <Calendar size={20} />
                    </span>
                    <span style={{ fontWeight: 600, fontSize: "16px" }}>
                      Events
                    </span>
                  </div>
                  <span style={{ color: "var(--color-muted-foreground)", fontSize: "14px" }}>
                    Event registrants
                  </span>
                </button>
              </div>
            </div>

            {isContentLoading ? (
              <Skeleton type="text" count={1} />
            ) : (
              <>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Users size={20} color="var(--color-primary)" />
                  <span style={{ color: "var(--color-foreground)" }}>
                    Select Recipients
                  </span>
                </p>

                {recipientSource === "eventRegistrants" ? (
                  <div style={{ marginBottom: "1.5rem", width: "100%" }}>
                    <TreeSelect
                      treeData={getTreeData()}
                      value={selectedRecipients}
                      onChange={setSelectedRecipients}
                      treeCheckable={true}
                      showCheckedStrategy={TreeSelect.SHOW_CHILD}
                      placeholder="Select or search event registrants"
                      style={{ width: "100%" }}
                      allowClear
                      showSearch
                      maxTagCount="responsive"
                      size="large"
                    />
                  </div>
                ) : (
                  <div style={{ marginBottom: "1.5rem", width: "100%" }}>
                    <Select
                      mode="multiple"
                      size="large"
                      allowClear
                      showSearch
                      style={{ width: "100%" }}
                      maxTagCount="responsive"
                      placeholder="Select or search members"
                      value={
                        selectedRecipients.length ===
                          getRecipientOptions().slice(1).length
                          ? [...selectedRecipients]
                          : selectedRecipients
                      }
                      onChange={handleRecipientsChange}
                      optionFilterProp="label"
                      options={getRecipientOptions()}
                    />
                  </div>
                )}
              </>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "10px",
                marginTop: "20px",
              }}
            >
              <Edit size={20} color="var(--color-primary)" />
              <span
                style={{ fontSize: "16px", fontWeight: "500", color: "var(--color-foreground)" }}
              >
                Subject Line
              </span>
            </div>

            {isContentLoading ? (
              <Skeleton type="text" count={1} />
            ) : (
              <div className={styles.subjectInput}>
                <Input
                  size="large"
                  placeholder="Enter Broadcast Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            )}

            {isContentLoading ? (
              <Skeleton type="button" />
            ) : (
              <div style={{ marginTop: "20px", marginBottom: "0" }}>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "500",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--color-foreground)",
                  }}
                >
                  <MessageSquare size={20} color="var(--color-primary)" />
                  Broadcast Content
                </p>
                <div className={styles.emailContentBox}>
                  <ReactQuill
                    value={emailContent}
                    onChange={setEmailContent}
                    style={{
                      height: "250px",
                      paddingBottom: "50px",
                      border: "none",
                      width: "100%",
                    }}
                  />
                </div>
              </div>
            )}

            <div className={styles.buttonRow} style={{ width: "100%" }}>
              <ShadCnButton
                onClick={saveDraft}
                disabled={isDrafting}
                style={{
                  fontSize: "14px",
                  lineHeight: "20px",
                  padding: "14px 30px",
                  borderRadium: "12px",
                }}
                size="large"
                variant="outline"
              >
                <SaveOutlined size={20} className="mr-2 inline" />{" "}
                {isDrafting ? "Saving..." : "Save Draft"}
              </ShadCnButton>
              <ShadCnButton
                onClick={handleSendNotification}
                disabled={isLoading}
                style={{
                  fontSize: "14px",
                  lineHeight: "20px",
                  padding: "14px 30px",
                  borderRadius: "12px",
                  color: "white",
                }}
                size="large"
                variant="default"
              >
                <Send size={20} className="mr-2 inline" />{" "}
                {isLoading ? "Sending..." : "Send Broadcast"}
              </ShadCnButton>
            </div>
          </div>
        </div>

        {/* Activity section */}
        <div className={styles.activitySectionWrapper}>
          <div
            className={`${styles.recentMail}`}
            style={{
              padding: 24,
              boxShadow: "0px 0px 0px 0px",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-card)",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  background: "var(--color-primary)",
                  borderRadius: 8,
                  padding: 8,
                }}
              >
                <Bell size={22} color="#fff" />
              </span>
              <div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: 0,
                    color: "var(--color-foreground)",
                  }}
                >
                  Recent Activity
                </h2>
                <div style={{ color: "var(--color-muted-foreground)", fontSize: 14 }}>
                  Latest community updates
                </div>
              </div>
            </div>

            <div>
              <div style={{ marginTop: 18 }}>
                {isContentLoading ? (
                  <MailCardSkeleton count={3} />
                ) : recentNotifications.length > 0 ? (
                  recentNotifications.map((notif) => {
                    const meta = getTypeMeta(notif.type);
                    return (
                      <div
                        key={notif._id}
                        style={{
                          background: "var(--color-card)",
                          borderRadius: 16,
                          padding: "18px 20px 14px 20px",
                          marginBottom: 18,
                          boxShadow:
                            "0 1px 4px 0 color-mix(in oklch, var(--color-primary) 8%, transparent)",
                          border: "1px solid var(--color-border)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          color: "var(--color-foreground)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "start",
                            gap: 10,
                          }}
                        >
                          <span
                            style={{
                              background: meta.color,
                              borderRadius: 8,
                              padding: 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: meta.text,
                            }}
                          >
                            {meta.icon}
                          </span>
                          <div className="flex-1">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 600,
                                  fontSize: 16,
                                  color: "var(--color-foreground)",
                                  flex: 1,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {notif.title}
                              </span>
                            </div>
                            <div
                              style={{
                                color: "var(--color-muted-foreground)",
                                fontSize: 12,
                                margin: "4px 0 0 0",
                              }}
                            >
                              <span>
                                {(() => {
                                  const text = stripHtml(notif.message);
                                  return text.length > 40
                                    ? text.slice(0, 40) + "..."
                                    : text;
                                })()}
                              </span>
                            </div>
                            <div
                              style={{
                                color: "var(--color-muted-foreground)",
                                fontSize: 13,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                marginTop: 2,
                              }}
                            >
                              <Bell size={16} color="var(--color-muted-foreground)" />
                              {dayjs(notif.createdAt).fromNow()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.noMailsMessage}>
                    No recent notifications found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Broadcast Activity Card */}
          <div className={styles.broadcastStatsCard}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 500, opacity: 0.95 }}>
                Total Reach
              </div>
              <div
                style={{ fontSize: 32, fontWeight: 700, margin: "2px 0 0 0" }}
              >
                {isStatsLoading ? "-" : activityStats?.totalRecipients ?? 0}
              </div>
              <div style={{ fontSize: 15, opacity: 0.85, marginTop: 2 }}>
                {isStatsLoading
                  ? ""
                  : activityStats
                    ? `${activityStats.totalRead} read, ${activityStats.totalUnread} unread`
                    : "No data"}
              </div>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.18)",
                borderRadius: 12,
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={32} color="#fff" />
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Saved Drafts"
        open={isDraftsOpen}
        onCancel={() => setIsDraftsOpen(false)}
        footer={null}
        width={600}
      >
        <List
          loading={isDraftsLoading}
          dataSource={drafts}
          renderItem={(draft) => (
            <List.Item
              actions={[
                <Button key="load" type="primary" onClick={() => handleLoadDraft(draft)}>
                  Load
                </Button>,
                <Button key="delete" danger onClick={() => deleteDraft(draft._id)}>
                  Delete
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={draft.title}
                description={new Date(draft.createdAt).toLocaleString()}
              />
            </List.Item>
          )}
          locale={{ emptyText: "No drafts found" }}
        />
      </Modal>
    </div>
  );
};

export default Broadcast;
