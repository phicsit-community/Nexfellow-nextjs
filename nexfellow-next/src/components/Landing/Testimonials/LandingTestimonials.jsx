"use client";

import Link from "next/link";
import FadeIn from "../shared/FadeIn";
import { T, BG, CARD, MUTED, TEXT, BORDER, BORDER2, DARKER } from "../shared/tokens";

const SIDE_CARDS = [
  { name: "Marcus Chen",   role: "Lead DevOps, SentinelFlow",  quote: "Cut three useless features after one round. Saved me a quarter of work.",                    avatar: "MC" },
  { name: "Sarah Jenkins", role: "VP Engineering, CipherTech", quote: "Found my technical co-founder on BuilderMap. We shipped v1 together six weeks later.",        avatar: "SJ" },
  { name: "David Okonkwo", role: "CTO, Monitor Systems",       quote: "Builders ask the questions investors should be asking. The signal-to-noise is unreal!",       avatar: "DO" },
];

export default function LandingTestimonials() {
  return (
    <section style={{ background: BG, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <FadeIn>
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 2, background: T }} />
              <span style={{ color: T, fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>BUILDERS ON NEXFELLOW</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 800, color: TEXT, lineHeight: 1.15, letterSpacing: "-1px", maxWidth: 640 }}>
              The kind of feedback you can't buy with{" "}
              <span style={{ color: T }}>ad spend.</span>
            </h2>
            <p style={{ color: MUTED, fontSize: 15, maxWidth: 520, marginTop: 12 }}>
              Hear from the teams building the next generation of resilient infrastructure with NexFellow's platform.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Featured */}
          <FadeIn delay={0.1}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 32, height: "100%" }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                {[1,2,3,4,5].map(i => <span key={i} style={{ color: "#f59e0b", fontSize: 16 }}>★</span>)}
              </div>
              <p style={{ color: TEXT, fontSize: 16, lineHeight: 1.8, marginBottom: 24, fontStyle: "italic" }}>
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

          {/* Side cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {SIDE_CARDS.map((t, i) => (
              <FadeIn key={i} delay={0.15 + i * 0.1} direction="left">
                <div style={{ background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 16, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "white", flexShrink: 0 }}>{t.avatar}</div>
                    <div>
                      <div style={{ color: TEXT, fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                      <div style={{ color: MUTED, fontSize: 12, marginBottom: 8 }}>{t.role}</div>
                      <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.6, margin: 0 }}>"{t.quote}"</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
