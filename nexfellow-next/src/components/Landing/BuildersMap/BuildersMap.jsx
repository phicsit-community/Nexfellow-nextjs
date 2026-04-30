"use client";

import Link from "next/link";
import FadeIn from "../shared/FadeIn";
import { T, BG2, CARD, MUTED, TEXT, BORDER, BORDER2 } from "../shared/tokens";

const MAP_DOTS = [
  [37,28],[44,30],[22,35],[47,38],[55,32],
  [60,42],[50,50],[42,48],[70,38],[75,45],
  [30,55],[25,42],[65,55],[80,30],[15,38],
];
const CONNECTIONS = [
  [[37,28],[47,38]], [[47,38],[60,42]], [[44,30],[55,32]],
];

function WorldMap() {
  return (
    <svg viewBox="0 0 100 65" style={{ width: "100%", maxWidth: 700, opacity: 0.8 }}>
      {/* Grid lines */}
      {[20,30,40,50].map(y => <line key={`h${y}`} x1="5" y1={y} x2="95" y2={y} stroke={BORDER2} strokeWidth="0.2"/>)}
      {[20,35,50,65,80].map(x => <line key={`v${x}`} x1={x} y1="5" x2={x} y2="60" stroke={BORDER2} strokeWidth="0.2"/>)}
      {/* Continent outlines */}
      <path d="M8 20 Q15 15 22 18 Q28 20 30 25 Q28 32 22 35 Q15 38 10 34 Q6 28 8 20Z" fill="none" stroke={BORDER} strokeWidth="0.4" opacity="0.6"/>
      <path d="M35 15 Q48 12 55 18 Q60 22 58 30 Q55 38 48 42 Q40 45 35 40 Q30 35 32 25 Q33 18 35 15Z" fill="none" stroke={BORDER} strokeWidth="0.4" opacity="0.6"/>
      <path d="M60 18 Q72 14 80 20 Q85 25 83 35 Q80 42 72 45 Q64 48 60 42 Q56 36 58 26 Q59 20 60 18Z" fill="none" stroke={BORDER} strokeWidth="0.4" opacity="0.6"/>
      <path d="M40 48 Q50 45 55 52 Q55 58 50 60 Q44 62 40 58 Q37 54 40 48Z" fill="none" stroke={BORDER} strokeWidth="0.4" opacity="0.6"/>
      {/* Connection lines */}
      {CONNECTIONS.map(([[x1,y1],[x2,y2]], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={T} strokeWidth="0.3" opacity="0.4"/>
      ))}
      {/* Dot markers */}
      {MAP_DOTS.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="2.5" fill={T} opacity="0.2"/>
          <circle cx={x} cy={y} r="1.2" fill={T} opacity="0.8"/>
        </g>
      ))}
    </svg>
  );
}

const FEATURES = [
  { icon: "🎯", title: "Skill-based matching",  desc: "Algorithmic alignment of technical stack and domain expertise." },
  { icon: "🤝", title: "Warm intros",            desc: "Bypass cold reach with builder-validated trust connections." },
  { icon: "🚀", title: "Co-launch rooms",        desc: "Sync with compatible builders for high-impact distribution sprints." },
];

export default function BuildersMap() {
  return (
    <section style={{ background: BG2, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <FadeIn>
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 2, background: T }} />
              <span style={{ color: T, fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>BUILDERS MAP</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 800, color: TEXT, lineHeight: 1.15, letterSpacing: "-1px", maxWidth: 700, margin: "0 auto 16px" }}>
              Find your{" "}
              <span style={{ color: T, border: `2px solid ${T}`, borderRadius: 8, padding: "2px 12px" }}>[ first 100 users ]</span>
              {" "}and your co-founder.
            </h2>
            <p style={{ color: MUTED, fontSize: 15, maxWidth: 560, margin: "0 auto" }}>
              A live network of every builder on NexFellow, filterable by skill, stage, and category. Reviewers become users. Users become collaborators. Collaborators become co-founders.
            </p>
          </div>
        </FadeIn>

        {/* Map card */}
        <FadeIn delay={0.2}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "40px 32px", marginBottom: 32 }}>
            <WorldMap />
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20 }}>
              {[["14 Active Regions", ""], ["2.4k Verified Nodes", ""]].map(([label], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(20,184,166,0.1)", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "6px 14px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: T }} />
                  <span style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Features */}
        <FadeIn delay={0.3}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22 }}>{f.icon}</span>
                <div>
                  <div style={{ color: TEXT, fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{f.title}</div>
                  <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.4}>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/signup" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "transparent", color: T, border: `1px solid ${T}`,
              padding: "12px 28px", borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: "none",
            }}>
              Explore BuildersMap →
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
