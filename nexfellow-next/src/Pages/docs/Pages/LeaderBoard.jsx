import React, { useState } from "react";
import { MdLeaderboard } from "react-icons/md";
import { FaExclamationCircle, FaFire, FaMoon, FaSun } from "react-icons/fa";
import { useDocsTheme } from "../context/DocsContext";
import MiniFooter from "../components/MiniFooter.jsx";
import { IoMdInformationCircle } from "react-icons/io";

const LeaderBoard = () => {
  const { darkMode, setDarkMode } = useDocsTheme();
  const [isDark, setIsDark] = useState(darkMode);
  const cyan = "#0E7C86";

  const toggleTheme = () => {
    setIsDark(!isDark);
    setDarkMode(!darkMode);
  };

  const leaderboardCriteria = [
    {
      percentage: "25%",
      title: "Increase Page Visits",
      description:
        "Promote your community widely so more people visit and explore.",
      icon: <FaFire size={20} color="red" />,
    },
    {
      percentage: "20%",
      title: "Invite & Retain New Members",
      description: "Grow by bringing in fresh members consistently.",
      icon: <FaFire size={20} color="red" />,
    },
    {
      percentage: "15%",
      title: "Encourage Active Discussions",
      description: "Keep members engaged through consistent interactions.",
      icon: <FaFire size={20} color="red" />,
    },
    {
      percentage: "10%",
      title: "Get More Likes",
      description: "Post high-quality content to earn appreciation.",
      icon: <FaFire size={20} color="red" />,
    },
    {
      percentage: "15%",
      title: "Join Contests",
      description: "Participate in ongoing contests to earn reputation points.",
      icon: <FaFire size={20} color="red" />,
    },
    {
      percentage: "10%",
      title: "Boost Link Engagement",
      description: "Share relevant links that people actually click on.",
      icon: <FaFire size={20} color="red" />,
    },
    {
      percentage: "5%",
      title: "Share Short Links",
      description: "Use short URLs to drive engagement on shared resources.",
      icon: <FaFire size={20} color="red" />,
    },
  ];

  return (
    <div
      className={`min-h-screen px-6 py-10 font-poppins transition-colors duration-500 ${isDark ? "bg-black text-gray-100" : "bg-white text-gray-900"
        }`}
    >
      <div className="max-w-5xl mx-auto text-left">
        {/* Breadcrumb & Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className={`text-sm ${darkMode ? "text-white" : "text-gray-800 "}`}>
              Docs &gt; Activity and Interaction &gt;{" "}
              <span className="font-medium text-[#1CA1A5]">
                Leaderboards
              </span>
            </p>
            <h1
              className={`text-3xl font-semibold mt-2 ${isDark ? "text-white" : "text-[#0E7C86]"
                } flex items-center gap-2`}
            >
              Leaderboard and reputations on NexFellow
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

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full"
            style={{ backgroundColor: cyan, color: "#000" }}
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <FaSun color="white" /> : <FaMoon color="white" />}
          </button>
        </div>

        {/* Intro Section */}
        <p
          className={`mt-6 leading-relaxed ${darkMode ? "text-[#D0CACA]" : "text-black"}`}
        >
          The Leaderboard highlights the most active and impactful members in
          the community, built on a fair and transparent Reputation system.
          Reputation is calculated from multiple factors such as page visits,
          member invites, discussions, likes, contest participation, and link
          engagement. Each factor carries its own weight, normalized and updated
          weekly to ensure fairness and balance across all contributors.
        </p>

        <h2
          className={`flex items-center justify-center gap-3 text-2xl font-semibold mt-10 mb-6 text-center ${isDark ? "text-[#1CA1A5]" : "text-[#000000]"
            }`}
        >
          <span className="flex-1 max-w-[140px] border-t border-gray-400"></span>
          How to top the Leaderboard
          <span className="flex-1 max-w-[140px] border-t border-gray-400"></span>
        </h2>



        {/* Leaderboard Criteria */}
        <div className="space-y-4">
          {leaderboardCriteria.map((item, index) => (
            <div
              key={index}
              className={`flex items-center rounded-lg overflow-hidden transition-transform hover:scale-[1.02] ${isDark
                  ? "bg-[#006C69] hover:bg-[#0E7C86]/40"
                  : "bg-[#006C69] hover:bg-[#0E7C86]"
                }`}
            >
              {/* Percentage Box */}
              <div
                className={`px-5 py-4 m-2 rounded-xl font-semibold text-center border ${isDark ? "text-[#006C69] bg-white" : "text-[#006C69] bg-white"
                  }`}
              >
                <span className="text-2xl font-bold">{item.percentage}</span>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 flex justify-between items-start">
                <div>
                  <h3
                    className={`font-semibold text-lg mb-1 ${isDark ? "text-white" : "text-white"
                      }`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-md text-white font-light">{item.description}</p>
                </div>
                {/* <span className="ml-3 text-red-500 text-xl">{item.icon}</span> */}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <section className="mt-10 mb-10">
          <p className="text-lg leading-relaxed">
            To view{" "}
            <span
              className="underline cursor-pointer hover:text-cyan-400"
              style={{ color: cyan }}
            >
              leaderboards
            </span>
            , click ok the leaderboard and look where you are standing at.
          </p>
        </section>
      </div>

      <MiniFooter />
    </div>
  );
};

export default LeaderBoard;
