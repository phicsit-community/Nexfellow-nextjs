"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import api from "../../lib/axios";
import { useMediaQuery } from "react-responsive";
import ThemeToggleButton from "../ThemeToggle/ThemeToggleButton";
import ModeratedDropdown from "./ModeratedDropdown";
import { useTheme } from "../../hooks/useTheme";

// styles
import styles from "./Header.module.css";

// assets
import navbarlogo from "../../assets/NexFellowLogo.svg";
import navbarlogoDark from "../../assets/NexFellowLogoDark.svg";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Users, LogOut, LayoutDashboard } from "lucide-react";

import announcementIconStatic from "./animated/announcement.png";
import announcementAnimated from "./animated/announcement.gif";
import notificationAnimated from "./animated/notification.json";

import PlayOnce from "../animatedIcon/PlayOnce";

// components
import SearchCommand, {
  SearchCommandMobile,
} from "../SearchBar/search-command";
import NotificationModal from "../Notification/NotificationModal";
import WhatsNewModal from "../WhatsNew/WhatsNewModal";
import { GrAnnounce } from "react-icons/gr";

function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [moderated, setModerated] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState();

  const isMobile = useMediaQuery({ maxWidth: 640 });
  const { effectiveTheme } = useTheme();
  const toggleModal = () => setIsModalOpen((prev) => !prev);
  const toggleWhatsNew = () => setIsWhatsNewOpen((prev) => !prev);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoggedIn) return;
      setLoading(true);
      setError(null);
      try {
        const userData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;
        const userId = userData?.id;
        const username = userData?.username;

        if (!userId || !username) throw new Error("Invalid user data");

        const response = await api.get(`/user/profile`);
        setUser(response.data);
      } catch (err) {
        setError("Failed to load user data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchUnreadNotifications = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await api.get(`/notifications/unread`);
        setUnreadCount(res.data.count || 0);
      } catch (error) {
        console.error("Error fetching unread notifications:", error);
      }
    };

    const fetchModerated = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await api.get("/community/moderator/communities");
        setModerated(res.data.communities || []);
        console.log("Moderated communities fetched:", res.data.communities);
      } catch (e) {
        console.error("Error fetching moderated communities:", e);
      }
    };

    if (isLoggedIn) {
      fetchUserData();
      fetchUnreadNotifications();
      fetchModerated();
    }

    const interval = isLoggedIn ? setInterval(fetchUnreadNotifications, 5000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoggedIn]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const response = await api.get("/user/logout", {
        withCredentials: true,
      });

      if (response.status === 200) {
        localStorage.clear();
        router.push("/login");
      } else {
        console.error("Logout failed:", response.data.message);
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Error during logout:", error.message);
      setIsLoggingOut(false);
    }
  };

  const handleLogoClick = (e) => {
    if (pathname === "/feed") {
      e.preventDefault();
      window.location.reload();
    }
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className={styles.header}>
      <div className={styles.navbarLogo}>
        <Link href="/feed" onClick={handleLogoClick}>
          <img
            className={styles.navbarlogo}
            src={(effectiveTheme === "dark" ? navbarlogoDark.src || navbarlogoDark : navbarlogo.src || navbarlogo)}
            alt="NexFellow logo"
            onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
          />
        </Link>
      </div>

      <div className={styles.headRight}>
        <SearchCommand />
        <div className={styles.headRightRight}>
          {isMobile && <SearchCommandMobile />}
          <div
            onClick={toggleWhatsNew}
            style={{ cursor: "pointer", position: "relative" }}
            onMouseEnter={() => setHoveredIndex(1)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={styles.whatsNewIcon}
          >
            {/* <GrAnnounce className={styles.sparklesIcon} fill="#000" /> */}
            <PlayOnce
              icon={announcementAnimated}
              play={hoveredIndex === 1}
              size={25}
              style={{ width: 25, height: 25 }}
              staticIcon={announcementIconStatic.src || announcementIconStatic}
            />
          </div>
          {isWhatsNewOpen && <WhatsNewModal closeModal={toggleWhatsNew} />}
          <div
            onClick={toggleModal}
            style={{ cursor: "pointer", position: "relative" }}
            className={styles.notificationIcon}
          >
            {/* <img
              src={isModalOpen ? bellFilledIcon : bellOutlineIcon}
              alt="Notifications"
              className={styles.bellIcon}
            /> */}
            <div
              onMouseEnter={() => setHoveredIndex(0)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <PlayOnce
                icon={notificationAnimated}
                play={hoveredIndex === 0}
                size={30}
              />
            </div>
            {!isModalOpen && unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount}</span>
            )}
          </div>
          {isModalOpen && <NotificationModal closeModal={toggleModal} />}

          {loading ? (
            <div className={`${styles.profileLink} ${styles.skeleton}`}>
              <div
                className={`${styles.skeletonCircle} ${styles.shimmer}`}
              ></div>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className={styles.profileLink}>
                  {user?.profilePhoto && !error ? (
                    <>
                      <img
                        className={styles.dp}
                        src={user.profilePhoto}
                        alt={user.name || "User"}
                        onError={(e) => {
                          e.target.parentElement.classList.add(styles.initials);
                          e.target.parentElement.textContent = getInitials(
                            user.name
                          );
                        }}
                      />
                      <span className={styles.statusDot}></span>
                    </>
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
                  href={user?.username ? `/dashboard/${user.username}` : "#"}
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
                  {/* <div className={styles.sectionLabel}>Moderated Communities</div> */}
                  <ModeratedDropdown
                    moderated={moderated}
                    getInitials={getInitials}
                  />
                </div>

                <div className={styles.section}>
                  <div className={styles.sectionLabel}>Navigation</div>
                  <DropdownMenuItem asChild className={styles.menuItem}>
                    <Link href={user?.username ? `/dashboard/${user.username}` : "#"}>
                      <LayoutDashboard
                        className={`dark:text-white ${styles.icon}`}
                      />
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
                        <Users className={`dark:text-white ${styles.icon}`} />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* <DropdownMenuItem asChild className={styles.menuItem}>
                    <Link href="/settings">
                      <Settings className={styles.icon} />
                      Settings
                    </Link>
                  </DropdownMenuItem> */}
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
    </div>
  );
}

export default Header;
