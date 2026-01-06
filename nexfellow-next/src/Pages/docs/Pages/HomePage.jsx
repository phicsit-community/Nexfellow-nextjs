import React from "react";
import { FaEdit, FaLink } from "react-icons/fa";
import { BiNavigation } from "react-icons/bi";
import { MdSystemSecurityUpdateGood, MdLeaderboard } from "react-icons/md";
import { IoIosTrophy } from "react-icons/io";
import { LuMousePointerClick } from "react-icons/lu";
import { RiUserCommunityFill } from "react-icons/ri";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";

// Debounce hook (local, lightweight)
function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const PillSearch = ({ value, onChange, onSubmit, onClear }) => (
  <div className="flex items-center bg-white text-black rounded-full shadow-xl ring-1 ring-white/30 w-full px-5 py-3">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6 text-gray-500 mr-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-4.35-4.35M9.5 17a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"
      />
    </svg>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSubmit();
      }}
      placeholder="Search NexFellow docs"
      className="flex-grow bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
      aria-label="Search NexFellow docs"
    />
    {value?.length > 0 && (
      <button
        onClick={onClear}
        className="ml-2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-full p-1"
        aria-label="Clear search"
      >
        ×
      </button>
    )}
    <button
      onClick={onSubmit}
      className="ml-3 rounded-full bg-[#0c4b47] text-white px-4 py-2 transition-colors hover:bg-teal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-400 focus-visible:ring-offset-white"
      aria-label="Run search"
    >
      Search
    </button>
  </div>
);

// Feature card with subtle motion and optional onClick
const FeatureCard = ({ Icon, title, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="relative text-left bg-[#111111] rounded-2xl p-8 border-2 border-[#1CA1A6]/60 hover:border-[#1CA1A6] transition-colors shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black group"
  >
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0B0B0B] rounded-full p-5 border-4 border-[#1CA1A6] shadow-xl transition-transform duration-300 group-hover:scale-105">
      <Icon size={28} className="text-white" />
    </div>
    <h3 className="mt-6 text-2xl font-semibold text-[#1CA1A6]">{title}</h3>
    <p className="text-[#D0CACA] text-base leading-relaxed max-w-md">
      {children}
    </p>
  </button>
);

export default function HomePage() {
  const router = useRouter();

  // Search state with debounce
  const [query, setQuery] = React.useState("");
  const debounced = useDebouncedValue(query, 400); // use debounced value for suggestions or analytics [web:199]
  const onSearchSubmit = () => {
    const q = query.trim();
    if (q.length > 0) router.push(`/search?q=${encodeURIComponent(q)}`); // programmatic route [web:90]
  };

  return (
    <div className="min-h-screen bg-black text-white font-poppins">
      {/* Header */}
      <header className="relative w-full pb-16">
        {/* Rounded gradient area that clips only its children */}
        <div className="relative rounded-b-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d8e86] via-[#0a736c] to-[#06413c]" />
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[900px] bg-white/10 blur-3xl" />

          <div className="relative">
            <Navbar />
            <div className="mx-auto max-w-7xl px-6 pt-10 pb-11 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
                The handbook for your <span className="text-teal-300">NexFellow</span>
              </h1>
              <p className="text-white/90 text-sm sm:text-base mb-6">
                Your go-to guide for mastering every feature and getting the most out of NexFellow
              </p>
              <button
                onClick={() => router.push("/overview")}
                className="mx-auto inline-flex items-center justify-center gap-2 bg-[#0c4b47] hover:bg-teal-400 text-white px-5 py-2.5 rounded-lg font-semibold border border-white/70 shadow-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c4b47]"
                aria-label="Explore"
              >
                <LuMousePointerClick size={20} />
                <span>Explore</span>
              </button>
            </div>
          </div>
        </div>

        {/* Centered overlapping search pill */}
        <div className="absolute inset-x-0 bottom-0 translate-y-1/2 z-50 flex justify-center px-4">
          <div className="w-[clamp(18rem,90vw,56rem)]">
            <PillSearch
              value={query}
              onChange={setQuery}
              onSubmit={onSearchSubmit}
              onClear={() => setQuery("")}
            />
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="relative z-0 mx-auto max-w-7xl w-full px-6 py-12">
        {/* Why NexFellow */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-3 text-left">
            Why <span className="text-[#1CA1A6]">NexFellow Documentation?</span>
          </h2>
          <p className="text-[#D0CACA] text-left">
            From instant updates to secure publishing, Nexfellow keeps docs dependable. Designed for clarity, structure, and a seamless reading experience.
          </p>

          {/* subtle card motion */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <FeatureCard
              Icon={FaEdit}
              title="Inline admin editing"
              onClick={() => router.push("/editor")}
            >
              Since admins can edit directly, users always get the latest and frequently updated content without delays.
            </FeatureCard>

            <FeatureCard
              Icon={BiNavigation}
              title="Structured navigation"
              onClick={() => router.push("/overview")}
            >
              Documentation stays well-structured so even someone new or from a non-technical background can understand.
            </FeatureCard>

            <FeatureCard
              Icon={MdSystemSecurityUpdateGood}
              title="Responsive by default"
              onClick={() => router.push("/guides/responsive")}
            >
              Users can comfortably view the docs on any smart device — mobile, tablet, or desktop.
            </FeatureCard>
          </div>
        </section>

        {/* Community */}
        <section className="mb-10 flex flex-col lg:flex-row items-center gap-10">
          <div className="w-full lg:w-1/3 flex justify-center lg:justify-start">
            <div className="relative">
              <img
                src="/images/left-art.png"
                alt="Mascot"
                className="rounded-xl shadow-xl select-none pointer-events-none"
              />
              <div className="absolute -left-6 top-6 bg-[#0f0f0f] text-white/90 rounded-xl px-3 py-2 border border-white/10 shadow transition-transform duration-200 hover:scale-[1.02]">
                Growth 10,010
              </div>
              <div className="absolute -right-6 top-24 bg-[#0f0f0f] text-white/90 rounded-xl px-3 py-2 border border-white/10 shadow transition-transform duration-200 hover:scale-[1.02]">
                Engagement 64%
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3 space-y-6">
            {[
              {
                icon: <RiUserCommunityFill size={20} />,
                title: "Building Communities",
                text: "Create spaces where people connect, share ideas, and grow together.",
                to: "/community",
              },
              {
                icon: <FaLink size={20} />,
                title: "Connecting with Like-Minded People",
                text: "Find and collaborate with people who share your passions and interests.",
                to: "/explore",
              },
              {
                icon: <MdLeaderboard size={20} />,
                title: "Challenges & Contests",
                text: "Engage members with exciting challenges and contests that inspire participation.",
                to: "/challenges",
              },
              {
                icon: <IoIosTrophy size={20} />,
                title: "Leaderboards",
                text: "Celebrate achievements through a dynamic reputation-based leaderboard.",
                to: "/leaderboard",
              },
            ].map((row) => (
              <button
                key={row.title}
                onClick={() => router.push(row.to)}
                className="w-full flex items-start gap-4 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg p-1"
              >
                <div className="bg-teal-600 rounded-full p-3 text-white transition-transform duration-200 group-hover:scale-105">
                  {row.icon}
                </div>
                <div>
                  <h3 className="text-xl text-[#1CA1A6] font-semibold">{row.title}</h3>
                  <p className="text-[#F2EFEF]">{row.text}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <p className="text-center text-gray-500 text-sm mt-4">@nexfellow 2025</p>
      </main>
    </div>
  );
}
