import React, { useEffect, useState, useRef } from "react";
import {
  FaMoon,
  FaSun,
  FaClipboardList,
  FaBullhorn,
  FaEdit,
  FaSave,
  FaTimes,
  FaDownload,
} from "react-icons/fa";
import Step1Image from "../assets/broadcast1.png";
import Step2Image from "../assets/broadcast2.png";
import MiniFooter from "../components/MiniFooter.jsx";
import { useDocsTheme } from "../context/DocsContext";
import { IoMdInformationCircle } from "react-icons/io";
import { MdAccountCircle, MdOutlineAddPhotoAlternate } from "react-icons/md";
export default function BroadcastPage() {
  const { darkMode, setDarkMode } = useDocsTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const timelineRef = useRef(null);
  const cyan = "#0E7C86";

  const toggleTheme = () => setDarkMode(!darkMode);

  const steps = [
    {
      id: 1,
      title: "Step 1",
      desc: "Click on profile under account management",
      icon: <MdAccountCircle size={24} />,
      image: null,
    },
    {
      id: 2,
      title: "Step 2",
      desc: "Click on broadcast (Can only be done once you are verified) and select create broadcast",
      icon: <FaDownload />,
      image: null,
    },
    {
      id: 3,
      title: "Step 3",
      desc: "Choose type of target audience and fill the form",
      icon: <FaEdit />,
      image: Step1Image,
    },
    {
      id: 4,
      title: "Step 4",
      desc: "Broadcast now or save for later using drafts option. Click on drafts to view drafts",
      icon: <MdOutlineAddPhotoAlternate size={24} />,
      image: Step2Image,
    },
  ];

  // Scroll listener for timeline progress
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;

      const firstStep = document.getElementById("step-1");
      const lastStep = document.getElementById(`step-${steps.length}`);
      if (!firstStep || !lastStep) return;

      const firstCircleTop = firstStep.offsetTop + 24;
      const lastCircleTop = lastStep.offsetTop + 24;
      const scrollMiddle = window.scrollY + window.innerHeight / 2;

      let lineHeight = scrollMiddle - firstCircleTop;
      const maxHeight = lastCircleTop - firstCircleTop;
      lineHeight = Math.max(0, Math.min(lineHeight, maxHeight));

      timelineRef.current.style.setProperty(
        "--progress-height",
        `${(lineHeight / maxHeight) * 100}%`
      );

      let currentStep = 0;
      for (let i = 0; i < steps.length; i++) {
        const el = document.getElementById(`step-${i + 1}`);
        if (el) {
          const elTop = el.offsetTop + 24;
          if (scrollMiddle >= elTop) {
            currentStep = i;
          }
        }
      }
      setActiveStep(currentStep);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`${darkMode ? "bg-black text-gray-100" : "bg-white text-gray-900"
        } min-h-screen px-6 py-10 transition-colors duration-500 font-poppins`}
    >
      <div className="max-w-5xl mx-auto text-left">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className={`text-sm ${darkMode ? "text-white" : "text-gray-800 "}`}>
              Docs &gt; Setup &gt;{" "}
              <span className="font-medium text-[#1CA1A5]">
                Broadcast Setup
              </span>
            </p>
            <h1 className={`text-3xl font-semibold font-poppins mt-2 ${darkMode ? "text-white" : "text-[#0E7C86]"
              }`}>
              How to create a Broadcast on NexFellow?
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
            className="p-3 rounded-full bg-[#0E7C86] text-white hover:bg-[#0C6D75] transition"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <FaSun color="white" /> : <FaMoon color="white" />}
          </button>
        </div>

        {/* Intro */}
        <p className={`mt-4 leading-relaxed ${darkMode ? "text-[#D0CACA]" : "text-black"
          }`}>
          Broadcast is your way to instantly reach the entire community with important updates, announcements, or alerts. Whether it’s sharing new features, notifying about upcoming contests, or making a community-wide announcement, broadcasts ensure that every member stays informed. With one click, your message is delivered across the platform, making communication simple, direct, and effective.
        </p>

        {/* Timeline */}
        <div className="relative mt-10 text-left" ref={timelineRef}>
          {/* background line */}
          <div
            className={`absolute top-6 bottom-6 left-[1.5rem] w-0.5 ${darkMode ? "bg-gray-800" : "bg-[#D1EBEE]"
              }`}
            aria-hidden
          />
          {/* progress line */}
          <div
            className="absolute top-6 left-[1.5rem] w-0.5 bg-[#0E7C86] transition-all duration-500"
            style={{ height: "var(--progress-height, 0%)" }}
          />

          <div className="space-y-14">
            {steps.map((step, idx) => (
              <div
                id={`step-${idx + 1}`}
                key={step.id}
                className="flex items-start gap-6 relative"
              >
                {/* Step Icon Circle */}
                <div className="w-12 flex justify-center relative">
                  <div
                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-500 shadow ${idx <= activeStep
                      ? "bg-[#0E7C86] border-[#0E7C86] text-white"
                      : `${darkMode
                        ? "bg-black border-[#0E7C86] text-[#0E7C86]"
                        : "bg-white border-[#0E7C86] text-[#0E7C86]"
                      }`
                      }`}
                  >
                    {step.icon}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-semibold text-[#1CA1A5]">
                    {step.title}
                  </h3>
                  <p className="mt-2">{step.desc}</p>

                  {step.image && (
                    <img
                      src={step.image.src || step.image}
                      alt={`${step.title} screenshot`}
                      className="mt-4 w-full h-auto max-w-lg rounded-lg shadow-lg cursor-pointer transition transform hover:scale-105"
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
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold z-50"
            onClick={() => setZoomImage(null)}
          >
            <FaTimes />
          </button>
          <img
            src={zoomImage.src || zoomImage}
            alt="Zoomed"
            className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg transform scale-95 animate-scaleUp"
          />
        </div>
      )}

      <style>
        {`
          @keyframes scaleUp {
            0% { transform: scale(0.8); opacity: 0.7; }
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
