"use client";

import FadeIn from "../../Landing/shared/FadeIn";
import { T, MUTED, TEXT, BORDER } from "../../Landing/shared/tokens";
import { useIsMobile } from "../../Landing/shared/useIsMobile";

const PROBLEMS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    ),
    title: "Shipping into silence",
    body: "Most products get fewer than 50 visitors in their first month. Real users, not vanity metrics, are impossible to find.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: "Building alone",
    body: "Solo founders have no warm intros, no one watching for competitive moves. The network gap is real.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Gatekept distribution",
    body: "Product Hunt is a pay-to-win leaderboard. There's no platform built specifically for builders.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Zero honest feedback",
    body: "Friends say 'looks great.' Reddit tears it apart. Builders need qualified, specific feedback.",
  },
];

export default function ProblemSection() {
  const isMobile = useIsMobile();

  return (
    <section style={{ padding: isMobile ? "60px 20px" : "100px 24px", position: "relative" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Section label */}
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 28, height: 1, background: MUTED }} />
            <span style={{ color: MUTED, fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Why We Exist</span>
          </div>

          <h2 style={{
            fontSize: "clamp(28px, 5vw, 54px)",
            fontWeight: 800,
            color: TEXT,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            marginBottom: 8,
          }}>
            The AI SaaS market is flooded.
          </h2>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 54px)",
            fontWeight: 800,
            color: T,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            marginBottom: 32,
          }}>
            Distribution is broken.
          </h2>

          <p style={{ color: MUTED, fontSize: isMobile ? 15 : 16, lineHeight: 1.7, maxWidth: 740, marginBottom: isMobile ? 40 : 64 }}>
            Thousands of builders ship great products every week and still get zero traction. Most don’t fail because of the idea. They fail because nobody gives honest feedback. That’s why NexFellow exists.
          </p>
        </FadeIn>

        {/* Two-column layout → single column on mobile */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>

          {/* Problem cards 2x2 */}
          <FadeIn direction="right" style={{ height: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: "100%", alignContent: "stretch" }}>
              {PROBLEMS.map((p, i) => (
                <div key={i} style={{
                  background: "#0d2035",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: isMobile ? "18px 14px" : "22px 18px",
                  display: "flex",
                  flexDirection: "column",
                }}>
                  <div style={{
                    width: 38, height: 38,
                    borderRadius: 10,
                    background: "rgba(20,184,166,0.08)",
                    border: `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 14,
                    flexShrink: 0,
                  }}>
                    {p.icon}
                  </div>
                  <h3 style={{ color: TEXT, fontSize: 13, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{p.title}</h3>
                  <p style={{ color: MUTED, fontSize: 12, lineHeight: 1.6, margin: 0 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Right: outer card with glow + nested inner card + testimonial */}
          <FadeIn direction="left" delay={0.1} style={{ height: "100%" }}>
            <div style={{
              background: "#0a1929",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Top-right glow */}
              <div style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(20,184,166,0.22) 0%, rgba(20,184,166,0.06) 50%, transparent 70%)",
                pointerEvents: "none",
              }} />

              {/* Inner nested card */}
              <div style={{
                background: "#0d2035",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 12,
                padding: "20px 18px",
                marginBottom: 24,
                position: "relative",
                zIndex: 1,
              }}>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 20 }}>
                  The gap we&apos;re closing
                </p>

                {/* Before NexFellow */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4,
                        background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ color: "#ef4444", fontSize: 9, fontWeight: 900 }}>✕</span>
                      </div>
                      <span style={{ color: MUTED, fontSize: 13 }}>Before NexFellow</span>
                    </div>
                    <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 600 }}>Low visibility</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 99 }}>
                    <div style={{ width: "18%", height: "100%", background: "#ef4444", borderRadius: 99 }} />
                  </div>
                </div>

                {/* With NexFellow */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4,
                        background: "rgba(20,184,166,0.12)", border: `1px solid ${BORDER}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ color: T, fontSize: 9, fontWeight: 900 }}>✓</span>
                      </div>
                      <span style={{ color: MUTED, fontSize: 13 }}>With NexFellow</span>
                    </div>
                    <span style={{ color: T, fontSize: 11, fontWeight: 600 }}>Builders find you</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 99 }}>
                    <div style={{ width: "85%", height: "100%", background: T, borderRadius: 99 }} />
                  </div>
                </div>
              </div>

              {/* Testimonial card */}
              <div style={{
                background: "#0d2035",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 12,
                padding: "20px 18px",
                position: "relative",
                zIndex: 1,
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}>
                <div style={{
                  fontSize: 36, lineHeight: 1,
                  color: "rgba(255,255,255,0.18)",
                  fontFamily: "Georgia, serif",
                  marginBottom: 10,
                }}>&ldquo;&rdquo;</div>
                <p style={{ color: TEXT, fontSize: 14, lineHeight: 1.75, fontStyle: "italic", marginBottom: 20, flex: 1 }}>
                  I shipped my SaaS tool on a Tuesday. By Friday I had 8 detailed reviews, 3 warm intros, and my first paying{" "}
                  <em style={{ fontStyle: "normal", fontWeight: 700 }}>customer.</em>
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "rgba(20,184,166,0.15)",
                    border: `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: T, fontSize: 13, fontWeight: 700, flexShrink: 0,
                  }}>R</div>
                  <div>
                    <p style={{ color: TEXT, fontSize: 13, fontWeight: 700, marginBottom: 1 }}>Michael Torres</p>
                    <p style={{ color: MUTED, fontSize: 12 }}>Indie Hacker</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
