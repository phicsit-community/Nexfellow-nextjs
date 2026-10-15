"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import api from "../../lib/axios";

import SearchCommand from "../SearchBar/search-command";
import PlayOnce from "../animatedIcon/PlayOnce";
import AnimatedNotification from "./animated/notification.json";
import NotificationModal from "../Notification/NotificationModal";
import ProfileDropdown from "../ProfileDropdown/ProfileDropdown";
import nexfellowLogo from "@/assets/NexFellowLogo.svg";
import nexfellowLogoDark from "@/assets/NexFellowLogoDark.svg";

import styles from "./PageHeader.module.css";

const PAGE_TITLES = {
  "/my-products": "My products",
  "/launches": "Launches",
  "/buildersmap": "Builders Map",
  "/inbox": "Inbox",
  "/wallet": "Wallet",
  "/search": "Search",
};

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname?.startsWith("/dashboard")) return "Dashboard";
  if (pathname?.startsWith("/explore")) return "Profile";
  if (pathname?.startsWith("/post")) return "Post";
  return null;
}

function PageHeader({ onMenuToggle }) {
  const pathname = usePathname();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const pageTitle = getPageTitle(pathname);

  // Notification state
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Search dialog state
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await api.get("/notifications/unread-count", {
          suppressErrorLog: true,
        });
        setUnreadCount(res.data?.count || 0);
      } catch (err) {
        // Silently fail and keep badge at 0 for transient backend issues.
        setUnreadCount(0);
      }
    };
    fetchUnreadCount();
  }, [isLoggedIn]);

  // Keyboard shortcut for search
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const toggleNotification = () => setIsNotificationOpen((prev) => !prev);

  return (
    <div className={styles.pageHeader}>
      {/* Hamburger — mobile only, opens sidebar drawer */}
      {onMenuToggle && (
        <button className={styles.hamburgerBtn} onClick={onMenuToggle} aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6"  x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* Page title (shown on specific pages) or mobile logo */}
      {pageTitle ? (
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
      ) : (
        <Link href="/feed" className={styles.mobileLogo}>
          <img
            src={nexfellowLogo.src || nexfellowLogo}
            alt="NexFellow"
            className={styles.mobileLogoLight}
          />
          <img
            src={nexfellowLogoDark.src || nexfellowLogoDark}
            alt="NexFellow"
            className={styles.mobileLogoDark}
          />
        </Link>
      )}

      {/* Search bar */}
      <div className={`${styles.searchWrapper} ${pageTitle ? styles.searchWrapperRight : ''}`}>
        <SearchCommand />
      </div>

      {/* Right section - notification + profile */}
      <div className={styles.rightSection}>
        {/* Notification bell — hidden on pages that have a page title (e.g. My products) */}
        {!pageTitle && (
          <>
            <div
              onClick={toggleNotification}
              className={styles.notificationIcon}
              onMouseEnter={() => setHoveredIndex(0)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: "pointer", position: "relative" }}
            >
              <PlayOnce
                icon={AnimatedNotification}
                play={hoveredIndex === 0}
                size={28}
              />
              {!isNotificationOpen && unreadCount > 0 && (
                <span className={styles.notificationBadge}>{unreadCount}</span>
              )}
            </div>
            {isNotificationOpen && (
              <NotificationModal closeModal={toggleNotification} />
            )}
          </>
        )}

        {/* Profile avatar with dropdown — shared with the feed so it looks the same everywhere */}
        <ProfileDropdown />
      </div>
    </div>
  );
}

export default PageHeader;
