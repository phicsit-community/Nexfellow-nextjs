'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// styles
import style from "./Sidebar.module.css";

function Sidebar() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  const menuItems = [
    { path: "/", icon: "/assets/Sidebar/Home.svg", label: "Home" },
    { path: "/view-emails", icon: "/assets/Sidebar/Explore.svg", label: "View Emails" },
    { path: "/send-email", icon: "/assets/Sidebar/Contests.svg", label: "Send Emails" },
    { path: "/contact", icon: "/assets/Sidebar/Leaderboard.svg", label: "Contact" },
    { path: "/lists", icon: "/assets/Sidebar/Community.svg", label: "Lists" },
  ];

  const isActive = (path) => {
    return activeTab === path;
  };

  return (
    <div className={style.sidebar}>
      <ul className={style.menuItems}>
        {menuItems.map((item) => (
          <Link
            href={item.path}
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
        <p className={style.am}>ACCOUNT MANAGEMENT</p>
        <Link href="/help" onClick={() => setActiveTab("/help")}>
          <p>
            <img src="/assets/Sidebar/Help.svg" alt="Help" />
            <span>Help</span>
          </p>
        </Link>
        <Link href="/dashboard" onClick={() => setActiveTab("/profile")}>
          <p>
            <img src="/assets/Sidebar/Profile.svg" alt="Profile" />
            <span>Profile</span>
          </p>
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
