"use client";

import FadeIn from "../../Landing/shared/FadeIn";
import { T, MUTED, TEXT, BORDER, CARD } from "../../Landing/shared/tokens";

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
  return (
    <section style={{ padding: "100px 24px", position: "relative" }}>
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

          <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.7, maxWidth: 740, marginBottom: 64 }}>
            Every week, thousands of talented builders ship products to near-zero traction. Not because the product is bad
            — because nobody told them about the pricing confusion, the broken mobile flow, or the onboarding drops.
          </p>
        </FadeIn>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>

          {/* Left: problem cards 2x2 */}
          <FadeIn direction="right">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {PROBLEMS.map((p, i) => (
                <div key={i} style={{
                  background: CARD,
                  border: `1px solid rgba(255,255,255,0.07)`,
                  borderRadius: 16,
                  padding: "24px 20px",
                }}>
                  <div style={{
                    width: 40, height: 40,
                    borderRadius: 10,
                    background: "rgba(20,184,166,0.08)",
                    border: `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 16,
                  }}>
                    {p.icon}
                  </div>
                  <h3 style={{ color: TEXT, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{p.title}</h3>
                  <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.6 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Right: comparison visual + testimonial */}
          <FadeIn direction="left" delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Gap comparison card */}
              <div style={{
                background: CARD,
                border: `1px solid rgba(255,255,255,0.07)`,
                borderRadius: 16,
                padding: "24px",
              }}>
                <p style={{ color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 20 }}>
                  The gap we&apos;re closing
                </p>
                {/* Before */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#ef4444", fontSize: 10, fontWeight: 700 }}>✕</span>
                      </div>
                      <span style={{ color: MUTED, fontSize: 13 }}>Before NexFellow</span>
                    </div>
                    <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 600 }}>Low visibility</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: "22%", height: "100%", background: "#ef4444", borderRadius: 3 }} />
                  </div>
                </div>
                {/* After */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, background: "rgba(20,184,166,0.2)", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: T, fontSize: 10, fontWeight: 700 }}>✓</span>
                      </div>
                      <span style={{ color: MUTED, fontSize: 13 }}>With NexFellow</span>
                    </div>
                    <span style={{ color: T, fontSize: 11, fontWeight: 600 }}>Builders find you</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: "88%", height: "100%", background: T, borderRadius: 3 }} />
                  </div>
                </div>
              </div>

              {/* Testimonial card */}
              <div style={{
                background: CARD,
                border: `1px solid rgba(255,255,255,0.07)`,
                borderRadius: 16,
                padding: "24px",
              }}>
                <div style={{ fontSize: 28, color: T, lineHeight: 1, marginBottom: 12, fontFamily: "Georgia, serif" }}>&ldquo;</div>
                <p style={{ color: TEXT, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                  I shipped my SaaS tool on a Tuesday. By Friday I had 8 detailed reviews, 3 warm intros, and my first paying <em>customer.</em>
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: T,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#051018", fontSize: 13, fontWeight: 700,
                  }}>R</div>
                  <div>
                    <p style={{ color: TEXT, fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Rajan S.</p>
                    <p style={{ color: MUTED, fontSize: 12 }}>Indie Builder</p>
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
