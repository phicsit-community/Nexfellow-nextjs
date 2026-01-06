import React, { useEffect, useState, useRef } from "react";
import { FaDownload, FaMoon, FaSun, FaTimes } from "react-icons/fa";
import { useDocsTheme } from "../context/DocsContext";
import MiniFooter from "../components/MiniFooter.jsx";
import { IoMdInformationCircle } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";
export default function FeedPage() {
  const { darkMode, setDarkMode } = useDocsTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null);
  const timelineRef = useRef(null);
  const cyan = "#0E7C86";

  const toggleTheme = () => setDarkMode(!darkMode);

  const steps = [
    {
      id: 1,
      title: "Click on a Community that interests you.",
      img: "/images/Feed_Discussion.png",
      icon: <MdAccountCircle size={24} />
    },
    {
      id: 2,
      title:
        "Navigate across various activities like Feed, People, and Discussions to explore and participate.",
      icon: <FaDownload size={24} />
    },
  ];

  const features = [
    {
      id: "feed",
      title: "Feed",
      description:
        "Stay updated with announcements and posts shared by community admins.",
    },
    {
      id: "people",
      title: "People",
      description:
        "Discover community members and connect with them for meaningful interactions.",
    },
    {
      id: "discussions",
      title: "Discussions",
      description:
        "Engage in real-time conversations and exchange ideas with fellow members.",
    },
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
        } font-poppins min-h-screen px-6 py-10 transition-colors duration-500`}
    >
      <div className="max-w-5xl mx-auto text-left">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <p className={`text-sm ${darkMode ? "text-white" : "text-gray-800 "}`}>
              Docs &gt; Communities and Activities &gt;{" "}
              <span className="font-medium text-[#1CA1A5]">
                Feed, Discussions and Memebers
              </span>
            </p>
            <h1
              className={`text-3xl font-semibold mt-2 ${darkMode ? "text-white" : "text-[#0E7C86]"
                }`}
            >
              Feed,Discussions and Members on NexFellow?
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

        {/* Intro Text */}
        <p
          className={`mt-6 leading-relaxed ${darkMode ? "text-[#D0CACA]" : "text-black"
            }`}
        >
          The Feed, Discussions, and Members section brings together all aspects
          of community interaction. Stay updated, connect with like-minded
          individuals, and participate in ongoing discussions — all in one
          place.
        </p>

        {/* Features Section */}
        {/* <h2
          className={`text-2xl font-semibold mt-10 mb-6 ${
            darkMode ? "text-white" : "text-[#0E7C86]"
          }`}
        >
          Features
        </h2> */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`rounded-2xl p-6 text-white bg-[#006C69] transition transform hover:scale-105`}
            >
              <h3 className="text-xl font-semibold mb-2 w-full text-center">{feature.title}</h3>
              <p className="text-md font-light text-center opacity-90">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Steps Section */}
        {/* <h2
          className={`text-2xl font-semibold mt-10 mb-6 ${
            darkMode ? "text-white" : "text-[#0E7C86]"
          }`}
        >
          Steps to Explore Feed, Discussions and Members
        </h2> */}

        <div className="relative mt-8" ref={timelineRef}>
          {/* Static Cyan Line */}
          <div
            className="absolute top-0 bottom-0 left-[33px] w-[2.5px]"
            style={{ backgroundColor: "#0E7C86" }}
          />

          <div className="space-y-14">
            {steps.map((step, idx) => (
              <div
                id={`step-${idx + 1}`}
                key={step.id}
                className="flex items-start gap-6"
              >
                {/* Step Circle */}
                <div className="w-16 flex justify-center relative">
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

                {/* Step Text */}
                <div className="flex-1">
                  <p className={`text-xl font-semibold`} style={{ color: "#1CA1A5" }}>
                    Step {idx + 1}
                  </p>
                  <p className="mt-2 leading-relaxed">{step.title}</p>

                  {/* Step Image */}
                  {step.img && (
                    <div className="bg-gray-900/40 p-4 rounded-lg mt-4 border border-gray-700">
                      <img
                        src={step.img}
                        alt={step.title}
                        className="w-full h-auto rounded-md cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                        onClick={() => setZoomedImage(step.img)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zoom Modal with Close Button */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-6 right-6 text-white text-3xl hover:text-[#0E7C86] transition"
            aria-label="Close Zoomed Image"
          >
            <FaTimes />
          </button>
          <img
            src={zoomedImage}
            alt="Zoomed"
            className="max-w-4xl max-h-[80vh] rounded-lg shadow-lg"
          />
        </div>
      )}

      <MiniFooter />
    </div>
  );
}
