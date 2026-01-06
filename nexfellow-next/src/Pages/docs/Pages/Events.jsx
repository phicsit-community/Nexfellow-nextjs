import React, { useEffect, useState, useRef } from "react";
import { useDocsTheme } from "../context/DocsContext";
import {
  FaCalendarAlt,
  FaUsers,
  FaGift,
  FaBalanceScale,
  FaMoon,
  FaSun,
  FaTimes,
  FaDownload,
  FaEdit,
} from "react-icons/fa";
import Step1Image from "../assets/event1.png";
import Step2Image from "../assets/event2.png";
import MiniFooter from "../components/MiniFooter.jsx";
import { IoMdInformationCircle } from "react-icons/io";
import { MdAccountCircle, MdOutlineAddPhotoAlternate } from "react-icons/md";
import { BsGraphUpArrow } from 'react-icons/bs';
import { IoStar } from 'react-icons/io5';
export default function EventsPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const { darkMode, setDarkMode } = useDocsTheme();
  const timelineRef = useRef(null);
  const cyan = "#0E7C86";

  const toggleTheme = () => setDarkMode(!darkMode);

  const infoCards = [
    {
      id: 1,
      icon: <BsGraphUpArrow className="text-white" size={48} />,
      title: "Organize Contests",
      desc: "Plan and host contests to test creativity and engagement.",
    },
    {
      id: 2,
      icon: <IoStar className="text-white text-2xl" />,
      title: "Encourage Participation",
      desc: "Inspire members to take part and grow through collaboration.",
    },
    {
      id: 3,
      icon: <FaGift className="text-white text-2xl" />,
      title: "Recognize Winners",
      desc: "Reward achievements with badges, prizes, or public recognition.",
    },
    {
      id: 4,
      icon: <FaBalanceScale className="text-white text-2xl" />,
      title: "Unbiased Evaluation",
      desc: "Ensure every event is judged fairly with transparent criteria.",
    },
  ];

  const steps = [
    {
      id: 1,
      title: "Step 1",
      desc: "Click on profile under account management.",
      image: null,
      icon: <MdAccountCircle size={24} />
    },
    {
      id: 2,
      title: "Step 2",
      desc: "Click on Event (only available once verified) and select Create Event.",
      image: null,
      icon: <FaDownload />
    },
    {
      id: 3,
      title: "Step 3",
      desc: "Fill in the required event details such as name, date, and rules.",
      image: Step1Image,
      icon: <FaEdit />
    },
    {
      id: 4,
      title: "Step 4",
      desc: "Once events are created, click on them to manage participants and updates.",
      image: Step2Image,
      icon: <MdOutlineAddPhotoAlternate size={24} />
    },
  ];

  // Stepper scroll animation
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
                Events Setup
              </span>
            </p>
            <h1
              className={`text-3xl font-semibold font-poppins mt-2 ${darkMode ? "text-white" : "text-[#0E7C86]"
                }`}
            >
              How to host event on NexFellow?
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

        {/* Intro */}
        <p
          className={`mt-4 leading-relaxed ${darkMode ? "text-[#D0CACA]" : "text-black"
            }`}
        >
          Events serve as a space for members to connect, collaborate, and engage in real time. Whether it’s workshops, meetups, webinars, or special sessions, events allow you to bring the community together around shared interests and goals. You can create event schedules, manage attendees, share updates, and track participation — making it easier to build meaningful connections and drive active involvement.
        </p>

        {/* Info Cards */}
        <h2
          className={`text-2xl font-semibold mt-8 mb-6 ${darkMode ? "text-white" : "text-[#0E7C86]"
            }`}
        >
          EContest
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {infoCards.map((item) => (
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
              <p className="text-md">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}

        <div className="relative mt-8" ref={timelineRef}>
          {/* Background Line (behind circles) */}
          <div
            className={`absolute top-0 bottom-0 left-6 w-0.5 ${darkMode ? "bg-gray-800" : "bg-[#D1EBEE]"
              }`}
          />
          {/* Progress Line (stops below circle) */}
          <div
            className="absolute top-[24px] left-6 w-0.5 transition-all duration-500"
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
                {/* Circle */}
                <div className="w-12 flex justify-center relative">
                  <div
                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 font-semibold transition-colors duration-500 ${idx <= activeStep
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

                {/* Step Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#1CA1A5]" >
                    {step.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-[15px]">
                    {step.desc}
                  </p>

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
