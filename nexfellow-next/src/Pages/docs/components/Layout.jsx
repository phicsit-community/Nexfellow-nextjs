import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";
import { DocsContext } from "../context/DocsContext";

export default function Layout({ children }) {
  const [darkMode, setDarkMode] = useState(false); // Initialize safely
  const [collapsed, setCollapsed] = useState(false);

  // Initialize state on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDarkMode(localStorage.getItem("theme") === "dark");
      setCollapsed(window.innerWidth < 768);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pathname = usePathname();

  // Basic check for paths where sidebar might be hidden if needed, 
  // though Next.js usually handles layouts per route group.
  const HIDE_SIDEBAR_EXACT = ["/", "/login", "/register", "/onboarding", "/public/landing"];
  const hideSidebar = HIDE_SIDEBAR_EXACT.includes(pathname);
  const showSidebar = !hideSidebar;

  const containerClass = showSidebar ? "max-w-7xl mx-auto px-4" : "w-full";

  return (
    <DocsContext.Provider value={{ darkMode, setDarkMode, collapsed, setCollapsed }}>
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
            {children}
          </div>
        </main>
      </div>
    </DocsContext.Provider>
  );
}
