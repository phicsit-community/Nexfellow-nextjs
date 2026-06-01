"use client";

import FadeIn from "../shared/FadeIn";
import { T, BG, MUTED, TEXT, DARKER } from "../shared/tokens";

/* ── Mockup components ─────────────────────────────────────────────── */

function ChatMock() {
  return (
    <div style={{ background: "#0b1c2e", borderRadius: 12, padding: "20px 24px", width: 360, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1e293b", flexShrink: 0 }} />
        <span style={{ color: TEXT, fontSize: 14, fontWeight: 600 }}>Dave from College</span>
      </div>
      <div style={{ background: "rgba(20, 184, 166, 0.15)", borderRadius: "10px 10px 10px 2px", padding: "12px 16px", color: "white", fontSize: 13, lineHeight: 1.55, marginBottom: 16, maxWidth: "90%", border: "1px solid rgba(20, 184, 166, 0.1)" }}>
        Hey man, just finished the MVP. Would love your thoughts when you have a sec!
      </div>
      <div style={{ background: "#1e293b", borderRadius: "10px 10px 2px 10px", padding: "12px 16px", color: "#cbd5e1", fontSize: 13, lineHeight: 1.55, maxWidth: "90%", marginLeft: "auto", textAlign: "left", border: "1px solid rgba(255,255,255,0.03)" }}>
        Looks amazing bro! Great job 🚀<br />Let me know when it launches.
      </div>
    </div>
  );
}

function RedditMock() {
  return (
    <div style={{ background: "#0b1c2e", borderRadius: 12, padding: "20px 24px", width: 380, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 2 }}>
          <span style={{ color: "#64748b", fontSize: 14 }}>↑</span>
          <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 13 }}>-12</span>
          <span style={{ color: "#64748b", fontSize: 14 }}>↓</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>
            u/throwaway_dev99 &nbsp;•&nbsp; 2 hours ago
          </div>
          <div style={{ color: "#f8fafc", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            Honestly this is just another wrapper around ChatGPT. Why would anyone pay $10/mo for this when you can just use the API? Hard pass.
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <span style={{ color: "#64748b", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Reply
            </span>
            <span style={{ color: "#64748b", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> Share
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardMock() {
  return (
    <div style={{ background: "#0b1c2e", borderRadius: 12, padding: "20px 24px", width: 360, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ color: "#64748b", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
          Today's Leaderboard
        </span>
        <span style={{ color: "#ef4444", fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}>
          ⏱ 23:59:58
        </span>
      </div>
      {[
        { rank: "#37", name: "Your App", votes: 14, highlight: true },
        { rank: "#38", name: "Another Template", votes: 12, highlight: false },
      ].map((item, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 14px", borderRadius: 8, marginBottom: 8,
          background: item.highlight ? "rgba(20,184,166,0.08)" : "rgba(255,255,255,0.03)",
          border: item.highlight ? `1px solid rgba(20,184,166,0.2)` : "1px solid rgba(255,255,255,0.04)",
        }}>
          <span style={{ color: "#64748b", fontSize: 13 }}>
            {item.rank}&nbsp;&nbsp;
            <span style={{ color: item.highlight ? TEXT : "#64748b", fontWeight: item.highlight ? 500 : 400 }}>{item.name}</span>
          </span>
          <span style={{ color: item.highlight ? T : "#64748b", fontSize: 13, fontWeight: 600 }}>
            {item.votes}
          </span>
        </div>
      ))}
    </div>
  );
}

function DMMock() {
  return (
    <div style={{ background: "#0b1c2e", borderRadius: 12, padding: "20px 24px", width: 360, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>SJ</div>
        <div>
          <div style={{ color: TEXT, fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Sarah Jenkins</div>
          <div style={{ color: "#64748b", fontSize: 12 }}>Product Lead @ TechCorp</div>
        </div>
      </div>
      <div style={{ background: "#1e293b", borderRadius: "8px 8px 8px 2px", padding: "12px 16px", color: "#cbd5e1", fontSize: 13, lineHeight: 1.65, marginBottom: 12, border: "1px solid rgba(255,255,255,0.03)" }}>
        Hi Sarah, I saw your post about workflow inefficiencies. I've been building a tool that solves exactly this. Would you be open to a 10-min chat to see if it makes sense for your team?
      </div>
      <div style={{ color: "#64748b", fontSize: 11, textAlign: "right" }}>Sent 3 days ago &nbsp;✓ Seen</div>
    </div>
  );
}

/* ── Problem data ──────────────────────────────────────────────────── */

const PROBLEMS = [
  {
    num: "01",
    title: 'Friends say "looks great!"',
    body: "They don't want to hurt your feelings. They've never built anything either. Their encouragement is kind, but it isn't validation.",
    flip: false,
    Mock: ChatMock,
  },
  {
    num: "02",
    title: "Reddit tears it apart",
    body: "Anonymous strangers with no skin in the game. The criticism stings but rarely tells you what to actually fix. Noise masquerading as critique.",
    flip: true,
    Mock: RedditMock,
  },
  {
    num: "03",
    title: "The Launch is a 24-hour sprint",
    body: "A leaderboard for badges, not a community for builders. By Wednesday morning, your launch is buried under a dozen new AI templates.",
    flip: false,
    Mock: LeaderboardMock,
  },
  {
    num: "04",
    title: "Cold DMs feel desperate",
    body: "You don't have warm intros, co-marketing partners, or a network watching for competitive moves. Solo is hard. Isolation is the enemy of growth.",
    flip: true,
    Mock: DMMock,
  },
];

/* ── Component ─────────────────────────────────────────────────────── */

export default function TheProblem() {
  return (
    <>
    <section style={{ background: BG, padding: "100px 24px" }} className="the-problem-section">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <FadeIn>
          <div style={{ marginBottom: 72 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 2, background: T }} />
              <span style={{ color: T, fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>THE PROBLEM</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 800, color: TEXT, lineHeight: 1.15, letterSpacing: "-1px", maxWidth: 640 }}>
              Building is the easy part.{" "}
              <span style={{ color: T }}>Getting heard</span>{" "}
              is where most products die.
            </h2>
          </div>
        </FadeIn>

        {/* Problem rows — timeline layout */}
        <div className="problem-timeline" style={{ position: "relative", display: "flex", flexDirection: "column", gap: 64, marginTop: 64, paddingBottom: 64 }}>
          {/* Vertical line down the middle */}
          <div className="problem-timeline-line" style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            width: 1,
            background: "rgba(255,255,255,0.06)",
            transform: "translateX(-50%)",
            zIndex: 0
          }} />

          {PROBLEMS.map((p, i) => {
            const isLeftText = !p.flip;
            return (
              <FadeIn key={i} delay={0.1 + i * 0.1}>
                {/* Desktop: side-by-side | Mobile: stacked */}
                <div className="problem-row" style={{
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                  width: "100%",
                }}>
                  {/* Left Side */}
                  <div className="problem-side" style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "flex-end",
                    paddingRight: 48,
                  }}>
                    {isLeftText ? (
                      <div className="text-content" style={{ maxWidth: 360, textAlign: "right" }}>
                        <h3 style={{ color: TEXT, fontSize: 26, fontWeight: 700, lineHeight: 1.3, marginBottom: 16 }}>
                          {p.title}
                        </h3>
                        <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7 }}>
                          {p.body}
                        </p>
                      </div>
                    ) : (
                      <div className="mock-wrapper" style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                        <p.Mock />
                      </div>
                    )}
                  </div>

                  {/* Center Node */}
                  <div className="problem-node" style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 32,
                    height: 32,
                    borderRadius: 4,
                    background: "#0b1c2e",
                    border: `1px solid rgba(255,255,255,0.1)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: MUTED,
                    fontSize: 12,
                    fontWeight: 600,
                    zIndex: 2,
                  }}>
                    {p.num}
                  </div>

                  {/* Right Side */}
                  <div className="problem-side" style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "flex-start",
                    paddingLeft: 48,
                  }}>
                    {!isLeftText ? (
                      <div className="text-content" style={{ maxWidth: 360, textAlign: "left" }}>
                        <h3 style={{ color: TEXT, fontSize: 26, fontWeight: 700, lineHeight: 1.3, marginBottom: 16 }}>
                          {p.title}
                        </h3>
                        <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7 }}>
                          {p.body}
                        </p>
                      </div>
                    ) : (
                      <div className="mock-wrapper" style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
                        <p.Mock />
                      </div>
                    )}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Bottom testimonial */}
        <FadeIn delay={0.4}>
          <div className="problem-testimonial-outer" style={{
            position: "relative",
            margin: "72px auto 0",
            padding: "48px 40px",
            textAlign: "center",
            maxWidth: 800,
          }}>
          <div className="problem-testimonial-inner" style={{border:`2px solid ${T}`, padding:"40px 32px", maxWidth: 1000, margin:"0 auto", position: "relative"}}>
            {/* Corner brackets (moved inside border container, offset slightly outward) */}
            <div style={{ position: "absolute", top: -12, left: -12, width: 24, height: 24, borderTop: `2px solid ${T}`, borderLeft: `2px solid ${T}`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: -12, right: -12, width: 24, height: 24, borderTop: `2px solid ${T}`, borderRight: `2px solid ${T}`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -12, left: -12, width: 24, height: 24, borderBottom: `2px solid ${T}`, borderLeft: `2px solid ${T}`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -12, right: -12, width: 24, height: 24, borderBottom: `2px solid ${T}`, borderRight: `2px solid ${T}`, pointerEvents: "none" }} />
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: 36, color: T, lineHeight: 1, marginBottom: 24, fontWeight: "serif" }}>
              <svg width="25" height="17" viewBox="0 0 25 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.6077 16.9615L6.12982 10.8316C6.04327 10.8797 5.9423 10.9134 5.82691 10.9326C5.71152 10.9518 5.59612 10.9615 5.48073 10.9615C3.95574 10.9615 2.66104 10.4248 1.59662 9.3515C0.532207 8.27819 0 6.98793 0 5.48073C0 3.95574 0.532207 2.66104 1.59662 1.59662C2.66104 0.532207 3.95574 0 5.48073 0C6.98793 0 8.27819 0.532207 9.3515 1.59662C10.4248 2.66104 10.9615 3.95407 10.9615 5.47571C10.9615 6.00598 10.8975 6.49803 10.7696 6.95188C10.6418 7.40572 10.4547 7.83841 10.2086 8.24994L5.19225 16.9615H2.6077ZM15.9346 16.9615L19.4567 10.8316C19.3702 10.8797 19.2692 10.9134 19.1538 10.9326C19.0384 10.9518 18.923 10.9615 18.8076 10.9615C17.2827 10.9615 15.9879 10.4248 14.9235 9.3515C13.8591 8.27819 13.3269 6.98793 13.3269 5.48073C13.3269 3.94612 13.8591 2.64902 14.9235 1.58941C15.9879 0.529804 17.2827 0 18.8076 0C20.3148 0 21.6051 0.532207 22.6784 1.59662C23.7517 2.66104 24.2884 3.95407 24.2884 5.47571C24.2884 6.00598 24.2244 6.49803 24.0965 6.95188C23.9687 7.40572 23.7816 7.83841 23.5355 8.24994L18.5192 16.9615H15.9346ZM2.64453 2.5C3.41377 2.5 6.90383 7.98077 7.4423 7.4423C7.98077 6.90383 8.25 6.24997 8.25 5.48073C8.25 4.71149 8.78847 8.03847 8.25 7.5C7.71153 6.96153 6.24997 9 5.48073 9C4.71149 9 4.05763 2.9807 3.51917 3.51917C2.9807 4.05763 5.64453 8.58226 5.64453 9.3515C5.64453 10.1207 3.60606 6.46153 4.14453 7C4.683 7.53847 1.87529 2.5 2.64453 2.5ZM18.6445 4C19.4138 4 20.2307 7.98077 20.7692 7.4423C21.3077 6.90383 15.1445 6.26924 15.1445 5.5C15.1445 4.73076 20.683 5.03847 20.1445 4.5C19.6061 3.96153 22.4138 6 21.6445 6C20.8753 6 21.683 6.96153 21.1445 7.5C20.6061 8.03847 16.0384 4.71149 16.0384 5.48073C16.0384 6.24997 16.1061 4.96153 16.6445 5.5C17.183 6.03847 17.8753 4 18.6445 4Z" fill="#5AD9DA" />
              </svg>
            </div>
            <p className="problem-quote-text" style={{ color: TEXT, fontSize: 18, lineHeight: 1.85, fontStyle: "italic", marginBottom: 32 }}>
              "Before NexFellow, I shipped 4 products that quietly failed. The problem wasn’t the idea. It was building alone. Honest feedback from founders helped me get my first 40 paying users in 6 weeks."
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              {/* Replace with image if you have one, using RP placeholder for now */}
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${T}, #0f766e)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: DARKER }}>RP</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: T, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px" }}>Founder · NexFellow Member</div>
              </div>
            </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>

    <style>{`
      @media (max-width: 768px) {
        .the-problem-section { padding: 48px 16px !important; }

        .problem-timeline { gap: 24px !important; }

        .problem-timeline-line { display: block !important; }

        .problem-row {
          flex-direction: row !important;
          align-items: center !important;
          padding: 20px 0 !important;
        }

        .problem-node {
          position: absolute !important;
          transform: translate(-50%, -50%) !important;
          width: 28px !important;
          height: 28px !important;
          font-size: 10px !important;
          z-index: 2 !important;
        }

        .problem-side:first-child {
          padding-right: 18px !important;
          padding-left: 0 !important;
          overflow: hidden !important;
        }

        .problem-side:last-child {
          padding-left: 18px !important;
          padding-right: 0 !important;
          overflow: hidden !important;
        }

        .text-content {
          max-width: 100% !important;
        }

        .text-content h3 {
          font-size: 16px !important;
          margin-bottom: 10px !important;
          line-height: 1.3 !important;
        }

        .text-content p {
          font-size: 12px !important;
          line-height: 1.55 !important;
        }

        /* 0.48 zoom: 360px mock → 173px wide, fits in each half of a 412px screen */
        .mock-wrapper {
          zoom: 0.48 !important;
          display: block !important;
        }

        .problem-testimonial-outer {
          margin-top: 40px !important;
          padding: 16px 12px !important;
        }
        .problem-testimonial-inner {
          padding: 24px 20px !important;
        }
        .problem-quote-text {
          font-size: 14px !important;
          line-height: 1.7 !important;
          margin-bottom: 20px !important;
        }
      }
    `}</style>
    </>
  );
}
