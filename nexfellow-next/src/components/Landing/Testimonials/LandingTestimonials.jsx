"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import FadeIn from "../shared/FadeIn";
import { T, BG, CARD, MUTED, TEXT, BORDER, BORDER2, DARKER } from "../shared/tokens";
import styles from "./LandingTestimonials.module.css";

const SIDE_CARDS = [
  {
    name: "Marcus Chen", role: "Lead DevOps, SentinelFlow", avatar: "MC",
    grad: "linear-gradient(135deg, #7c3aed, #2563eb)",
    quote: "Cut three useless features after one round. Saved me a quarter of work.",
  },
  {
    name: "Sarah Jenkins", role: "VP Engineering, CipherTech", avatar: "SJ",
    grad: "linear-gradient(135deg, #7c3aed, #2563eb)",
    quote: "Found my technical co-founder on BuilderMap. We shipped v1 together six weeks later.",
  },
  {
    name: "David Okonkwo", role: "CTO, Monitor Systems", avatar: "DO",
    grad: "linear-gradient(135deg, #7c3aed, #2563eb)",
    quote: "Builders ask the questions investors should be asking. The signal-to-noise is unreal!",
  },
  {
    name: "Priya Sharma", role: "Indie Hacker, ProductHunt Top 5", avatar: "PS",
    grad: "linear-gradient(135deg, #ec4899, #8b5cf6)",
    quote: "First week on NexFellow I got feedback that would've taken months from a focus group. Worth every second.",
  },
  {
    name: "Alex Thompson", role: "Founder, LaunchStack", avatar: "AT",
    grad: "linear-gradient(135deg, #f59e0b, #ef4444)",
    quote: "The builders here actually care. Genuine critique, not empty validation. My conversion rate doubled.",
  },
  {
    name: "Nina Patel", role: "CPO, DevPulse", avatar: "NP",
    grad: "linear-gradient(135deg, #14b8a6, #0ea5e9)",
    quote: "NexFellow replaced three paid user-research tools for us. Faster, deeper, and brutally honest.",
  },
];

const LOOPED = [...SIDE_CARDS, ...SIDE_CARDS];

export default function LandingTestimonials() {
  const [paused, setPaused] = useState(false);
  const leftCardRef = useRef(null);
  const [marqueeHeight, setMarqueeHeight] = useState(null);

  /* Mirror left card's height into the right marquee */
  useEffect(() => {
    const el = leftCardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setMarqueeHeight(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
    <section style={{ background: BG, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <FadeIn>
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 2, background: T }} />
              <span style={{ color: T, fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>BUILDERS ON NEXFELLOW</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 800, color: TEXT, lineHeight: 1.15, letterSpacing: "-1px" }}>
              The kind of feedback you can't buy with{" "}
              <span style={{ color: T }}>ad spend.</span>
            </h2>
            <p style={{ color: MUTED, fontSize: 15, maxWidth: 570, marginTop: 12 }}>
              Hear from the teams building the next generation of resilient infrastructure with NexFellow's platform.
            </p>
          </div>
        </FadeIn>

        <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Featured card — ref measures its rendered height (desktop only) */}
          <div className={styles.desktopMarquee}>
          <FadeIn delay={0.1}>
            <div
              ref={leftCardRef}
              style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 32 }}
            >
              <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                {[1,2,3,4,5].map(i => <span key={i} style={{ color: "#f59e0b", fontSize: 16 }}>★</span>)}
              </div>
              <p style={{ color: TEXT, fontSize: 23, lineHeight: 1.8, marginBottom: 24, fontStyle: "italic" }}>
                "I shared my landing page after weeks of almost no signups. People pointed out issues in pricing, copy, and clarity that I had missed. I fixed a few things and started getting my first real users within a week."
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${T}, #0f766e)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: DARKER }}>EW</div>
                  <div>
                    <div style={{ color: TEXT, fontWeight: 600 }}>Dr. Ethan Walker</div>
                    <div style={{ color: MUTED, fontSize: 13 }}>India Hacker, SaaS Builder</div>
                  </div>
                </div>
                <Link href="#" style={{ color: T, fontSize: 13, textDecoration: "none", fontWeight: 500, whiteSpace: "nowrap" }}>Read Full Case Study →</Link>
              </div>
            </div>
          </FadeIn>
          </div>{/* end featured card desktopMarquee */}

          {/* Right side — upward marquee, height locked to left card (desktop only) */}
          <div className={styles.desktopMarquee}>
          <FadeIn delay={0.15} direction="left">
            <div style={{
              position: "relative",
              height: marqueeHeight ?? 380,
              overflow: "hidden",
            }}>
              {/* Top fade */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 72,
                background: `linear-gradient(to bottom, ${BG} 0%, transparent 100%)`,
                zIndex: 2, pointerEvents: "none",
              }} />
              {/* Bottom fade */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 20,
                background: `linear-gradient(to top, ${BG} 0%, transparent 100%)`,
                zIndex: 2, pointerEvents: "none",
              }} />

              {/* Scrolling track */}
              <div
                className={`${styles.track}${paused ? ` ${styles.paused}` : ""}`}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                {LOOPED.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      background: CARD, border: `1px solid ${BORDER2}`,
                      borderRadius: 16, padding: 20, flexShrink: 0,
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(20,184,166,0.35)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = BORDER2}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: "50%",
                        background: t.grad,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 12, color: "white", flexShrink: 0,
                      }}>
                        {t.avatar}
                      </div>
                      <div>
                        <div style={{ color: TEXT, fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                        <div style={{ color: MUTED, fontSize: 12, marginBottom: 8 }}>{t.role}</div>
                        <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.6, margin: 0 }}>"{t.quote}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
          </div>{/* end desktopMarquee */}

        </div>{/* end testimonials-grid */}

        {/* Mobile horizontal marquee — left-to-right infinite scroll */}
        <div className={styles.mobileMarqueeWrapper}>
          <div
            className={`${styles.mobileTrack}${paused ? ` ${styles.mobilePaused}` : ""}`}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            {LOOPED.map((t, i) => (
              <div
                key={i}
                className={styles.mobileCard}
                style={{
                  background: CARD, border: `1px solid ${BORDER2}`,
                  borderRadius: 16, padding: 20,
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: t.grad,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 12, color: "white", flexShrink: 0,
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ color: TEXT, fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: MUTED, fontSize: 12, marginBottom: 8 }}>{t.role}</div>
                    <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.6, margin: 0 }}>"{t.quote}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>

    <style>{`
      @media (max-width: 768px) {
        .testimonials-grid {
          grid-template-columns: 1fr !important;
        }
      }
    `}</style>
    </>
  );
}
