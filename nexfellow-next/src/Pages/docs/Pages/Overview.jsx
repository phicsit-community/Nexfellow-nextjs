import React from "react";
import {
  FaHome,
  FaCompass,
  FaTrophy,
  FaUsers,
  FaUserCircle,
  FaTasks,
  FaCalendarAlt,
  FaBroadcastTower,
  FaCog,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import MiniFooter from "../components/MiniFooter.jsx";
import { useOutletContext } from "react-router-dom";
import { IoMdInformationCircle } from "react-icons/io";

export default function Overview() {
  const { darkMode, setDarkMode } = useOutletContext();
  const cyan = "#0E7C86";

  const toggleTheme = () => setDarkMode(!darkMode);

  const features = [
    {
      id: 1,
      title: "Home",
      desc: "Personalized dashboard with updates that get quick and easy access.",
      icon: <FaHome />,
    },
    {
      id: 2,
      title: "Explore",
      desc: "Discover communities and network across trading, technology, and business.",
      icon: <FaCompass />,
    },
    {
      id: 3,
      title: "Leaderboard",
      desc: "Track top contributors and members ranked by activity and engagement.",
      icon: <FaTrophy />,
    },
    {
      id: 4,
      title: "Communities",
      desc: "Join or create communities to collaborate, share knowledge.",
      icon: <FaUsers />,
    },
    {
      id: 5,
      title: "Profile",
      desc: "Manage your identity, posts, timelines, and bookmarks which includes verification.",
      icon: <FaUserCircle />,
    },
    {
      id: 6,
      title: "Challenges & Contests",
      desc: "Participate in weekly, monthly, and special challenges with leaderboards and rewards.",
      icon: <FaTasks />,
    },
    {
      id: 7,
      title: "Events",
      desc: "Create, manage, and attend events (posting, joining & ongoing).",
      icon: <FaCalendarAlt />,
    },
    {
      id: 8,
      title: "Broadcast",
      desc: "Send targeted communications to communities or event participants.",
      icon: <FaBroadcastTower />,
    },
    {
      id: 9,
      title: "Settings",
      desc: "Manage account preferences, privacy, and configurations.",
      icon: <FaCog />,
    },
  ];

  return (
    <div
      className={`${darkMode ? "bg-black text-gray-100" : "bg-white text-gray-900"
        } min-h-screen px-6 py-10 transition-colors font-poppins duration-500`}
    >
      <div className="max-w-5xl mx-auto text-left">
        {/* Header and Theme Toggle */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">
              Docs &gt;{" "}
              <span className="font-medium" style={{ color: "#1CA1A6" }}>
                Overview
              </span>
            </p>
            <h1
              className={`text-3xl font-bold mt-2 ${darkMode ? "text-white" : "text-[#0E7C86]"
                }`}
            >
              What is NexFellow?
            </h1>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <span
                className={`${darkMode
                  ? "bg-[#006C6980]/20 text-white"
                  : "bg-[#1C5C5C] text-white"
                  } px-2 py-1 rounded-md font-light flex items-center gap-2`}
              >
                <IoMdInformationCircle size={24} className="text-[#1CA1A5]" />
                Last updated on 14 Sep 2025
              </span>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full transition duration-300"
            style={{ backgroundColor: cyan, color: "#000" }}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <FaSun color="white" /> : <FaMoon color="white" />}
          </button>
        </div>

        {/* Intro text */}
        <p
          className={`mt-4 leading-relaxed ${darkMode ? "text-[#D0CACA]" : "text-black"
            }`}
        >
          NexFellow is a professional networking and community–building platform
          designed to help individuals and organizations connect, collaborate,
          and grow. Unlike traditional social apps, it combines communities,
          events, challenges, broadcasts, and analytics to create a structured
          space for meaningful engagement.
        </p>

        {/* Section heading */}
        <h2
          className={`text-2xl font-semibold mt-10 mb-6 ${darkMode ? "text-[#1CA1A6]" : "text-[#0E7C86]"
            }`}
        >
          What do we offer?
        </h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => (
            <div
              key={item.id}
              className={`group flex flex-col items-start gap-3 p-6 rounded-2xl shadow-md transform transition duration-300 hover:scale-105 border ${darkMode
                  ? "bg-[#111] border-[#0E7C86]/20 hover:bg-[#0E7C86] hover:text-white"
                  : "bg-white border-[#D1EBEE] hover:bg-[#0E7C86] hover:text-white"
                }`}
            >
              <div
                className={`text-2xl transition duration-300 ${darkMode
                    ? "text-[#0E7C86] group-hover:text-white"
                    : "text-[#0E7C86] group-hover:text-white"
                  }`}
              >
                {item.icon}
              </div>
              <h3
                className={`text-lg font-semibold transition duration-300 ${darkMode
                    ? "text-white group-hover:text-white"
                    : "text-[#0E7C86] group-hover:text-white"
                  }`}
              >
                {item.title}
              </h3>
              <p
                className={`text-sm leading-relaxed transition duration-300 ${darkMode
                    ? "text-gray-300 group-hover:text-white"
                    : "text-gray-700 group-hover:text-white"
                  }`}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <MiniFooter />
    </div>
  );
}
