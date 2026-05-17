"use client";

import Link from "next/link";
import FadeIn from "../../Landing/shared/FadeIn";
import DotGrid from "../../Landing/shared/DotGrid";
import { T, MUTED, TEXT, BORDER } from "../../Landing/shared/tokens";
import { useIsMobile } from "../../Landing/shared/useIsMobile";

const STATS = [
  { value: "10K+", label: "Builders on the platform" },
  { value: "3K+", label: "Products launched" },
  { value: "89%", label: "Say NexFellow improved their product" },
];

export default function MissionHero() {
  const isMobile = useIsMobile();

  return (
    <section style={{
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile ? "90px 20px 60px" : "120px 24px 80px",
      textAlign: "center",
      overflow: "hidden",
    }}>
      <DotGrid />

      {/* Teal glow center */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: isMobile ? 300 : 600, height: isMobile ? 200 : 400,
        background: "radial-gradient(ellipse, rgba(20,184,166,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <FadeIn style={{ position: "relative", zIndex: 5 }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32,
          background: "rgba(20,184,166,0.08)",
          border: `1px solid ${BORDER}`,
          borderRadius: 20, padding: "6px 16px",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: T, display: "inline-block" }} />
          <span style={{ color: T, fontSize: 13, fontWeight: 600, letterSpacing: "0.4px" }}>Our Mission</span>
        </div>

        <h1 style={{
          fontSize: isMobile ? "clamp(36px, 10vw, 48px)" : "clamp(42px, 7vw, 80px)",
          fontWeight: 800,
          color: TEXT,
          lineHeight: 1.15,
          letterSpacing: isMobile ? "-1px" : "-2px",
          marginBottom: 24,
          maxWidth: isMobile ? "100%" : 900,
          margin: "0 auto 24px",
          whiteSpace: isMobile ? "normal" : "nowrap",
        }}>
          Building is the easy part.<br />
          <span style={{ color: T }}>Getting noticed</span> isn&apos;t.
        </h1>

        <p style={{
          color: MUTED,
          fontSize: isMobile ? 15 : "clamp(15px, 2vw, 17px)",
          lineHeight: 1.7,
          maxWidth: isMobile ? "100%" : 620,
          margin: "0 auto 40px",
        }}>
          NexFellow exists because thousands of brilliant builders ship great products into silence.
          We&apos;re changing that — one connection, one review, one launch at a time.
        </p>

        <Link href="/signup" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: T, color: "#051018",
          padding: "14px 32px", borderRadius: 100,
          fontWeight: 700, fontSize: 15, textDecoration: "none",
          letterSpacing: "0.2px",
        }}>
          Join the community →
        </Link>
      </FadeIn>

      {/* Stats bar */}
      <FadeIn delay={0.2} style={{ position: "relative", zIndex: 5, width: "100%", display: "flex", justifyContent: "center", paddingTop: isMobile ? 40 : 64 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(3, 1fr)",
          gap: 0,
          background: "#0d2035",
          border: `1px solid rgba(255,255,255,0.1)`,
          borderRadius: 16,
          overflow: "hidden",
          width: isMobile ? "100%" : "min(900px, 90vw)",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              padding: isMobile ? "16px 12px" : "24px 20px",
              borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
              textAlign: "center",
            }}>
              <div style={{
                fontSize: isMobile ? "clamp(18px, 5vw, 22px)" : "clamp(20px, 3vw, 28px)",
                fontWeight: 800,
                color: TEXT,
                letterSpacing: "-1px",
                marginBottom: 6,
              }}>{s.value}</div>
              <div style={{
                fontSize: isMobile ? 10 : 11,
                color: MUTED,
                lineHeight: 1.4,
                maxWidth: isMobile ? "100%" : 130,
                margin: "0 auto",
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
