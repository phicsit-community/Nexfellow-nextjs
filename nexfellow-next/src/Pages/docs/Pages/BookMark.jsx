import React, { useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { FaMoon, FaSun, FaSearch, FaBookmark, FaFilter, FaDownload, FaEdit } from "react-icons/fa";
import { motion, useScroll, useSpring } from "framer-motion";
import MiniFooter from "../components/MiniFooter.jsx";
import { IoMdInformationCircle } from "react-icons/io";
import step2Shot from "../assets/bookmark_img1.png";
import step3Shot from "../assets/Bookmark_img2.png";
import { MdAccountCircle } from "react-icons/md";

const ACCENT = "#0E7C86";

export default function BookMark() {
  const { darkMode, setDarkMode } = useOutletContext();
  const toggleTheme = () => setDarkMode((v) => !v);

  const timelineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.9", "end 1"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const baseBg = darkMode ? "bg-black text-gray-100" : "bg-white text-gray-900";
  const panelBg = darkMode ? "bg-[#111]" : "bg-gray-50";
  const panelBorder = darkMode ? "border-gray-700" : "border-gray-200";
  const softText = darkMode ? "text-gray-300" : "text-gray-700";

  const highlights = [
    {
      id: 1,
      title: "Search Anytime",
      desc: "Use the built-in search to instantly locate saved content whenever you need it.",
      icon: <FaSearch />,
    },
    {
      id: 2,
      title: "Save with Ease",
      desc: "Quickly bookmark posts, contests, or entire communities for later reference.",
      icon: <FaBookmark />,
    },
    {
      id: 3,
      title: "Smart Filters",
      desc: "Organize your bookmarks using filters and categories to find what matters faster.",
      icon: <FaFilter />,
    },
  ];

  return (
    <div
      className={`${baseBg} min-h-screen px-6 py-10 transition-colors duration-500 font-poppins`}
    >
      <div className="max-w-5xl mx-auto text-left">
        {/* Header + Theme Toggle */}
        <div className="flex justify-between items-center">
          <div>
            <p className={`text-sm ${darkMode ? "text-white" : "text-gray-800 "}`}>
              Docs &gt; Activity and Interaction &gt;{" "}
              <span className="font-medium text-[#1CA1A5]">
                Bookmarks
              </span>
            </p>
            <h1
              className={`text-3xl font-semibold mt-2 ${
                darkMode ? "text-white" : "text-[#0E7C86]"
              }`}
            >
              How to bookmark a Post on NexFellow?
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

          <button
            onClick={toggleTheme}
            className="p-3 rounded-full"
            style={{ backgroundColor: ACCENT, color: "#000" }}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <FaSun color="white" /> : <FaMoon color="white" />}
          </button>
        </div>

        {/* Intro */}
        <p
          className={`mt-6 leading-relaxed ${darkMode ? "text-[#D0CACA]" : "text-black"}`}
        >
          Bookmarks make it easy to save important posts, discussions, or announcements so you can revisit 
          them anytime. Instead of losing track in the feed, you can organize and access bookmarked content 
          in one place, helping you stay updated, review useful insights, or catch up on information at your 
          convenience.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col items-start gap-3 p-6 rounded-2xl shadow-md transform transition hover:scale-105 ${
                darkMode
                  ? "bg-[#006C69] text-white hover:bg-[#0E7C86]"
                  : "bg-[#006C69] text-white hover:bg-[#0C6D75]"
              }`}
            >
              {/* <div className="text-2xl">{item.icon}</div> */}
              <h3 className="text-lg text-center w-full font-semibold">{item.title}</h3>
              <p className="text-md text-center font-regular leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div ref={timelineRef} className="relative mt-8 pb-28">
          {/* Timeline Lines */}
          <div
            className="absolute left-[22px] top-2 bottom-2 w-[3px] rounded-full"
            style={{
              backgroundColor: darkMode
                ? "rgba(255,255,255,0.15)"
                : "rgba(0,0,0,0.12)",
            }}
          />
          <motion.div
            className="absolute left-[22px] top-2 bottom-2 w-[3px] rounded-full origin-top"
            style={{ background: ACCENT, scaleY }}
          />

          {/* Step 1 */}
          <div className="relative flex items-start gap-4">
            <div
              className="h-12 w-12 flex items-center justify-center rounded-full shrink-0 relative z-10 text-white text-xl font-semibold"
              style={{ background: ACCENT }}
            >
              <MdAccountCircle size={24} />
            </div>
            <div>
              <p className="font-semibold text-xl text-[#1CA1A5]">Step 1</p>
              <p className={`mt-2 ${darkMode ? "text-[#D0CACA]" : "text-black"}`}>
                Bookmark the post by clicking on bookmark icon.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative flex items-start gap-4 mt-10">
            <div
              className="h-12 w-12 flex items-center justify-center rounded-full shrink-0 relative z-10 text-white text-xl font-semibold"
              style={{ background: ACCENT }}
            >
              <FaDownload size={24} />
            </div>
            <div className="w-full">
              <p className="font-semibold text-xl text-[#1CA1A5]">Step 2</p>
              <p className={`mt-2 ${darkMode ? "text-[#D0CACA]" : "text-black"}`}>
                Next Click on profile under account management and click on bookmarks.
              </p>
              <figure
                className={`mt-4 rounded-2xl border ${panelBorder} ${panelBg} overflow-hidden`}
              >
                <img
                  src={step2Shot}
                  alt="Step 2 — Profile > Bookmarks"
                  loading="lazy"
                  className="w-full h-auto block"
                  draggable="false"
                />
              </figure>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative flex items-start gap-4 mt-10">
            <div
              className="h-12 w-12 flex items-center justify-center rounded-full shrink-0 relative z-10 text-white text-xl font-semibold"
              style={{ background: ACCENT }}
            >
              <FaEdit size={24} />
            </div>
            <div className="w-full">
              <p className="font-semibold text-xl text-[#1CA1A5]">Step 3</p>
              <p className={`mt-2 ${darkMode ? "text-[#D0CACA]" : "text-black"}`}>
                Now you can easily look in your bookmarked things (post,contest or a challenge).
              </p>
              <figure
                className={`mt-4 rounded-2xl border ${panelBorder} ${panelBg} overflow-hidden`}
              >
                <img
                  src={step3Shot}
                  alt="Step 3 — Saved items view"
                  loading="lazy"
                  className="w-full h-auto block"
                  draggable="false"
                />
              </figure>
            </div>
          </div>
        </div>
      </div>

      <MiniFooter />
    </div>
  );
}
