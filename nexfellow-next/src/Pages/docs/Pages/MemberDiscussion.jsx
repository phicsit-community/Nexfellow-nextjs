import React, { useEffect, useState, useRef } from "react";
import {
  FaMoon,
  FaSun,
  FaUsers,
  FaComments,
  FaCalendarAlt,
  FaListAlt,
  FaBullhorn,
  FaMedal,
  FaEllipsisH,
  FaDownload,
} from "react-icons/fa";
import { useDocsTheme } from "../context/DocsContext";
import MiniFooter from "../components/MiniFooter.jsx";
import { IoMdInformationCircle } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
export default function MembersFeedPage() {
  const [activeStep, setActiveStep] = useState(0);
  const { darkMode, setDarkMode } = useDocsTheme();
  const timelineRef = useRef(null);
  const cyan = "#0E7C86";

  const toggleTheme = () => setDarkMode(!darkMode);

  const steps = [
    {
      id: 1,
      icon: <MdAccountCircle size={24} />,
      title: "Step 1",
      desc: "Click on communities.",
    },
    {
      id: 2,
      icon: <FaDownload size={24} />,
      title: "Step 2",
      desc: "Click on community that from which you’ve followed to engage in activities.",
    },
  ];

  const activities = [
    { id: 1, icon: <FaListAlt />, label: "Feed" },
    { id: 2, icon: <FaUsers />, label: "People" },
    { id: 3, icon: <FaComments />, label: "Discuss" },
    { id: 4, icon: <FaCalendarAlt />, label: "Events" },
  ];

  const activities2 = [
    { id: 5, icon: <FaBullhorn />, label: "Challenges" },
    { id: 6, icon: <FaMedal />, label: "Contest" },
    { id: 7, icon: <FaEllipsisH />, label: "Others" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;

      const stepsEls = steps.map((_, i) =>
        document.getElementById(`step-${i + 1}`)
      );
      const first = stepsEls[0];
      const last = stepsEls[stepsEls.length - 1];
      if (!first || !last) return;

      const start = first.offsetTop + 24;
      const end = last.offsetTop + 24;
      const scrollMid = window.scrollY + window.innerHeight / 2;

      const maxHeight = end - start;
      const height = Math.min(Math.max(scrollMid - start, 0), maxHeight);

      timelineRef.current.style.setProperty(
        "--progress-height",
        `${(height / maxHeight) * 100}%`
      );

      let current = 0;
      stepsEls.forEach((el, i) => {
        if (scrollMid >= el.offsetTop - 200) current = i;
      });
      setActiveStep(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`${darkMode ? "bg-black text-gray-100" : "bg-white text-gray-900"
        } min-h-screen font-poppins px-6 py-10 transition-colors duration-500`}
    >
      <div className="max-w-5xl mx-auto text-left">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <p className={`text-sm ${darkMode ? "text-white" : "text-gray-800 "}`}>
              Docs &gt; Explore Communities &gt;{" "}
              <span className="font-medium text-[#1CA1A5]">
                Community
              </span>
            </p>
            <h1
              className={`text-3xl font-semibold mt-2 ${darkMode ? "text-white" : "text-[#0E7C86]"
                }`}
            >
              Members and Feed on NexFellow?
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
            {darkMode ? <FaSun color="white" /> : <FaMoon color="white" />}
          </button>
        </div>

        {/* Intro */}
        <p
          className={`mt-6 leading-relaxed ${darkMode ? "text-[#D0CACA]" : "text-black"
            }`}
        >
          The Members and Feed section is where community interaction truly comes alive. Members can discover and
          connect with like-minded individuals, explore their profiles, and engage in meaningful conversations. At
          the same time, the feed serves as a dynamic space for posts, updates, and discussions, keeping everyone
          informed and involved.
        </p>



        <div className="relative mt-8" ref={timelineRef}>
          {/* Static Line */}
          <div
            className={`absolute top-0 bottom-0 left-6 w-0.5 ${darkMode ? "bg-gray-800" : "bg-[#D1EBEE]"
              }`}
          />
          {/* Progress Line */}
          <div
            className="absolute top-0 left-6 w-0.5 transition-all duration-500"
            style={{
              height: "var(--progress-height, 0%)",
              backgroundColor: cyan,
            }}
          />

          <div className="space-y-14">
            {steps.map((step, idx) => (
              <div
                id={`step-${idx + 1}`}
                key={step.id}
                className="flex items-start gap-6"
              >
                {/* Step Icon */}
                <div className="w-12 flex justify-center relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 font-semibold transition-colors duration-500 text-xl ${idx <= activeStep
                      ? "text-white"
                      : darkMode
                        ? "bg-black text-[#0E7C86]"
                        : "bg-white text-[#0E7C86]"
                      }`}
                    style={{
                      backgroundColor:
                        idx <= activeStep ? cyan : "transparent",
                      borderColor: cyan,
                    }}
                  >
                    {step.icon}
                  </div>
                </div>

                {/* Step Text */}
                <div className="flex-1">
                  {/* Step title — always cyan */}
                  <h3 className="text-xl font-semibold" style={{ color: "#1CA1A5" }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activities Section */}
        <h2
          className={`text-3xl font-semibold mt-12 mb-6 ${darkMode ? "text-white" : "text-[#0E7C86]"
            }`}
        >
          Activities
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {activities.map((act) => (
            <div
              key={act.id}
              className={`flex flex-col items-center justify-center gap-2 py-6 rounded-2xl shadow-md transition transform hover:scale-105 ${darkMode
                ? "bg-[#006C69] text-white hover:bg-[#0E7C86]/30"
                : "bg-[#006C69] text-white hover:bg-[#0E7C86]"
                }`}
            >
              <div className="text-4xl">{act.icon}</div>
              <p className="text-xl font-semibold">{act.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 px-0 sm:grid-cols-3 px-0 md:grid-cols-3 md:px-24 gap-4">
          {activities2.map((act) => (
            <div
              key={act.id}
              className={`flex flex-col items-center justify-center gap-2 py-6 rounded-2xl shadow-md transition transform hover:scale-105 ${darkMode
                ? "bg-[#006C69] text-white hover:bg-[#0E7C86]/30"
                : "bg-[#006C69] text-white hover:bg-[#0E7C86]"
                }`}
            >
              <div className="text-4xl">{act.icon}</div>
              <p className="text-xl font-semibold">{act.label}</p>
            </div>
          ))}
        </div>
      </div>

      <MiniFooter />
    </div>
  );
}
