import React, { useRef, useState, useEffect } from "react";
import {
  FaCompass,
  FaTimes,
  FaMoon,
  FaSun,
  FaEdit,
  FaArrowCircleDown,
  FaDownload,
} from "react-icons/fa";
import MiniFooter from "../components/MiniFooter.jsx";
import { useOutletContext } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { IoMdInformationCircle } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";

const ACCENT = "#0E7C86";

const steps = [
  {
    id: 1,
    title: "Step 1",
    desc: "Click on settings under account management. ",
    image: null,
    icon: <MdAccountCircle size={24} />,
  },
  {
    id: 2,
    title: "Step 2",
    desc: "You can change settings based on your needs by navigating to requirements. ",
    image: null,
    icon: <FaDownload size={24} />,
  },
  {
    id: 3,
    title: "Step 3",
    desc: "Various settings are provided for secure and safe NexFellow platform.",
    image: "images/editAccount2.png",
    icon: <FaEdit size={24} />,
  },
];

export default function EditAccount() {
  const [activeStep, setActiveStep] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const { darkMode, setDarkMode } = useOutletContext();
  const timelineRef = useRef(null);
  const [hasProgress, setHasProgress] = useState(false);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  // framer-motion scroll progress (for smooth progress line animation)
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.9", "end 1"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  // keep hasProgress and activeStep in sync with scrolling
  useEffect(() => {
    const unsub = scrollYProgress.onChange((v) => {
      // small threshold so line appears only when user scrolls into timeline
      setHasProgress(v > 0.01);
    });

    const handleScrollForStep = () => {
      if (!timelineRef.current) return;
      const scrollMiddle = window.scrollY + window.innerHeight / 2;

      let currentStep = 0;
      for (let i = 0; i < steps.length; i++) {
        const el = document.getElementById(`step-${i + 1}`);
        if (el) {
          const elTop = el.offsetTop + 24;
          if (scrollMiddle >= elTop) currentStep = i;
        }
      }
      setActiveStep(currentStep);
    };

    // ensure initial computation and update on scroll/resize
    handleScrollForStep();
    window.addEventListener("scroll", handleScrollForStep, { passive: true });
    window.addEventListener("resize", handleScrollForStep);

    return () => {
      unsub();
      window.removeEventListener("scroll", handleScrollForStep);
      window.removeEventListener("resize", handleScrollForStep);
    };
  }, [scrollYProgress]);

  const baseBg = darkMode ? "bg-black text-gray-100" : "bg-white text-gray-900";

  return (
    <div className={`${baseBg} font-poppins min-h-screen px-6 py-10 transition-colors duration-500 font-poppins`}>
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-start gap-6">
          <div>
            <p className={`text-sm ${darkMode ? "text-white" : "text-gray-800 "}`}>
              Docs &gt; Account Management &gt;{" "}
              <span className="font-medium text-[#1CA1A5]">
                Account Settings
              </span>
            </p>
            <h1 className={`text-3xl font-semibold mt-2 ${darkMode ? "text-white" : "text-[#0E7C86]"} transition-colors duration-500`}>
              How to edit your account on NexFellow?
            </h1>
            <div className="flex items-center mt-3 text-sm text-gray-400 gap-3">
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
            <p className={`mt-6 leading-relaxed ${darkMode ? "text-[#D0CACA]" : "text-black"
            }`}>
              Account settings in NexFellow allow you to personalize and manage your experience on the platform. From updating login credentials and notification preferences to controlling privacy options and linked accounts, the settings give you full flexibility to keep your profile secure and tailored to your needs.             </p>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-[#0E7C86] text-white hover:bg-[#0C6D75] transition mt-1"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <FaSun color="white" /> : <FaMoon color="white" />}
          </button>
        </div>

        {/* Timeline Section */}
        <div className="relative mt-14 text-left" ref={timelineRef}>
          {/* base line (subtle) */}
          <div
            className={`absolute top-0 bottom-0 left-6 w-0.5 rounded ${hasProgress ? "" : ""}`}
            style={{
              background: hasProgress ? ACCENT : (darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"),
            }}
            aria-hidden
          />

          {/* animated progress line (framer-motion) */}
          <motion.div
            className="absolute top-0 left-6 w-0.5 origin-top rounded"
            style={{ background: ACCENT, scaleY }}
            aria-hidden
          />

          <div className="space-y-14">
            {steps.map((step, idx) => (
              <div id={`step-${idx + 1}`} key={step.id} className="flex items-start gap-6">
                {/* Step Circle with Icon */}
                <div className="w-12 flex justify-center relative">
                  <div
                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 font-semibold transition-colors duration-500 ${idx <= activeStep
                        ? "bg-[#0E7C86] border-[#0E7C86] text-white"
                        : darkMode
                          ? "bg-black border-[#0E7C86] text-[#0E7C86]"
                          : "bg-white border-[#0E7C86] text-[#0E7C86]"
                      }`}
                  >
                    {step.icon}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold text-[#1CA1A5] ${darkMode ? "text-[#1CA1A5]" : "text-[#1CA1A5]"
            }`}>{step.title}</h3>
                  <p className={`mt-2 text-[15px] ${darkMode ? "text-[#D0CACA]" : "text-black"
            }`}>{step.desc}</p>
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

      {/* Zoomed Image Modal */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold"
            onClick={() => setZoomImage(null)}
            aria-label="Close Image Zoom"
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

      {/* Zoom Animation */}
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