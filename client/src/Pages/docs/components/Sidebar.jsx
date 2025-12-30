import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaUserCog,
  FaCheckCircle,
  FaTrophy,
  FaTasks,
  FaBullhorn,
  FaCalendarAlt,
  FaUsers,
  FaEnvelope,
  FaComments,
  FaBookmark,
  FaChartLine,
  FaPen,
  FaMoon,
  FaSun,
  FaHome,
  FaUserEdit,
} from "react-icons/fa";

import logo from "../assets/logo1.png";
import logoIcon from "../assets/logo.png";

export default function Sidebar({
  darkMode,
  setDarkMode,
  collapsed,
  setCollapsed,
}) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  const toggleCollapse = () => setCollapsed(!collapsed);
  const toggleTheme = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setCollapsed]);

  const sections = [
    {
      title: "Overview",
      items: [{ path: "/overview", name: "Overview", icon: <FaHome /> }],
    },
    {
      title: "Setup",
      items: [
        { path: "/account", name: "Account Setup", icon: <FaUserCog /> },
        { path: "/verification", name: "Verification Setup", icon: <FaCheckCircle /> },
        { path: "/challenges", name: "Challenges Setup", icon: <FaTasks /> },
        { path: "/contestsetup", name: "Contest Setup", icon: <FaTrophy /> },
        { path: "/broadcast", name: "Broadcast Setup", icon: <FaBullhorn /> },
        { path: "/events", name: "Events Setup", icon: <FaCalendarAlt /> },
        { path: "/community", name: "Community Setup", icon: <FaUsers /> },
        { path: "/membersaccess", name: "Members and access", icon: <FaEnvelope /> },
      ],
    },
    {
      title: "Activity and Interactions",
      items: [
        { path: "/message", name: "Messages", icon: <FaComments /> },
        { path: "/post", name: "Create a post", icon: <FaPen /> },
        { path: "/bookmark", name: "Bookmarks", icon: <FaBookmark /> },
        { path: "/leaderboard", name: "Leaderboard and reputations", icon: <FaChartLine /> },
      ],
    },
    {
      title: "Explore and Communities",
      items: [
        { path: "/followCommunity", name: "Follow communities", icon: <FaUsers /> },
        { path: "/membersdiscussions", name: "Members and discussions", icon: <FaComments /> },
      ],
    },
    {
      title: "Account Management",
      items: [
        { path: "/editProfile", name: "Edit profile details", icon: <FaUserEdit /> },
        { path: "/accountSettings", name: "Account settings", icon: <FaUserCog /> },
      ],
    },
  ];

  const MenuSection = ({ title, items }) => (
    <div className="mt-4">
      {!collapsed ? (
        <h2
          className="text-white/90 text-xs font-semibold tracking-wider px-4 mb-2 uppercase"
          aria-label={title}
        >
          {title}
        </h2>
      ) : (
        <div className="mx-3 h-px bg-white/10" />
      )}
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.path} className="group relative">
            <NavLink
              to={item.path}
              end={false}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-white/30",
                  isActive
                    ? darkMode
                      ? "bg-white/5 text-[#1CA1A5]"
                      : "bg-[#0C6D75] text-white"
                    : darkMode
                      ? "text-[#D0CACA] hover:text-[#1CA1A5] hover:bg-white/5"
                      : "text-white hover:bg-[#0C6D75]",
                ].join(" ")
              }
              aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            >
              <span
                className={
                  darkMode ? "text-[#1CA1A5] text-lg shrink-0" : "text-white text-lg shrink-0"
                }
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </NavLink>

            {/* Tooltip when collapsed */}
            {collapsed && (
              <div
                className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 shadow z-50 whitespace-nowrap"
                role="tooltip"
              >
                {item.name}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <aside
      role="navigation"
      aria-label="Primary"
      className={[
        "fixed top-0 left-0 h-screen flex flex-col shadow-lg",
        "transition-all duration-300 z-50",
        darkMode ? "bg-[#111] text-white" : "bg-[#0E7C86] text-white",
        collapsed ? "w-16" : "w-64",
      ].join(" ")}
    >
      {/* hide native scrollbar but keep scrolling */}
      <style>{`
        .sidebar-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .sidebar-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center justify-center w-full">
          <img
            src={collapsed || isMobile ? logoIcon : logo}
            alt="NexFellow Logo"
            className={`transition-all duration-300 object-contain ${collapsed || isMobile ? "w-8" : "w-36"}`}
          />
        </div>

        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-md hover:bg-white/10 transition text-white ml-2"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        )}
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 flex flex-col min-h-0">
        <nav className="flex-1 overflow-y-auto sidebar-scroll px-2 py-4">
          {sections.map((s) => (
            <MenuSection key={s.title} title={s.title} items={s.items} />
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-white/10 flex items-center justify-between">
        {!collapsed && <p className="text-xs text-white/70">@nexfellow2025</p>}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
    </aside>
  );
}
