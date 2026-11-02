"use client";

import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import api from "../../lib/axios";
import styles from "./FollowListModal.module.css";
import UserAvatar from "../UserAvatar/UserAvatar";
import ModalPortal from "../Modals/ModalPortal";
import Skeleton from "../common/Skeleton";
import useFollow from "../../hooks/useFollow";
import { isSelf } from "../../utils/currentUser";
import { getProfilePath } from "../../utils/profilePath";

const TABS = [
  { key: "followers", label: "Followers", hidden: "This user keeps their followers private.", empty: "No followers yet." },
  { key: "following", label: "Following", hidden: "This user keeps who they follow private.", empty: "Not following anyone yet." },
];

// One person in a list, with the viewer's own follow button for them
const FollowRow = ({ person, onOpen, onFollowChange }) => {
  const self = isSelf(person._id);
  const follow = useFollow(self ? null : person._id, {
    onChange: (nowFollowing) => onFollowChange?.(person, nowFollowing),
  });
  const [error, setError] = useState(null);

  const handleFollow = async (e) => {
    e.stopPropagation();
    setError(null);
    try {
      await follow.toggle();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update follow.");
    }
  };

  return (
    <div className={styles.memberItem} onClick={() => onOpen(person)}>
      <div className={styles.profileSection}>
        <UserAvatar user={person} className={styles.avatar} />
        <div className={styles.memberInfo}>
          <div className={styles.memberName}>{person.name || "Unknown User"}</div>
          <div className={styles.memberUsername}>@{person.username}</div>
        </div>
      </div>
      {!self && (
        <button
          className={`${styles.followButton} ${follow.isFollowing ? styles.following : ""}`}
          onClick={handleFollow}
          disabled={follow.loading}
        >
          {follow.loading ? "Loading..." : follow.label}
        </button>
      )}
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

/**
 * A user's Followers and Following lists, opened from the counts on their
 * profile. Rows use the same follow button as the rest of the app. Mount it
 * only while open, so each opening starts on the clicked count with fresh lists.
 *
 * @param initialTab - "followers" or "following"
 * @param onFollowChange - (person, nowFollowing) after the viewer follows or
 *   unfollows someone in a list
 */
const FollowListModal = ({ onClose, userId, initialTab = "followers", onFollowChange }) => {
  const [tab, setTab] = useState(initialTab);
  // Per tab: { people, hidden } once loaded
  const [lists, setLists] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const fetchList = async (key) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/user/${key}/${userId}`);
      setLists((prev) => ({ ...prev, [key]: { people: data[key] || [], hidden: Boolean(data[`${key}Hidden`]) } }));
    } catch (err) {
      // Signed-out visitors see the counts on a shared profile, but not the lists
      setError(err.response?.status === 401
        ? { message: "Sign in to see this list.", canRetry: false }
        : { message: `Failed to load ${key}.`, canRetry: true });
    } finally {
      setLoading(false);
    }
  };

  // Load each list the first time its tab is shown
  useEffect(() => {
    if (userId && !lists[tab]) fetchList(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, tab]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const current = TABS.find((t) => t.key === tab);
  const list = lists[tab];
  const query = searchQuery.toLowerCase();
  const people = (list?.people || []).filter(
    (p) => p.name?.toLowerCase().includes(query) || p.username?.toLowerCase().includes(query)
  );

  const openProfile = (person) => {
    onClose();
    router.push(getProfilePath(person));
  };

  return (
    <ModalPortal>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.modalContainer}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={current.label}
        >
          <div className={styles.modalHeader}>
            <div className={styles.tabs} role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  className={`${styles.tab} ${tab === t.key ? styles.activeTab : ""}`}
                  onClick={() => {
                    setTab(t.key);
                    setSearchQuery("");
                    setError(null);
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button className={styles.closeButton} onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>

          {!list?.hidden && !error && (
            <div className={styles.searchBar}>
              <IoSearchOutline className={styles.searchIcon} />
              <input
                type="text"
                placeholder={`Search ${current.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              {error.message}
              {error.canRetry ? (
                <button className={styles.retryButton} onClick={() => fetchList(tab)}>
                  Retry
                </button>
              ) : (
                <button className={styles.retryButton} onClick={() => router.push("/sign-in")}>
                  Sign in
                </button>
              )}
            </div>
          )}

          {loading || (!list && !error) ? (
            <div className={styles.skeletonContainer}>
              {[...Array(4)].map((_, index) => (
                <div key={index} className={styles.skeletonFollowerItem}>
                  <div className={styles.profileSection}>
                    <Skeleton type="avatar" />
                    <div className={styles.memberInfo}>
                      <Skeleton type="text-md" />
                      <Skeleton type="text-sm" />
                    </div>
                  </div>
                  <Skeleton type="button" />
                </div>
              ))}
            </div>
          ) : list && (
            <div className={styles.membersList}>
              {list.hidden ? (
                <p className={styles.noFollowersMessage}>{current.hidden}</p>
              ) : people.length > 0 ? (
                people.map((person) => (
                  <FollowRow
                    key={person._id}
                    person={person}
                    onOpen={openProfile}
                    onFollowChange={onFollowChange}
                  />
                ))
              ) : (
                <p className={styles.noFollowersMessage}>
                  {searchQuery ? "No matches." : current.empty}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
};

export default FollowListModal;
