"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import DotGrid from "../shared/DotGrid";
import { T, BG, DARKER, MUTED, TEXT, BORDER, BORDER2 } from "../shared/tokens";
import TrueFocus from './TrueFocus';

const AvatarAM = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="15" r="15" fill="url(#am_g)" />
    <defs><linearGradient id="am_g" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#14b8a6" /><stop offset="1" stopColor="#0f766e" /></linearGradient></defs>
    <text x="15" y="19.5" textAnchor="middle" fill="#071a2c" fontSize="11" fontWeight="700" fontFamily="Inter,sans-serif">AM</text>
  </svg>
);
const AvatarRK = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="15" r="15" fill="url(#rk_g)" />
    <defs><linearGradient id="rk_g" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#7c3aed" /><stop offset="1" stopColor="#2563eb" /></linearGradient></defs>
    <text x="15" y="19.5" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="Inter,sans-serif">RK</text>
  </svg>
);
const AvatarDK = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="15" r="15" fill="url(#dk_g)" />
    <defs><linearGradient id="dk_g" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#f59e0b" /><stop offset="1" stopColor="#d97706" /></linearGradient></defs>
    <text x="15" y="19.5" textAnchor="middle" fill="#071a2c" fontSize="11" fontWeight="700" fontFamily="Inter,sans-serif">DK</text>
  </svg>
);
const AvatarTN = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="15" r="15" fill="url(#tn_g)" />
    <defs><linearGradient id="tn_g" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#ec4899" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient></defs>
    <text x="15" y="19.5" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="Inter,sans-serif">TN</text>
  </svg>
);
const AvatarER = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="15" r="15" fill="url(#er_g)" />
    <defs><linearGradient id="er_g" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#2dd4bf" /><stop offset="1" stopColor="#0891b2" /></linearGradient></defs>
    <text x="15" y="19.5" textAnchor="middle" fill="#071a2c" fontSize="11" fontWeight="700" fontFamily="Inter,sans-serif">ER</text>
  </svg>
);
const AvatarMT = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="15" r="15" fill="url(#mt_g)" />
    <defs><linearGradient id="mt_g" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#22c55e" /><stop offset="1" stopColor="#16a34a" /></linearGradient></defs>
    <text x="15" y="19.5" textAnchor="middle" fill="#071a2c" fontSize="11" fontWeight="700" fontFamily="Inter,sans-serif">MT</text>
  </svg>
);

const LEFT_CARDS = [
  { quote: "The best feedback I've received in years of building.", name: "Arjun Mehta", role: "Founder & Indie SaaS Builder", Avatar: AvatarAM, rotate: -5 },
  { quote: "The real-time feedback loops reduced our iteration cycle by nearly 40%.", name: "Riya Kapoor", role: "Side Project Builder", Avatar: AvatarRK, rotate: 5 },
  { quote: "Direct, actionable insights from people who actually ship code.", name: "Daniel Kim", role: "Startup Founder (B2B SaaS)", Avatar: AvatarDK, rotate: -5 },
];

const RIGHT_CARDS = [
  { quote: "NexFellow cut our feedback loop from weeks to minutes.", name: "Thabo Nkosi", role: "SaaS Builder", Avatar: AvatarTN, rotate: 5 },
  { quote: "No fluff. Just raw technical validation from fellow engineers.", name: "Emily Rodriguez", role: "Startup Founder (Growth & Product)", Avatar: AvatarER, rotate: -5 },
  { quote: "We validated our MVP and got our first 100 users through NexFellow feedback.", name: "Michael Torres", role: "Growth-Focused Founder", Avatar: AvatarMT, rotate: 5 },
];

const STATS = [
  { value: "24hrs", label: "Guaranteed\nresponse time" },
  { value: "10+", label: "Reviews per\nsubmission" },
  { value: "3,000+", label: "Active builder\nreviewers" },
];

const LEFT_POS = [[30, 22], [30, 46], [30, 70]];
const RIGHT_POS = [[30, 22], [30, 46], [30, 70]];

