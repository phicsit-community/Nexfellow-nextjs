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
    <img src="/map.png" alt="Builders Map" style={{ width: "100%", display: "block", borderRadius: 12, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
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
              <span style={{ color: T }}>[ first 100 users ]</span>
              {" "}and your co-founder.
            </h2>
            <p style={{ color: MUTED, fontSize: 15, maxWidth: 560, margin: "0 auto" }}>
              A live network of every builder on NexFellow, filterable by skill, stage, and category. Reviewers become users. Users become collaborators. Collaborators become co-founders.
            </p>
          </div>
        </FadeIn>

        {/* Map card */}
        <FadeIn delay={0.2}>
          <div style={{marginBottom: 60, position: "relative", }}>
            <WorldMap />
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
