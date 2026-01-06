import React, { useRef } from "react";
import { useDocsTheme } from "../context/DocsContext";
import { IoMdInformationCircle } from "react-icons/io";
import {
  FaMoon,
  FaSun,
  FaUserPlus,
  FaComments,
  FaInbox,
  FaPlusCircle,
  FaCheckCircle,
  FaDownload,
  FaEdit,
} from "react-icons/fa";
import { motion, useScroll, useSpring } from "framer-motion";
import MiniFooter from "../components/MiniFooter.jsx";

import step2Img from "../assets/chat_step2.png";
import step3Img from "../assets/chat_step3.png";
import { MdAccountCircle } from "react-icons/md";

const ACCENT = "#0E7C86";

export default function MessageGuide() {
  const { darkMode, setDarkMode } = useDocsTheme();
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
  const softText = darkMode ? "text-gray-300" : "text-gray-600";

  const features = [
    {
      id: 1,
      title: "Connect with People",
      desc: "Search members by their IDs and start meaningful conversations with like-minded people.",
      icon: <FaUserPlus />,
    },
    {
      id: 2,
      title: "Controlled Messaging",
      desc: "Approve or filter texts before engaging, ensuring safe and relevant communication.",
      icon: <FaComments />,
    },
  ];

  const steps = [
    {
      id: 1,
      title: "Click on profile under account management.",
      icon: <MdAccountCircle size={24} />,
    },
    {
      id: 2,
      title:
        "Add new connections by clicking on + and search by username or name.",
      icon: <FaDownload size={24} />,
      img: step2Img,
    },
    {
      id: 3,
      title: "When approved from other end you can continue chatting.",
      icon: <FaEdit size={24} />,
      img: step3Img,
    },
  ];

  return (
    <div
      className={`${baseBg} font-poppins min-h-screen px-6 py-10 transition-colors duration-500`}
    >
      <div className="max-w-5xl mx-auto text-left">
        {/* Header + Theme toggle */}
        <div className="flex justify-between items-center">
          <div>
            <p className={`text-sm ${darkMode ? "text-white" : "text-gray-800 "}`}>
              Docs &gt; Activity and Interaction &gt;{" "}
              <span className="font-medium text-[#1CA1A5]">
                Chat
              </span>
            </p>
            <h1
              className={`text-3xl font-semibold mt-2 ${darkMode ? "text-white" : "text-[#0E7C86]"
                }`}
            >
              How to network on NexFellow?
            </h1>

            {/* Last updated (same as Overview style) */}
            <div className="flex items-center mt-2 text-sm">
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

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-[#0E7C86] text-white hover:bg-[#0C6D75] transition"
          >
            {darkMode ? <FaSun color="white" /> : <FaMoon color="white" />}
          </button>
        </div>

        {/* Intro */}
        <p className={`mt-4 leading-relaxed  ${darkMode ? "text-[#D0CACA]" : "text-black"} `}>
          The inbox is your central hub for all conversations, letting you
          manage messages, connect with people, and keep track of ongoing
          discussions in one place.
        </p>

        {/* Feature Cards (UNCHANGED) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {features.map((item) => (
            <div
              key={item.id}
              className={`group flex flex-col items-start gap-3 p-6 rounded-2xl shadow-md transform transition hover:scale-105 border ${darkMode
                ? "bg-[#006C69] border-gray-700 hover:bg-[#0E7C86] hover:text-white"
                : "bg-[#006C69] border-gray-200 text-white hover:bg-[#0C6D75]"
                }`}
            >
              {/* <div
                className={`text-2xl transition-colors ${
                  darkMode
                    ? "text-[#0E7C86] group-hover:text-white"
                    : "text-white group-hover:text-white"
                }`}
              >
                {item.icon}
              </div> */}
              <h3 className="text-lg text-center w-full font-semibold">{item.title}</h3>
              <p className="text-md text-center leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Timeline Steps */}
        <div ref={timelineRef} className="mt-12 relative pb-28">
          {/* Background line (light gray) */}
          <div
            className="absolute left-[22px] top-2 bottom-2 w-[3px] rounded-full"
            style={{
              backgroundColor: darkMode
                ? "rgba(255,255,255,0.15)"
                : "rgba(0,0,0,0.12)",
            }}
          />
          {/* Progress line */}
          <motion.div
            className="absolute left-[22px] top-2 bottom-2 w-[3px] rounded-full origin-top"
            style={{ background: ACCENT, scaleY }}
          />

          {steps.map((step) => (
            <div key={step.id} className="relative flex items-start gap-4 mt-8">
              <div
                className="h-11 w-11 flex items-center justify-center rounded-full shrink-0 relative z-10"
                style={{ background: ACCENT, color: "#fff" }}
              >
                {step.icon}
              </div>
              <div className="w-full">
                {/* Step number and title now cyan always */}
                <p
                  className="font-semibold text-xl text-[#1CA1A5]"
                >
                  Step {step.id}
                </p>
                <p className={`mt-1 ${darkMode ? "text-[#D0CACA]" : "text-black"}`}>{step.title}</p>
                {step.img && (
                  <img
                    src={step.img.src || step.img}
                    alt={`Step ${step.id}`}
                    className="mt-4 rounded-lg border shadow-md max-w-lg"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <MiniFooter />
    </div>
  );
}
