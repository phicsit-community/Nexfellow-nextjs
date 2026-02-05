"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";
import api from "../../lib/axios";
import { useMediaQuery } from "react-responsive";

// styles
import style from "./Sidebar.module.css";

import AnimatedHome from "./animated/feed.json";
import AnimatedExplore from "./animated/explore.json";
import AnimatedLeaderboard from "./animated/leaderboard.json";
import AnimatedCommunity from "./animated/community.gif";
import AnimatedMessenger from "./animated/inbox.json";
import PlayOnce from "../animatedIcon/PlayOnce";
import AnimatedAccount from "./animated/account.json";
import staticCommuntiy from "./animated/staticCommuntiy.png";
import AnimatedSettings from "./animated/settings.json";

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [activeTab, setActiveTab] = useState(pathname);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;
        const userId = userData?.id || userData?._id;
        if (!userId) {
          // User data not available yet, will retry when Redux state updates
          setLoading(false);
          return;
        }
        const response = await api.get(`/user/profile`);
        setUser(response.data);
      } catch (err) {
        setError("Failed to load user data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [isLoggedIn]);

  const menuItems = [
    { path: "/feed", icon: AnimatedHome, label: "Home" },
    { path: "/explore", icon: AnimatedExplore, label: "Explore" },
    { path: "/leaderboard", icon: AnimatedLeaderboard, label: "Leaderboard" },
    {
      path: "/communities",
      icon: AnimatedCommunity?.src || AnimatedCommunity,
      label: "Communities",
      staticIcon: staticCommuntiy?.src || staticCommuntiy,
    },
    { path: "/inbox", icon: AnimatedMessenger, label: "Inbox" },
  ];

  const displayMenuItems = menuItems;

  const isActive = (path) => activeTab.startsWith(path);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await api.get("/user/logout", { withCredentials: true });
      if (response.status === 200) {
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        router.push("/login");
      } else {
        console.error("Logout failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error during logout:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.sidebar}>
      <ul className={style.menuItems}>
        {displayMenuItems.map((item, idx) => (
          <Link
            href={item.path}
            key={item.path}
            onClick={(e) => {
              if (pathname === item.path) {
                e.preventDefault();
                window.location.reload();
              } else {
                setActiveTab(item.path);
              }
            }}
          >
            <li
              className={isActive(item.path) ? style.setTab : ""}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={style.iconContainer}>
                <PlayOnce
                  icon={item.icon}
                  staticIcon={item.staticIcon}
                  play={hoveredIndex === idx}
                  style={{ width: 24, height: 24 }}
                />
              </div>
              {!isMobile && <span style={{ marginLeft: "5px" }}>{item.label}</span>}
            </li>
          </Link>
        ))}
      </ul>

      {!isMobile && (
        <div className={style.accountManagement}>
          <p className={style.am}>ACCOUNT MANAGEMENT</p>

          <Link
            className={style.amLink}
            href={user?.username ? `/dashboard/${user.username}` : "#"}
            onClick={() => setActiveTab("/profile")}
          >
            <div
              className={style.amItems}
              onMouseEnter={() => setHoveredIndex(5)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={style.iconContainer}>
                <PlayOnce
                  icon={AnimatedAccount}
                  play={hoveredIndex === 5}
                  style={{ width: 20, height: 20 }}
                />
              </div>
              <span>Profile</span>
            </div>
          </Link>

          <Link
            className={style.amLink}
            href={`/settings`}
            onClick={() => setActiveTab("/settings")}
          >
            <div
              className={style.amItems}
              onMouseEnter={() => setHoveredIndex(6)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={style.iconContainer}>
                <PlayOnce
                  icon={AnimatedSettings}
                  play={hoveredIndex === 6}
                  style={{ width: 20, height: 20 }}
                />
              </div>
              <span>Settings</span>
            </div>
          </Link>

          {/* Optional logout block remains commented as in original */}
          {/* <p
            onClick={handleLogout}
            className={`${style.amItems} ${style.amRedItems} ${loading ? style.disabled : ""}`}
          >
            <div className="w-8" style={{ marginLeft: "10px" }}>
              <FiLogOut className={style.icon} />
            </div>
            <span>{loading ? "Logging out..." : "Logout"}</span>
          </p> */}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
