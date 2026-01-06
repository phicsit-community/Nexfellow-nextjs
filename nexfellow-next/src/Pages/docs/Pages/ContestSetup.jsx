import React, { useEffect, useState, useRef } from "react";
import { useDocsTheme } from "../context/DocsContext";
import {
  FaClipboardCheck,
  FaEdit,
  FaCalculator,
  FaMoon,
  FaSun,
  FaTimes,
  FaDownload
} from "react-icons/fa";
import ContestSetupImg from "../assets/contestsetup.png";
import ManageContestImg from "../assets/contest_setup1.png";
import MiniFooter from "../components/MiniFooter.jsx";
import { IoMdAddCircle, IoMdInformationCircle } from "react-icons/io";
import { MdAccountCircle, MdOutlineAddPhotoAlternate } from "react-icons/md";

export default function ContestSetup() {
  const [activeStep, setActiveStep] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const { darkMode, setDarkMode } = useDocsTheme();
  const timelineRef = useRef(null);
  const cyan = "#0E7C86";

  const toggleTheme = () => setDarkMode(!darkMode);

  const infoCards = [
    {
      id: 1,
      icon: <FaClipboardCheck className="text-white text-2xl" />,
      title: "Organize Contests",
      desc: "Create and manage contests effortlessly — review questions, participants, and scores all in one place.",
    },
    {
      id: 2,
      icon: <FaEdit className="text-white text-2xl" />,
      title: "Edit & Customize",
      desc: "Full control over your contests — edit questions, manage participants, and update details anytime.",
    },
    {
      id: 3,
      icon: <FaCalculator className="text-white text-2xl" />,
      title: "Scores & Rewards",
      desc: "Calculate scores, declare winners, and manage rewards automatically with built-in tools.",
    },
  ];

  const steps = [
    {
      id: 1,
      title: "Step 1",
      desc: "Click on profile under account management to access your contest creation options.",
      image: null,
      icon: <MdAccountCircle size={24} />
    },
    {
      id: 2,
      title: "Step 2",
      desc: "Click on Contest (available once verified) and select Create Contest to start building your competition.",
      image: null,
      icon: <FaDownload />
    },
    {
      id: 3,
      title: "Step 3",
      desc: "Fill in all required details including contest name, description, rules, duration, and prizes.",
      image: ContestSetupImg,
      icon: <FaEdit />
    },
    {
      id: 4,
      title: "Step 4",
      desc: "Contest is created. Click on it to manage participants, add questions, and monitor progress.",
      image: ManageContestImg,
      icon: <MdOutlineAddPhotoAlternate size={24} />
    },
  ];

  // Step progress animation
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
          if (scrollMiddle >= elTop) currentStep = i;
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
                Contest Setup
              </span>
            </p>
            <h1
              className={`text-3xl font-semibold font-poppins mt-2 ${darkMode ? "text-white" : "text-[#0E7C86]"
                }`}
            >
              How to conduct contest on NexFellow?
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

        {/* Description */}
        <p
          className={`mt-4 leading-relaxed ${darkMode ? "text-[#D0CACA]" : "text-black"
            }`}
        >
          Contests are designed to bring out the competitive spirit in the community while fostering learning and
          collaboration. You can create and host contests across different categories, define rules, set deadlines, and
          reward participants based on their performance. Contests not only encourage members to showcase their skills
          but also help build engagement, recognition, and healthy competition within the platform.
        </p>

        {/* Info Cards */}
        <h2
          className={`text-2xl font-semibold mt-8 mb-6 ${darkMode ? "text-white" : "text-[#0E7C86]"
            }`}
        >
          Contest
        </h2>

        <div className="flex flex-col gap-3 w-full">
          {infoCards.map((card) => (
            <div
              key={card.id}
              className={`p-5 rounded-lg flex flex-row items-center gap-3 shadow-md transition-all ${darkMode
                ? "bg-[#006C69] text-gray-200 hover:bg-[#006C69] hover:scale-105"
                : "bg-[#006C69] text-white hover:bg-[#006C69] hover:scale-105"
                }`}
            >
              <div
                className={`w-10 h-10 rounded-md flex items-center justify-center ${darkMode ? "bg-[#006C69]" : "bg-[#006C69]"
                  }`}
              >
                {card.icon}
              </div>
              {/* <h3 className="font-semibold">{card.title}</h3> */}
              <p className="text-sm">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Steps Timeline */}

        <div className="relative mt-8" ref={timelineRef}>
          <div
            className={`absolute top-0 bottom-0 left-6 w-0.5 ${darkMode ? "bg-gray-800" : "bg-[#D1EBEE]"
              }`}
          />
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
                <div className="w-12 flex justify-center relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 font-semibold transition-colors duration-500 ${idx <= activeStep
                      ? "text-white"
                      : darkMode
                        ? "bg-black text-[#0E7C86]"
                        : "bg-white text-[#0E7C86]"
                      }`}
                    style={{
                      backgroundColor: idx <= activeStep ? cyan : "transparent",
                      borderColor: cyan,
                    }}
                  >
                    {step.icon}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold" style={{ color: "#1CA1A5" }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-[15px]">{step.desc}</p>
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
