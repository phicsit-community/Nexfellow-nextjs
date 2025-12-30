import React, { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // State for sidebar collapse

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <nav className="bg-teal-800 font-poppins text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Hamburger Menu Icon */}
            <GiHamburgerMenu
              size={24}
              className="cursor-pointer md:hidden"
              onClick={toggleSidebar}
            />
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img
                src="/images/Frame_3.png"
                alt="Penguin Logo"
                className=""
                size="24"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <a
              href="/"
              className="hover:text-teal-200 transition-colors relative text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-400 after:transition-all after:duration-300 hover:after:w-full font-medium"
            >
              Home
            </a>
            <a
              href="/overview"
              className="hover:text-teal-200 transition-colors relative text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-400 after:transition-all after:duration-300 hover:after:w-full font-medium"
            >
              Overview
            </a>
            <a
              href="/leaderboard"
              className="hover:text-teal-200 transition-colors relative text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-400 after:transition-all after:duration-300 hover:after:w-full font-medium"
            >
              Analytics
            </a>
            <a
              href="/message"
              className="hover:text-teal-200 transition-colors relative text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-400 after:transition-all after:duration-300 hover:after:w-full font-medium"
            >
              Mission
            </a>
            <a
              href="/followcommunity"
              className="hover:text-teal-200 transition-colors relative text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-teal-400 after:transition-all after:duration-300 hover:after:w-full font-medium"
            >
              Blogs
            </a>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Sidebar
              darkMode={false}
              setDarkMode={() => {}}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              onClose={toggleSidebar}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
