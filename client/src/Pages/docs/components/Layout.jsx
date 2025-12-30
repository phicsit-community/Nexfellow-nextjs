import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useLocation, useMatch } from "react-router-dom";

export default function Layout() {
  const [darkMode, setDarkMode] = useState(
    typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
  );
  const [collapsed, setCollapsed] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { pathname } = useLocation();
  const inAuth = useMatch("/auth/*");
  const inPreview = useMatch("/preview/*");
  const inEmbed = useMatch("/embed/*");

  const HIDE_SIDEBAR_EXACT = ["/", "/login", "/register", "/onboarding", "/public/landing"];
  const hideSidebar =
    HIDE_SIDEBAR_EXACT.includes(pathname) || !!inAuth || !!inPreview || !!inEmbed;

  const showSidebar = !hideSidebar;

  // Container width: full-bleed when sidebar is hidden
  const containerClass = showSidebar ? "max-w-7xl mx-auto px-4" : "w-full";

  return (
    <div
      className={`flex min-h-screen transition-all duration-300 ${darkMode ? "bg-black text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
    >
      {showSidebar && (
        <Sidebar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      )}

      <main
        className={`flex-1 min-h-screen w-full transition-all duration-300 ${showSidebar ? (collapsed ? "ml-[60px]" : "ml-[256px]") : "ml-0"
          } ${darkMode ? "bg-black text-gray-100" : "bg-white text-gray-900"}`}
      >
        <div className={containerClass}>
          <Outlet context={{ darkMode, setDarkMode }} />
        </div>
      </main>
    </div>
  );
}
