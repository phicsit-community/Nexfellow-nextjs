import React, { useEffect, useState, useRef } from "react";
import {
  FaCheckCircle,
  FaStar,
  FaChartLine,
  FaHeadset,
  FaTimes,
  FaMoon,
  FaSun,
  FaDownload,
  FaEdit,
} from "react-icons/fa";
import { useDocsTheme } from "../context/DocsContext";
import { IoMdInformationCircle } from "react-icons/io";
import Step1Image from "../assets/verification1.png";
import Step2Image from "../assets/verification2.png";
import MiniFooter from "../components/MiniFooter.jsx";
import { MdAccountCircle } from 'react-icons/md';

export default function VerificationPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const { darkMode, setDarkMode } = useDocsTheme();
  const timelineRef = useRef(null);

  const toggleTheme = () => setDarkMode(!darkMode);
  const cyan = "#0E7C86";

  const whyItems = [
    {
      id: 1,
      icon: <FaCheckCircle className="text-white text-xl" />,
      text: "Get the blue checkmark that shows you’re authentic.",
    },
    {
      id: 2,
      icon: <FaStar className="text-white text-xl" />,
      text: "Access to beta features and advanced analytics.",
    },
    {
      id: 3,
      icon: <FaChartLine className="text-white text-xl" />,
      text: "Your content gets boosted in search and recommendations.",
    },
    {
      id: 4,
      icon: <FaHeadset className="text-white text-xl" />,
      text: "Access to dedicated support and faster response times.",
    },
  ];

  const steps = [
    {
      id: 1,
      title: "Step 1",
      desc: "Click on Profile. Below post, click to proceed",
      image: Step1Image,
      icon: <FaDownload />
    },
    {
      id: 2,
      title: "Step 2",
      desc: "Fill the details and submit for verification.",
      image: Step2Image,
      icon: <MdAccountCircle size={24} />
    },
    {
      id: 3,
      title: "Step 3",
      desc: "Our team will review your request and help you get verified.",
      image: null,
      icon: <FaEdit />
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
                Verification Setup
              </span>
            </p>
            <h1
              className={`text-3xl font-bold mt-2 font-poppins font-semibold ${darkMode ? "text-white" : "text-[#0E7C86]"
                }`}
            >
              How to get verified on NexFellow?
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
          >
            {darkMode ? <FaSun color="white" /> : <FaMoon color="white" />}
          </button>
        </div>

        {/* Intro */}
        <p
          className={`mt-6 leading-relaxed ${darkMode ? "text-[#D0CACA]" : "text-black"
            }`}
        >
          With a Verified Badge, you earn the blue checkmark that highlights
          your authenticity. Getting verified unlocks access to post, host
          events, run challenges, broadcast updates, and access exclusive
          features. You also get boosted visibility, analytics, and priority
          support to grow faster.
        </p>

        {/* Why Verification */}
        <h2
          className={`text-2xl font-poppins font-semibold mt-8 mb-6 ${darkMode ? "text-white" : "text-[#0E7C86]"
            }`}
        >
          Why verification?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {whyItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-5 rounded-2xl shadow-md transition transform hover:scale-105 ${darkMode
                ? "bg-[#006C69] text-white hover:bg-[#006C69]"
                : "bg-[#006C69] text-white hover:bg-[#006C69]"
                }`}
            >
              <div
                className="w-16 h-16 flex items-center justify-center rounded-md"
                style={{ backgroundColor: darkMode ? "#006C69" : "#006C69" }}
              >
                {item.icon}
                <span className="text-4xl font-light ml-4">l</span>
              </div>
              <p className="text-md">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Steps Section */}

        <div className="relative mt-8" ref={timelineRef}>
          {/* Background Line (stops before icons) */}
          <div
            className={`absolute top-0 bottom-0 left-[1.5rem] w-0.5 ${darkMode ? "bg-gray-800" : "bg-[#D1EBEE]"
              }`}
          />

          {/* Progress Line (stops before icons) */}
          <div
            className="absolute top-0 left-[1.5rem] w-0.5 transition-all duration-500"
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
                <div className="w-12 flex justify-center relative z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 font-semibold transition-colors duration-500 ${idx <= activeStep
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
                  {/* Step title always cyan */}
                  <h3 className="text-xl font-semibold text-[#1CA1A5]">
                    {step.title}
                  </h3>

                  <p className="mt-2 leading-relaxed">{step.desc}</p>

                  {step.image && (
                    <img
                      src={step.image.src || step.image}
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
