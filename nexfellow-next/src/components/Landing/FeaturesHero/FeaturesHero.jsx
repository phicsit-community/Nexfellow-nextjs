"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import DotGrid from "../shared/DotGrid";
import { T, BG, DARKER, MUTED, TEXT, BORDER, BORDER2 } from "../shared/tokens";
import { useIsMobile } from "../shared/useIsMobile";

const STATS = [
  { value: "24hrs", label: "average time to 10 reviews" },
  { value: "89%", label: "say it improved their product" },
  { value: "3.1×", label: "faster first paying customer" },
];

export default function FeaturesHero() {
  const isMobile = useIsMobile();

  return (
    <section style={{
      position: "relative", minHeight: "100vh", background: BG,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", overflow: "hidden", paddingTop: 68,
    }}>
      <DotGrid />

      {/* Radial glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -60%)",
        width: 800, height: 700,
        background: `radial-gradient(ellipse at center, rgba(20,184,166,0.1) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Text content — centered, constrained width */}
      <div style={{ position: "relative", zIndex: 5, textAlign: "center", maxWidth: 1220, padding: "0 24px", width: "100%" }}>

        {/* Platform badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(13,32,53,0.8)", border: `1px solid ${BORDER}`,
            borderRadius: 20, padding: "6px 16px", marginBottom: 21,
            backdropFilter: "blur(8px)",
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: T, boxShadow: `0 0 8px ${T}` }} />
          <span style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>Platform features</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
          style={{
            fontSize: "clamp(38px, 6vw, 65px)", fontWeight: 800, lineHeight: 1.1,
            color: TEXT, marginBottom: 24, letterSpacing: "-2px"
          }}
        >
          Every tool a builder needs to{" "}
          <span style={{ color: T, whiteSpace: "nowrap" }}>get <br/> found,</span>{" "}
          get feedback,{" "}
          <span style={{ color: T}}>grow.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ color: MUTED, fontSize: 16, lineHeight: 1.7, maxWidth: 880, margin: "0 auto 40px" }}
        >
          NexFellow is a platform built as a complete distribution engine, combining visibility, real feedback, meaningful connections, and AI-powered go-to-market strategy in one place.
        </motion.p>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Link href="/signup" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: T, color: DARKER, padding: "14px 36px",
            borderRadius: 100, fontWeight: 700, fontSize: 16, textDecoration: "none",
            boxShadow: `0 0 32px rgba(20,184,166,0.35)`,
          }}>
            Get started free <span style={{ fontSize: 18 }}>→</span>
          </Link>
        </motion.div>
      </div>

      {/* Stats bar — full width, breaks out of text container */}
        <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        style={{
          position: "relative", zIndex: 5,
          width: isMobile ? "calc(100% - 32px)" : "calc(100% - 48px)", maxWidth: 800,
          marginTop: isMobile ? 48 : 72,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          background: "rgba(13,32,53,0.65)",
          border: `1px solid ${BORDER2}`,
          borderRadius: 16,
          backdropFilter: "blur(14px)",
          overflow: "hidden",
        }}
      >
        {STATS.map((s, i) => {
          const showBorder = i < STATS.length - 1;
          return (
            <div key={i} style={{
              padding: isMobile ? "18px 10px" : "26px 20px", textAlign: "center",
              borderRight: showBorder ? `1px solid ${BORDER2}` : "none",
            }}>
              <div style={{ color: TEXT, fontSize: isMobile ? 18 : "clamp(20px, 2.5vw, 28px)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 4 }}>{s.value}</div>
              <div style={{ color: MUTED, fontSize: 10, lineHeight: 1.45 }}>{s.label}</div>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
