"use client";

import FadeIn from "../shared/FadeIn";
import { T, BG, MUTED, TEXT, DARKER } from "../shared/tokens";

const STEPS = [
  {
    num: 1,
    title: "Submit your product",
    desc: "Add your product link, description, and your target audience. Your submission goes live quickly.",
    icon: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect x="10" y="15" width="44" height="56" rx="4" fill="#0f3651" stroke={T} strokeWidth="1.5"/>
        <rect x="18" y="25" width="28" height="3" rx="1.5" fill={T} opacity="0.7"/>
        <rect x="18" y="32" width="20" height="2.5" rx="1.25" fill="#94a3b8" opacity="0.5"/>
        <rect x="18" y="38" width="24" height="2.5" rx="1.25" fill="#94a3b8" opacity="0.5"/>
        <rect x="18" y="44" width="16" height="2.5" rx="1.25" fill="#94a3b8" opacity="0.5"/>
        <circle cx="62" cy="54" r="14" fill={T} opacity="0.15" stroke={T} strokeWidth="1.5"/>
        <path d="M56 54l4 4 8-8" stroke={T} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    num: 2,
    title: "We match real builders",
    desc: "The system pairs you with reviewers in your niche — people who've shipped, not lurkers. You can hand-pick, too.",
    icon: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect x="8" y="20" width="36" height="26" rx="4" fill="#0f3651" stroke={T} strokeWidth="1.5"/>
        <rect x="14" y="28" width="24" height="2.5" rx="1.25" fill={T} opacity="0.7"/>
        <rect x="14" y="34" width="18" height="2" rx="1" fill="#94a3b8" opacity="0.5"/>
        <path d="M44 32l8 0" stroke={T} strokeWidth="1.5" strokeDasharray="3 2"/>
        <path d="M52 30l4 2-4 2" stroke={T} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="60" cy="28" r="10" fill="#0f3651" stroke={T} strokeWidth="1.5"/>
        <circle cx="60" cy="28" r="4" fill={T} opacity="0.4"/>
        <circle cx="60" cy="52" r="10" fill="#0f3651" stroke={T} strokeWidth="1.5"/>
        <circle cx="60" cy="52" r="4" fill={T} opacity="0.4"/>
      </svg>
    ),
  },
  {
    num: 3,
    title: "Honest feedback within 24h",
    desc: "Get structured feedbacks within 24 hours. Engage with reviewers and improve your product faster.",
    icon: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect x="10" y="22" width="60" height="40" rx="6" fill="#0f3651" stroke={T} strokeWidth="1.5"/>
        <rect x="18" y="32" width="44" height="3" rx="1.5" fill={T} opacity="0.6"/>
        <rect x="18" y="39" width="36" height="2.5" rx="1.25" fill="#94a3b8" opacity="0.4"/>
        <rect x="18" y="45" width="28" height="2.5" rx="1.25" fill="#94a3b8" opacity="0.4"/>
        {[0, 1, 2, 3].map(i => (
          <path key={i} d={`M${18 + i * 8} 55 L${21 + i * 8} 50 L${24 + i * 8} 55`} fill="#f59e0b" stroke="#f59e0b" strokeWidth="0.5"/>
        ))}
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ background: BG, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <FadeIn>
          <div style={{ marginBottom: 64, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 2, background: T }} />
              <span style={{ color: T, fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>THE FLOW</span>
            </div>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, color: TEXT, lineHeight: 1.15, letterSpacing: "-1px" }}>
              Three Steps from Shipping To{" "}
              <span style={{ color: T }}>Traction</span>
            </h2>
            <p style={{ color: MUTED, fontSize: 16, marginTop: 16, maxWidth: 520, margin: "16px auto 0" }}>
              Simple, transparent process from submission to actionable feedback.
            </p>
          </div>
        </FadeIn>

        {/* Steps grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, position: "relative" }}>
          {/* Dashed connector line */}
          <div style={{
            position: "absolute", top: 120, left: "16.5%", right: "16.5%",
            borderTop: `2px dashed ${T}`, opacity: 0.35, pointerEvents: "none",
          }} />

          {STEPS.map((s, i) => (
            <FadeIn key={i} delay={0.1 + i * 0.15}>
              <div style={{ textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                  {s.icon}
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: T, color: DARKER,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 20, margin: "0 auto 20px",
                  boxShadow: `0 0 24px rgba(20,184,166,0.4)`,
                }}>{s.num}</div>
                <h3 style={{ color: TEXT, fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