function TestimonialCard({ card, delay = 0 }) {
  const { quote, name, role, Avatar, rotate = 0 } = card;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
      style={{
        background: "rgba(13,32,53,0.88)", border: `1px solid ${BORDER}`,
        borderRadius: 14, padding: "16px 18px", width: 240,
        backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        rotate: rotate,
      }}
    >
      <p style={{ color: TEXT, fontSize: 12.5, lineHeight: 1.55, marginBottom: 12, fontStyle: "italic" }}>
        "{quote}"
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar />
        <div>
          <div style={{ color: TEXT, fontSize: 11, fontWeight: 600 }}>{name}</div>
          <div style={{ color: MUTED, fontSize: 10 }}>{role}</div>
        </div>
      </div>
    </motion.div>
  );
}

/* Each card gets its own scroll-driven x and opacity, staggered by index */
function ScrollCard({ card, delay, scrollYProgress, side, index, posStyle }) {
  const start = 0.08 + index * 0.06;
  const end = 0.58 + index * 0.06;
  const xTarget = side === "left" ? -900 : 900;

  const x = useTransform(scrollYProgress, [start, end], [0, xTarget]);
  const opacity = useTransform(scrollYProgress, [start, end - 0.04], [1, 0]);

  return (
    <motion.div style={{ position: "absolute", zIndex: 10, x, opacity, ...posStyle }}>
      <TestimonialCard card={card} delay={delay} />
    </motion.div>
  );
}

export default function Hero() {
  const heroRef = useRef(null);

  /* scrollYProgress: 0 when hero top hits viewport top, 1 when hero bottom hits viewport top */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  return (
    <section
      ref={heroRef}
      style={{
        position: "relative", minHeight: "100vh", background: BG,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", overflow: "hidden", paddingTop: 68,
      }}
    >
      <DotGrid />

      {/* Radial glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -60%)",
        width: 700, height: 600,
        background: `radial-gradient(ellipse at center, rgba(20,184,166,0.12) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Left testimonials — fly out left on scroll */}
      {LEFT_CARDS.map((card, i) => (
        <ScrollCard
          key={i}
          card={card}
          delay={0.3 + i * 0.2}
          scrollYProgress={scrollYProgress}
          side="left"
          index={i}
          posStyle={{ left: LEFT_POS[i][0], top: `${LEFT_POS[i][1]}vh` }}
        />
      ))}

      {/* Right testimonials — fly out right on scroll */}
      {RIGHT_CARDS.map((card, i) => (
        <ScrollCard
          key={i}
          card={card}
          delay={0.4 + i * 0.2}
          scrollYProgress={scrollYProgress}
          side="right"
          index={i}
          posStyle={{ right: RIGHT_POS[i][0], top: `${RIGHT_POS[i][1]}vh` }}
        />
      ))}

      {/* Center content */}
      <div style={{ position: "relative", zIndex: 5, textAlign: "center", maxWidth: 720, padding: "0 24px" }}>

        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(13,32,53,0.8)", border: `1px solid ${BORDER}`,
            borderRadius: 20, padding: "6px 16px", marginBottom: 28,
            backdropFilter: "blur(8px)",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
          <span style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>Live · 10,000+ builders already in</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
          style={{
            fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.1,
            color: TEXT, marginBottom: 20, letterSpacing: "-1.5px",
          }}
        >
          Get{" "}
          <span style={{ color: T }}>
            <TrueFocus
              sentence="Real Feedback"
              manualMode={false}
              blurAmount={5}
              borderColor={T}
              glowColor={`rgba(20,184,166,0.6)`}
              animationDuration={0.5}
              pauseBetweenAnimations={1}
            />
          </span>
          From<br />
          Builders Who Get it
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ color: MUTED, fontSize: 18, lineHeight: 1.6, maxWidth: 560, margin: "0 auto 36px" }}
        >
          NexFellow connects you with experienced builders who give honest, actionable product feedback. Launch faster with real user insights.
        </motion.p>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Link href="/signup" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: T, color: DARKER, padding: "14px 32px",
            borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: "none",
            boxShadow: `0 0 32px rgba(20,184,166,0.35)`,
          }}>
            Get started free <span style={{ fontSize: 18 }}>→</span>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          style={{
            display: "flex", justifyContent: "center", gap: 48,
            marginTop: 60, paddingTop: 32, borderTop: `1px solid ${BORDER2}`,
          }}
        >
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ color: TEXT, fontSize: 32, fontWeight: 800, letterSpacing: "-1px" }}>{s.value}</div>
              <div style={{ color: MUTED, fontSize: 12, lineHeight: 1.5, whiteSpace: "pre-line", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
