import React, { useEffect, useState, useRef } from "react";
import { FaUsers, FaLink, FaShareAlt, FaMoon, FaSun, FaTimes, FaDownload, FaEdit } from "react-icons/fa";
import MiniFooter from "../components/MiniFooter";
import { useOutletContext } from "react-router-dom";
import { IoMdAddCircleOutline, IoMdInformationCircle } from "react-icons/io";
import { MdAccountCircle, MdOutlineAddPhotoAlternate } from "react-icons/md";

export default function Post() {
  const { darkMode, setDarkMode } = useOutletContext();
  const [activeStep, setActiveStep] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const timelineRef = useRef(null);
  const cyan = "#0E7C86";

  const toggleTheme = () => setDarkMode((x) => !x);

  const steps = [
    {
      id: 1,
      title: "Step 1",
      desc: "Click on Profile under Account Management.",
      image: null,
      icon: <MdAccountCircle size={24} />,
    },
    {
      id: 2,
      title: "Step 2",
      desc: "Select share a post.",
      image: "/images/post1.png",
      icon: <FaDownload size={24} />,
    },
    {
      id: 3,
      title: "Step 3",
      desc: "Choose appropriate channel and create a post with required attachments. ",
      image: "/images/post2.png",
      icon: <FaEdit size={24} />,
    },
    {
      id: 4,
      title: "Step 4",
      desc: "You can either post it as a draft it for later or post it.",
      image: null,
      icon: <MdOutlineAddPhotoAlternate size={24} />,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;

      const firstStep = document.getElementById("step-1");
      const lastStep = document.getElementById(`step-${steps.length}`);
      if (!firstStep || !lastStep) return;

      const firstTop = firstStep.offsetTop + 24;
      const lastTop = lastStep.offsetTop + 24;
      const scrollMid = window.scrollY + window.innerHeight / 2;

      let lineHeight = scrollMid - firstTop;
      const maxHeight = lastTop - firstTop;
      lineHeight = Math.max(0, Math.min(lineHeight, maxHeight));

      timelineRef.current.style.setProperty(
        "--progress-height",
        `${(lineHeight / maxHeight) * 100}%`
      );

      let current = 0;
      for (let i = 0; i < steps.length; i++) {
        const el = document.getElementById(`step-${i + 1}`);
        if (el) {
          const top = el.offsetTop + 24;
          if (scrollMid >= top) current = i;
        }
      }
      setActiveStep(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`${
        darkMode ? "bg-black text-gray-100" : "bg-white text-gray-900"
      } min-h-screen px-6 py-10 font-poppins transition-colors duration-500`}
    >
      <div className="max-w-5xl mx-auto text-left">
        <div className="flex justify-between items-center">
          <div>
            <p className={`text-sm ${darkMode ? "text-white" : "text-gray-800 "}`}>
              Docs &gt; Activity and Interaction &gt;{" "}
              <span className="font-medium text-[#1CA1A5]">
                Post
              </span>
            </p>
            <h1
              className={`text-3xl font-semibold mt-2 ${
                darkMode ? "text-white" : "text-[#0E7C86]"
              }`}
            >
              How to create a post on NexFellow?
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
            style={{ backgroundColor: cyan, color: "#000" }}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <FaSun color="white" /> : <FaMoon color="white" />}
          </button>
        </div>

        <p
          className={`mt-4 leading-relaxed ${darkMode ? "text-[#D0CACA]" : "text-black"}`}
        >
Creating a post allows you to share your thoughts, updates, or announcements directly with your community. You can add text, links, or media to make your post engaging, and even tag relevant topics or members to spark meaningful conversations. Posts help you keep your audience informed, encourage participation, and build stronger connections within the platform.        </p>


        <div className="relative mt-8" ref={timelineRef}>
          <div
            className={`absolute top-0 bottom-0 left-6 w-0.5 ${
              darkMode ? "bg-gray-800" : "bg-[#D1EBEE]"
            }`}
          />
          <div
            className="absolute top-0 left-6 w-0.5 transition-all duration-500"
            style={{
              height: "calc(var(--progress-height, 0%) - 24px)",
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
                <div className="w-12 flex justify-center relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 text-xl font-semibold transition-colors duration-500 ${
                      idx <= activeStep
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

                <div className="flex-1">
                  <p className="font-semibold text-xl" style={{ color: "#1CA1A5" }}>
                    {step.title}
                  </p>
                  <p className="mt-2 leading-relaxed">{step.desc}</p>
                  {step.image && (
                    <img
                      src={step.image}
                      alt={`${step.title} screenshot`}
                      className="mt-4 w-full h-auto max-w-md rounded-lg shadow-md cursor-pointer transition transform hover:scale-105"
                      onClick={() => setZoomImage(step.image)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold"
            onClick={() => setZoomImage(null)}
            aria-label="Close zoom"
          >
            <FaTimes />
          </button>
          <img
            src={zoomImage}
            alt="Zoomed"
            className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg transform scale-95 animate-scaleUp"
          />
        </div>
      )}

      <style>
        {`
          @keyframes scaleUp {
            0% { transform: scale(0.8); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-scaleUp {
            animation: scaleUp 0.3s ease-out forwards;
          }
        `}
      </style>

      <MiniFooter />
    </div>
  );
}
