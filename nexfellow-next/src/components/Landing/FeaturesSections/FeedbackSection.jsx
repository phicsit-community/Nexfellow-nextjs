"use client";

import FadeIn from "../shared/FadeIn";
import { T, BG, BG2, MUTED, TEXT, BORDER, BORDER2, CARD } from "../shared/tokens";

const REVIEWS = [
  {
    initials: "AS", gradient: ["#14b8a6", "#0f766e"],
    name: "Arjun S.", score: 4.0, time: "2 hr ago", tag: "UNREAD",
    text: "The pricing page caused confusion — Starter vs Pro difference isn't clear. A comparison table would help. CTA on mobile is below the fold on small screens.",
    badges: [{ label: "UX", color: "#3b82f6" }, { label: "PRICING", color: "#f59e0b" }, { label: "MOBILE", color: "#8b5cf6" }],
  },
  {
    initials: "PM", gradient: ["#22c55e", "#16a34a"],
    name: "Priya M.", score: 5.0, time: "5 hr ago", tag: null,
    text: "The AI suggestions genuinely saved me time. Really polished — onboarding video is a nice touch.",
    badges: [{ label: "POSITIVE", color: "#22c55e" }],
  },
  {
    initials: "JH", gradient: ["#6366f1", "#4f46e5"],
    name: "James H.", score: null, time: null, tag: null,
    text: "Solid foundation, but lacking some integration options I need for my ...",
    badges: [],
  },
];

const STAT_BADGES = [
  { label: "10", sublabel: "REVIEWS" },
  { label: "4.6", sublabel: "AVG SCORE", color: "#22c55e" },
  { label: "UX", sublabel: "TOP THEME", color: "#f59e0b" },
];

function StarRating({ score }) {
  if (!score) return null;
  const full = Math.floor(score);
  return (
    <span style={{ color: "#f59e0b", fontSize: 11, letterSpacing: 1 }}>
      {"★".repeat(full)}{"☆".repeat(5 - full)}
    </span>
  );
}

export default function FeedbackSection() {
  return (
    <section style={{ background: BG2, padding: "120px 24px", position: "relative", overflow: "hidden" }}>

      {/* Big background number */}
      <div style={{
        position: "absolute", left: "-2%", top: "50%", transform: "translateY(-50%)",
        fontSize: "clamp(200px, 30vw, 420px)", fontWeight: 900,
        color: "rgba(20,184,166,0.04)", lineHeight: 1,
        pointerEvents: "none", userSelect: "none",
        fontVariantNumeric: "tabular-nums",
      }}>
        10
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", position: "relative", zIndex: 1 }}>

        {/* Left — feedback UI mockup */}
        <FadeIn>
          <div style={{
            background: "rgba(7,26,44,0.95)", border: `1px solid ${BORDER}`,
            borderRadius: 16, overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          }}>
            {/* Window bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 16px", borderBottom: `1px solid ${BORDER2}` }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ color: MUTED, fontSize: 10, marginLeft: 8 }}>Feedback — ShipLog</span>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderBottom: `1px solid ${BORDER2}` }}>
              {STAT_BADGES.map((b, i) => (
                <div key={i} style={{ padding: "16px 12px", textAlign: "center", borderRight: i < 2 ? `1px solid ${BORDER2}` : "none" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: b.color || TEXT, letterSpacing: "-0.5px" }}>{b.label}</div>
                  <div style={{ fontSize: 9, color: MUTED, letterSpacing: "1px", fontWeight: 600, marginTop: 2 }}>{b.sublabel}</div>
                </div>
              ))}
            </div>

            {/* Reviews */}
            {REVIEWS.map((r, i) => (
              <div key={i} style={{
                padding: "14px 16px",
                borderBottom: i < REVIEWS.length - 1 ? `1px solid ${BORDER2}` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${r.gradient[0]}, ${r.gradient[1]})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "#051018", flexShrink: 0,
                  }}>
                    {r.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: TEXT, fontSize: 12, fontWeight: 600 }}>{r.name}</span>
                      {r.score && <StarRating score={r.score} />}
                      {r.score && <span style={{ color: MUTED, fontSize: 10 }}>·</span>}
                      {r.time && <span style={{ color: MUTED, fontSize: 10 }}>{r.time}</span>}
                    </div>
                  </div>
                  {r.tag && (
                    <span style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", fontSize: 9, fontWeight: 700, borderRadius: 6, padding: "2px 7px", border: "1px solid rgba(239,68,68,0.3)" }}>
                      {r.tag}
                    </span>
                  )}
                </div>
                <p style={{ color: MUTED, fontSize: 11.5, lineHeight: 1.5, marginBottom: r.badges.length ? 8 : 0 }}>{r.text}</p>
                {r.badges.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {r.badges.map((b, j) => (
                      <span key={j} style={{
                        fontSize: 9, fontWeight: 700, borderRadius: 6, padding: "2px 7px",
                        background: `${b.color}22`, color: b.color, border: `1px solid ${b.color}44`,
                      }}>
                        {b.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Right — text */}
        <FadeIn delay={0.2}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <span style={{ color: T, fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Feedback &amp; Validation</span>
              <div style={{ width: 28, height: 2, background: T }} />
            </div>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 52px)", fontWeight: 800, color: TEXT, lineHeight: 1.12, letterSpacing: "-1px", marginBottom: 24 }}>
              <span style={{ color: "#a78bfa" }}>10 real reviews</span>
              <br />in{" "}
              <span style={{ color: T }}>72 hours.</span>
              <br /><span style={{ color: TEXT }}>From builders.</span>
            </h2>
            <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.75, marginBottom: 28, maxWidth: 420 }}>
              Submit your product and get matched with builders in your niche. Not random users — people who've shipped something themselves and know what to look for. Every review is quality-weighted by the platform gets penalized. Substance gets rewarded.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  background: "rgba(20,184,166,0.12)", color: T,
                  border: `1px solid ${BORDER}`, borderRadius: 20,
                  fontSize: 12, fontWeight: 600, padding: "5px 14px",
                }}>
                  8-10 reviews in 72 hrs
                </span>
                <span style={{
                  background: "rgba(20,184,166,0.12)", color: T,
                  border: `1px solid ${BORDER}`, borderRadius: 20,
                  fontSize: 12, fontWeight: 600, padding: "5px 14px",
                }}>
                  Quality-weighted scoring
                </span>
              </div>
              <span style={{
                display: "inline-flex",
                background: "rgba(20,184,166,0.08)", color: MUTED,
                border: `1px solid ${BORDER}`, borderRadius: 20,
                fontSize: 12, fontWeight: 600, padding: "5px 14px",
                alignSelf: "flex-start",
              }}>
                Tagged by theme (UX, Pricing, Mobile...)
              </span>
            </div>
            <a href="/signup" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: T, color: "#051018",
              padding: "12px 28px", borderRadius: 100, fontWeight: 700, fontSize: 15, textDecoration: "none",
            }}>
              See Feedback <span>→</span>
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
