"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";
import api from "../../lib/axios";
import { useMediaQuery } from "react-responsive";
import { useTheme } from "../../hooks/useTheme";

// styles
import style from "./Sidebar.module.css";

// Logo assets
import navbarlogo from "../../assets/NexFellowLogo.svg";
import navbarlogoDark from "../../assets/NexFellowLogoDark.svg";

import AnimatedHome from "./animated/feed.json";
import AnimatedExplore from "./animated/explore.json";
import AnimatedLeaderboard from "./animated/leaderboard.json";
import AnimatedCommunity from "./animated/community.gif";
import AnimatedMessenger from "./animated/inbox.json";
import AnimatedNotification from "../Header/animated/notification.json";
import PlayOnce from "../animatedIcon/PlayOnce";
import AnimatedAccount from "./animated/account.json";
import staticCommuntiy from "./animated/staticCommuntiy.png";
import AnimatedSettings from "./animated/settings.json";
import { Package, Globe, Rocket, Activity, Settings, Star } from "lucide-react";

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
  const { effectiveTheme } = useTheme();

  const handleLogoClick = (e) => {
    if (pathname === "/feed") {
      e.preventDefault();
      window.location.reload();
    }
  };

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

  const coreItems = [
    { path: "/feed", icon: AnimatedHome, label: "Home", section: "core", id: "home" },
    { path: "/my-products", isStatic: true, iconComponent: Package, label: "My Products", badge: "3", section: "core", id: "my-products" },
  ];

  const discoverItems = [
    { path: "/buildersmap", isStatic: true, iconComponent: Globe, label: "BuildersMap", badgeNew: "2 new", section: "discover", id: "buildersmap" },
    { path: "/launches", isStatic: true, iconComponent: Rocket, label: "Launches", section: "discover", id: "launches" },
    { path: "/momentum", isStatic: true, iconComponent: Activity, label: "Momentum Board", section: "discover", id: "momentum" },
  ];

  const communityItems = [
    {
      path: "/communities",
      icon: AnimatedCommunity?.src || AnimatedCommunity,
      label: "Community",
      staticIcon: staticCommuntiy?.src || staticCommuntiy,
      hasDot: true,
      section: "community",
      id: "community"
    },
    { path: "/leaderboard", icon: AnimatedLeaderboard, label: "Leaderboard", section: "community", id: "leaderboard" },
    { path: "/inbox", icon: AnimatedMessenger, label: "Inbox", section: "community", id: "inbox" },
  ];

  const allItems = [...coreItems, ...discoverItems, ...communityItems];

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

  const renderItem = (item) => (
    <Link
      href={item.path}
      key={item.id}
      onClick={(e) => {
        if (pathname === item.path) {
          e.preventDefault();
          window.location.reload();
        } else {
          setActiveTab(item.path);
        }
      }}
      style={{ textDecoration: "none" }}
    >
      <li
        className={isActive(item.path) ? style.setTab : ""}
        onMouseEnter={() => setHoveredIndex(item.id)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <div className={item.isStatic ? style.iconContainer : `${style.iconContainer} ${style.iconContainerAnimated}`}>
          {item.isStatic ? (
            <item.iconComponent size={20} strokeWidth={2} />
          ) : (
            <PlayOnce
              icon={item.icon}
              staticIcon={item.staticIcon}
              play={hoveredIndex === item.id}
              style={{ width: 24, height: 24 }}
            />
          )}
        </div>
        {!isMobile && (
          <div className={style.labelRow}>
            <span>{item.label}</span>
            {item.badge && <div className={style.badge}>{item.badge}</div>}
            {item.badgeNew && <div className={style.badgeNew}>{item.badgeNew}</div>}
            {item.hasDot && <div className={style.redDot}></div>}
          </div>
        )}
      </li>
    </Link>
  );

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className={style.sidebar}>
      {/* Logo at top of sidebar */}
      <div className={style.logoContainer}>
        <Link href="/feed" onClick={handleLogoClick}>
          <img
            className={style.logo}
            src={(effectiveTheme === "dark" ? navbarlogoDark.src || navbarlogoDark : navbarlogo.src || navbarlogo)}
            alt="NexFellow logo"
            onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
          />
        </Link>
      </div>

      <ul className={style.menuItems}>
        {!isMobile ? (
          <>
            <div className={style.sectionContainer}>
              <div className={style.sectionHeader}>CORE</div>
              {coreItems.map(renderItem)}
            </div>

            <div className={style.sectionContainer}>
              <div className={style.sectionHeader}>DISCOVER</div>
              {discoverItems.map(renderItem)}
            </div>

            <div className={style.sectionContainer}>
              <div className={style.sectionHeader}>COMMUNITY</div>
              {communityItems.map(renderItem)}
            </div>
          </>
        ) : (
          allItems.map(renderItem)
        )}
      </ul>

      {!isMobile && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column' }}>
          
          <Link href="/submit" className={style.ctaBanner}>
            <div className={style.ctaInner}>
              <span style={{ fontSize: '16px' }}>🚀</span>
              <span className={style.ctaText}>Submit your product</span>
            </div>
            <span className={style.ctaSub}>Get feedback in 24 hrs &gt;</span>
          </Link>

          <div className={style.divider} />

          <div
            className={style.userProfileRow}
            onClick={() => {
              setActiveTab("/profile");
              router.push(user?.username ? `/dashboard/${user.username}` : "#");
            }}
          >
            {user?.profilePhoto && !error ? (
              <img 
                src={user.profilePhoto} 
                alt="Avatar" 
                className={style.avatar} 
                onError={(e) => {
                  e.target.parentElement.innerHTML = `<div class="${style.initials}">${getInitials(user.name)}</div>` + e.target.parentElement.innerHTML.replace(e.target.outerHTML, '');
                }}
              />
            ) : (
              <div className={style.initials}>
                {getInitials(user?.name)}
              </div>
            )}
            <div className={style.userInfo}>
              <span className={style.userName}>{user?.name || "Rahul K."}</span>
              <span className={style.userSub}>{user?.occupation || (user?.professions?.[0]) || "Founder"} &middot; {user?.country || "Mumbai"}</span>
            </div>
          </div>

          <Link
            href="/settings"
            style={{ textDecoration: 'none' }}
            onClick={() => setActiveTab("/settings")}
          >
            <div
              className={style.amItems}
              style={{ margin: '0 14px 16px 14px' }}
              onMouseEnter={() => setHoveredIndex("settings")}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={style.iconContainer}>
                <Settings size={20} strokeWidth={2} />
              </div>
              <span style={{ marginLeft: "10px" }}>Settings</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
