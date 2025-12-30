import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";
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
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const userId = userData?.id;
        if (!userId) throw new Error("User ID is missing");
        const response = await axios.get(`/user/profile`);
        setUser(response.data);
      } catch (err) {
        setError("Failed to load user data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const menuItems = [
    { path: "/feed", icon: AnimatedHome, label: "Home" },
    { path: "/explore", icon: AnimatedExplore, label: "Explore" },
    { path: "/leaderboard", icon: AnimatedLeaderboard, label: "Leaderboard" },
    {
      path: "/communities",
      icon: AnimatedCommunity,
      label: "Communities",
      staticIcon: staticCommuntiy,
    },
    { path: "/inbox", icon: AnimatedMessenger, label: "Inbox" },
  ];

  const displayMenuItems = menuItems;

  const isActive = (path) => activeTab.startsWith(path);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.get("/user/logout", { withCredentials: true });
      if (response.status === 200) {
        localStorage.clear();
        navigate("/login");
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
            to={item.path}
            key={item.path}
            onClick={(e) => {
              if (location.pathname === item.path) {
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
            to={`/dashboard/${user?.username}`}
            onClick={() => setActiveTab("/profile")}
          >
            <p
              className={style.amItems}
              onMouseEnter={() => setHoveredIndex(5)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={style.iconContainer} style={{ marginLeft: "10px" }}>
                <PlayOnce
                  icon={AnimatedAccount}
                  play={hoveredIndex === 5}
                  style={{ width: 20, height: 20 }}
                />
              </div>
              <span>Profile</span>
            </p>
          </Link>

          <Link
            className={style.amLink}
            to={`/settings`}
            onClick={() => setActiveTab("/settings")}
          >
            <p
              className={style.amItems}
              onMouseEnter={() => setHoveredIndex(6)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={style.iconContainer} style={{ marginLeft: "10px" }}>
                <PlayOnce
                  icon={AnimatedSettings}
                  play={hoveredIndex === 6}
                  style={{ width: 20, height: 20 }}
                />
              </div>
              <span>Settings</span>
            </p>
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
