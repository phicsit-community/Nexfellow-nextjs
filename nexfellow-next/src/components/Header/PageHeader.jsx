"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import api from "../../lib/axios";
import { Search, LayoutDashboard, Users, LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import SearchCommand from "../SearchBar/search-command";
import PlayOnce from "../animatedIcon/PlayOnce";
import AnimatedNotification from "./animated/notification.json";
import NotificationModal from "../Notification/NotificationModal";
import ThemeToggleButton from "../ThemeToggle/ThemeToggleButton";
import ModeratedDropdown from "./ModeratedDropdown";

import styles from "./PageHeader.module.css";

function PageHeader() {
  const router = useRouter();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [moderated, setModerated] = useState([]);

  // Notification state
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Search dialog state
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchUserData = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await api.get("/user/profile");
        setUser(response.data);
      } catch (err) {
        setError(true);
        console.error("Failed to load user data:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchModerated = async () => {
      try {
        const res = await api.get("/user/moderated-communities");
        setModerated(res.data || []);
      } catch (err) {
        // Silently fail
      }
    };
    fetchModerated();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await api.get("/notifications/unread-count");
        setUnreadCount(res.data?.count || 0);
      } catch (err) {
        // Silently fail
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

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const response = await api.get("/user/logout", { withCredentials: true });
      if (response.status === 200) {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        router.push("/login");
      }
    } catch (error) {
      console.error("Error during logout:", error.message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={styles.pageHeader}>
      {/* Search bar */}
      <div className={styles.searchWrapper}>
        <SearchCommand />
      </div>

      {/* Right section - notification + profile */}
      <div className={styles.rightSection}>
        {/* Notification bell */}
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

        {/* Profile avatar with dropdown */}
        {loading ? (
          <div className={`${styles.profileLink} ${styles.skeleton}`}>
            <div className={`${styles.skeletonCircle} ${styles.shimmer}`}></div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={styles.profileLink}>
                {user?.profilePhoto && !error ? (
                  <img
                    className={styles.dp}
                    src={user.profilePhoto}
                    alt={user.name || "User"}
                    onError={(e) => {
                      e.target.parentElement.innerHTML = `<div class="${styles.initials}">${getInitials(user.name)}</div>`;
                    }}
                  />
                ) : (
                  <div className={styles.initials}>
                    {getInitials(user?.name)}
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className={`${styles.menuContent} w-72 p-0 mt-3`}
            >
              <Link
                href={`/dashboard/${user?.username}`}
                className={styles.profileHeader}
              >
                <div className={styles.avatar}>
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Avatar" />
                  ) : (
                    <span className={styles.avatarInitials}>
                      {getInitials(user?.name)}
                    </span>
                  )}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user?.name}</span>
                  <span className={styles.userHandle}>@{user?.username}</span>
                </div>
              </Link>

              <div className={styles.section}>
                <div className={styles.sectionLabel}>Appearance</div>
                <DropdownMenuItem asChild className={styles.menuItem}>
                  <ThemeToggleButton />
                </DropdownMenuItem>
              </div>

              <div className={styles.section}>
                <ModeratedDropdown
                  moderated={moderated}
                  getInitials={getInitials}
                />
              </div>

              <div className={styles.section}>
                <div className={styles.sectionLabel}>Navigation</div>
                <DropdownMenuItem asChild className={styles.menuItem}>
                  <Link href={`/dashboard/${user?.username}`}>
                    <LayoutDashboard className={styles.icon} />
                    Dashboard
                  </Link>
                </DropdownMenuItem>

                {user?.isCommunityAccount && user?.createdCommunity ? (
                  <DropdownMenuItem asChild className={styles.menuItem}>
                    <Link href={`/community/${user?.username}`}>
                      <Users className={styles.icon} />
                      View as a member
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild className={styles.menuItem}>
                    <Link href={`/user/${user?.username}`}>
                      <Users className={styles.icon} />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                )}
              </div>

              <div className={styles.section}>
                <div className={styles.sectionLabel}>Account</div>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className={`${styles.menuItem} ${styles.logout}`}
                >
                  <LogOut className={styles.logoutIcon} />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
