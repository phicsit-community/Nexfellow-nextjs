import React, { useEffect, useState, useRef } from "react";
import { FaMoon, FaSun, FaTimes, FaChevronDown, FaChevronRight, FaDownload, FaEdit } from "react-icons/fa";
import MiniFooter from "../components/MiniFooter.jsx";
import { useOutletContext } from "react-router-dom";
import { IoMdInformationCircle } from "react-icons/io";

// Import images
import TopMembersImg from "../assets/member1.png";
import ManagementPanelImg from "../assets/member3.png";
import { MdAccountCircle } from "react-icons/md";

export default function MembersAccessPage() {
  const [activeStep, setActiveStep] = useState({});
  const [zoomImage, setZoomImage] = useState(null);
  const { darkMode, setDarkMode } = useOutletContext();
  const [openSection, setOpenSection] = useState({ top: true, mgmt: true });

  const timelineRefs = {
    top: useRef(null),
    mgmt: useRef(null),
  };

  const cyan = "#0E7C86";

  const toggleTheme = () => setDarkMode(!darkMode);

  const steps = [
     { id: 1, title: "Step 1", desc: "Click on Profile under Account Management.", image: null, icon: <MdAccountCircle size={24} /> },
    { id: 2, title: "Step 2", desc: "Click on Top Members (available once you’re verified).", image: TopMembersImg, icon: <FaDownload /> },
    { id: 3, title: "Step 3", desc: "Select top members to showcase on your page.", image: null, icon: <FaEdit /> },
  ];

  const managementSteps = [
     { id: 1, title: "Step 1", desc: "Click on Profile under Account Management.", image: null, icon: <MdAccountCircle size={24} /> },
    { id: 2, title: "Step 2", desc: "Click on Moderators.", image: null, icon: <FaDownload /> },
    { id: 3, title: "Step 3", desc: "Select role from your followers list and assign them roles.", image: ManagementPanelImg, icon: <FaEdit /> },
  ];

  // Scroll tracking for progress lines
  useEffect(() => {
    const handleScroll = () => {
      ["top", "mgmt"].forEach((prefix) => {
        const ref = timelineRefs[prefix].current;
        if (!ref) return;

        const stepsEl = ref.querySelectorAll("[id^='step-']");
        if (!stepsEl.length) return;

        const first = stepsEl[0];
        const last = stepsEl[stepsEl.length - 1];

        const firstTop = first.offsetTop + ref.offsetTop + 24;
        const lastTop = last.offsetTop + ref.offsetTop + 24;
        const scrollMiddle = window.scrollY + window.innerHeight / 2;

        let lineHeight = scrollMiddle - firstTop;
        const maxHeight = lastTop - firstTop;
        lineHeight = Math.max(0, Math.min(lineHeight, maxHeight));

        ref.style.setProperty("--progress-height", `${(lineHeight / maxHeight) * 100}%`);

        let currentStep = 0;
        stepsEl.forEach((el, idx) => {
          const elTop = el.offsetTop + ref.offsetTop + 24;
          if (scrollMiddle >= elTop) {
            currentStep = idx;
          }
        });

        setActiveStep((prev) => ({ ...prev, [prefix]: currentStep }));
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderSteps = (arr, prefix) => (
    <div className="relative mt-6 text-left" ref={timelineRefs[prefix]}>
      {/* Background Line */}
      <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-300 dark:bg-gray-700" />
      {/* Progress Line */}
      <div
        className="absolute top-0 left-6 w-0.5 transition-all duration-500"
        style={{ backgroundColor: cyan, height: "var(--progress-height, 0%)" }}
      />
      <div className="space-y-12">
        {arr.map((step, idx) => (
          <div id={`step-${prefix}-${idx + 1}`} key={step.id} className="flex items-start gap-6">
            {/* Step Circle */}
            <div className="w-12 flex justify-center relative">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow border-4 font-semibold transition-colors duration-500 ${
                  idx <= (activeStep[prefix] ?? 0)
                    ? `bg-[${cyan}] border-[${cyan}] text-white`
                    : darkMode
                    ? `bg-black border-[${cyan}] text-[${cyan}]`
                    : `bg-white border-[${cyan}] text-[${cyan}]`
                }`}
                style={{
                  backgroundColor:
                    idx <= (activeStep[prefix] ?? 0) ? cyan : darkMode ? "black" : "white",
                  borderColor: cyan,
                  color: idx <= (activeStep[prefix] ?? 0) ? "white" : cyan,
                }}
              >
                {step.icon}
              </div>
            </div>

            {/* Step Text */}
            <div className="flex-1">
              <h3
                className="text-xl font-semibold"
                style={{ color: "#1CA1A5" }}
              >
                {step.title}
              </h3>
              <p className={`mt-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                {step.desc}
              </p>

              {step.image && (
                <img
                  src={step.image}
                  alt={`${step.title} example`}
                  className="mt-4 w-full max-w-md rounded-lg shadow cursor-pointer hover:scale-[1.03] transition-transform"
                  onClick={() => setZoomImage(step.image)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={`${
        darkMode ? "bg-black text-gray-100" : "bg-white text-gray-900"
      } min-h-screen font-poppins px-8 py-10 transition-colors duration-500`}
    >
      <div className="max-w-5xl mx-auto text-left">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className={`text-sm ${darkMode ? "text-white" : "text-gray-800 "}`}>
              Docs &gt; Account Management &gt;{" "}
              <span className="font-medium text-[#1CA1A5]">
                Members and Access
              </span>
            </p>
             <h1
              className={`text-3xl font-semibold mt-2 ${
                darkMode ? "text-white" : "text-[#0E7C86]"
              }`}
            >
              Featuring Top Members & Managing Roles
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
            style={{ backgroundColor: cyan, color: "white" }}
          >
            {darkMode ? <FaSun color="white" /> : <FaMoon color="white" />}
          </button>
        </div>

        {/* Intro */}
        <p className={`mt-5 text-base leading-relaxed ${darkMode ? "text-[#D0CACA]" : "text-black"}`}>
          Featuring a Top Member highlights the most active and impactful individual in your community.
          Assigning management roles allows for smooth coordination and efficient operations.
        </p>

        {/* Top Members */}
        <div className="mt-10">
          <button
            onClick={() => setOpenSection((prev) => ({ ...prev, top: !prev.top }))}
            className={`flex items-center gap-2 mb-1 text-2xl font-semibold ${darkMode ? "text-white" : "text-black"}`}
            // style={{ color: cyan }}
          >
            {openSection.top ? <FaChevronDown /> : <FaChevronRight />}
            Top Members
          </button>
          <p className="text-gray-500 text-sm mb-4">
            Showcase the top contributors of your community.
          </p>
          {openSection.top && renderSteps(steps, "top")}
        </div>

        {/* Management */}
        <div className="mt-14">
          <button
            onClick={() => setOpenSection((prev) => ({ ...prev, mgmt: !prev.mgmt }))}
            className={`flex items-center gap-2 mb-1 text-2xl font-semibold ${darkMode ? "text-white" : "text-black"}`}
            // style={{ color: "white" }}
          >
            {openSection.mgmt ? <FaChevronDown /> : <FaChevronRight />}
            Management
          </button>
          <p className="text-gray-500 text-sm mb-4">
            Assign roles and manage responsibilities for smooth operations.
          </p>
          {openSection.mgmt && (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Member", "Event Admin", "Contest Admin", "Analyst", "Moderator"].map((role) => (
                  <span
                    key={role}
                    className="px-4 py-2 rounded-md text-white text-lg"
                    style={{ backgroundColor: "#006c69" }}
                  >
                    {role}
                  </span>
                ))}
              </div>
              {renderSteps(managementSteps, "mgmt")}
            </>
          )}
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold z-50"
            onClick={() => setZoomImage(null)}
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
            0% { transform: scale(0.8); opacity: 0; }
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
