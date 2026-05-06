"use client";

import FadeIn from "../../Landing/shared/FadeIn";
import { T, MUTED, TEXT, CARD, BORDER } from "../../Landing/shared/tokens";

const VALUES = [
  {
    metric: "METRIC: #1",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
    title: "Quality over noise",
    body: "We rate feedback by helpfulness, not volume. One honest review from a fellow builder beats 100 hollow upvotes.",
  },
  {
    metric: "METRIC: #2",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: "Builder-first always",
    body: "Every feature decision starts with one question: does this make a solo builder's life meaningfully better?",
  },
  {
    metric: "METRIC: #3",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "Radical transparency",
    body: "Fellow Score is public. Feedback is real. Referral rewards are clear. No dark patterns, no opaque algorithms.",
  },
  {
    metric: "METRIC: #4",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V22H4V12" />
        <path d="M22 7H2v5h20V7z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
    title: "Give first",
    body: "The credit economy is built on reciprocity. The more you contribute, the more the platform unlocks for you.",
  },
  {
    metric: "METRIC: #5",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Earned trust, not bought",
    body: "Verified badges, Fellow Score, and Early Adopter listings — all earned through real actions, never purchased.",
  },
  {
    metric: "METRIC: #6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Long-term thinking",
    body: "We're not building for Product Hunt launches. We're building the infrastructure for the next decade of Indie SaaS.",
  },
];

export default function SixThingsSection() {
  return (
    <section style={{ padding: "100px 24px", position: "relative" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 28, height: 1, background: MUTED }} />
            <span style={{ color: MUTED, fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>What We Stand For</span>
          </div>

          <h2 style={{
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 800,
            color: TEXT,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            marginBottom: 64,
          }}>
            Six things we refuse to{" "}
            <em style={{ fontStyle: "normal", color: T }}>compromise on</em>
          </h2>
        </FadeIn>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}>
          {VALUES.map((v, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <div style={{
                background: CARD,
                border: `1px solid rgba(255,255,255,0.07)`,
                borderRadius: 16,
                padding: "24px",
                height: "100%",
                position: "relative",
              }}>
                {/* Metric badge top-right */}
                <div style={{
                  position: "absolute", top: 16, right: 16,
                  display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2,
                }}>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, fontWeight: 600, letterSpacing: "0.5px" }}>{v.metric}</span>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, fontWeight: 600, letterSpacing: "0.5px" }}>STATE: STABLE</span>
                </div>

                {/* Icon */}
                <div style={{
                  width: 44, height: 44,
                  borderRadius: 12,
                  background: "rgba(20,184,166,0.08)",
                  border: `1px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}>
                  {v.icon}
                </div>

                <h3 style={{ color: TEXT, fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{v.title}</h3>
                <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.65 }}>{v.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
