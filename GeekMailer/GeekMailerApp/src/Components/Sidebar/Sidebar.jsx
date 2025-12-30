import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

// styles
import style from "./Sidebar.module.css";

// assets
import Home from "./assets/Home.svg";
import Explore from "./assets/Explore.svg";
import Contest from "./assets/Contests.svg";
import LeaderBoard from "./assets/Leaderboard.svg";
import Community from "./assets/Community.svg";
import Help from "./assets/Help.svg";
import Profile from "./assets/Profile.svg";

function Sidebar() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const menuItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/view-emails", icon: Explore, label: "View Emails" },
    { path: "/send-email", icon: Contest, label: "Send Emails" },
    { path: "/contact", icon: LeaderBoard, label: "Contact" },
    { path: "/lists", icon: Community, label: "List" },
  ];

  const isActive = (path) => {
    return activeTab === path; // Exact match for active tab
  };

  return (
    <div className={style.sidebar}>
      <ul className={style.menuItems}>
        {menuItems.map((item) => (
          <Link
            to={item.path}
            key={item.path}
            onClick={() => setActiveTab(item.path)}
          >
            <li className={isActive(item.path) ? `${style.setTab}` : ""}>
              <img src={item.icon} alt={item.label} />
              <span>{item.label}</span>
            </li>
          </Link>
        ))}
      </ul>

      <div className={style.accountManagement}>
        <p className={style.am}>Account Management</p>
        <Link to="/help" onClick={() => setActiveTab("/help")}>
          <p>
            <img src={Help} alt="Help" />
            <span>Help</span>
          </p>
        </Link>
        <Link to="/dashboard" onClick={() => setActiveTab("/profile")}>
          <p>
            <img src={Profile} alt="Profile" />
            <span>Profile</span>
          </p>
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
