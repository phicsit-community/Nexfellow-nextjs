"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import DotGrid from "../shared/DotGrid";
import { T, T2, BG, CARD, DARKER, MUTED, TEXT, BORDER, BORDER2 } from "../shared/tokens";

const LEFT_CARDS = [
  { quote: "The best feedback I've received in years of building.",                                    name: "Arjun Mehta",    role: "Founder & Indie SaaS Builder",       avatar: "AM" },
  { quote: "The real-time feedback loops reduced our iteration cycle by nearly 40%.",                  name: "Riya Kapoor",    role: "Side Project Builder",               avatar: "RK" },
  { quote: "Direct, actionable insights from people who actually ship code.",                          name: "Daniel Kim",     role: "Startup Founder (B2B SaaS)",         avatar: "DK" },
];

const RIGHT_CARDS = [
  { quote: "NexFellow cut our feedback loop from weeks to minutes.",                                   name: "Thabo Nkosi",    role: "SaaS Builder",                       avatar: "TN" },
  { quote: "No fluff. Just raw technical validation from fellow engineers.",                           name: "Emily Rodriguez", role: "Startup Founder (Growth & Product)", avatar: "ER" },
  { quote: "We validated our MVP and got our first 100 users through NexFellow feedback.",             name: "Michael Torres", role: "Growth-Focused Founder",             avatar: "MT" },
];

const STATS = [
  { value: "24hrs",   label: "Guaranteed\nresponse time" },
  { value: "10+",     label: "Reviews per\nsubmission" },
  { value: "3,000+",  label: "Active builder\nreviewers" },
];

function TestimonialCard({ card, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
      style={{
        background: "rgba(13,32,53,0.88)", border: `1px solid ${BORDER}`,
        borderRadius: 14, padding: "16px 18px", maxWidth: 220,
        backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <p style={{ color: TEXT, fontSize: 13, lineHeight: 1.5, marginBottom: 12, fontStyle: "italic" }}>
        "{card.quote}"
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: `linear-gradient(135deg, ${T}, #0f766e)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700, color: DARKER, flexShrink: 0,
        }}>{card.avatar}</div>
        <div>
          <div style={{ color: TEXT, fontSize: 11, fontWeight: 600 }}>{card.name}</div>
          <div style={{ color: MUTED, fontSize: 10 }}>{card.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Hero() {
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
        width: 700, height: 600,
        background: `radial-gradient(ellipse at center, rgba(20,184,166,0.12) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Left testimonials */}
      <div style={{
        position: "absolute", left: 32, top: "50%",
        transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", gap: 16, zIndex: 10,
      }}>
        {LEFT_CARDS.map((c, i) => <TestimonialCard key={i} card={c} delay={0.3 + i * 0.2} />)}
      </div>

      {/* Right testimonials */}
      <div style={{
        position: "absolute", right: 32, top: "50%",
        transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", gap: 16, zIndex: 10,
      }}>
        {RIGHT_CARDS.map((c, i) => <TestimonialCard key={i} card={c} delay={0.4 + i * 0.2} />)}
      </div>

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
          <span style={{ color: T2, border: `2px solid ${T2}`, borderRadius: 10, padding: "0 10px", display: "inline-block" }}>Real</span>
          {" "}Feedback From{" "}<br />Builders Who Get it
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
