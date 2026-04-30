"use client";

import Link from "next/link";
import FadeIn from "../shared/FadeIn";
import DotGrid from "../shared/DotGrid";
import { T, BG, CARD, MUTED, TEXT, BORDER, DARKER } from "../shared/tokens";

export default function CtaBanner() {
  return (
    <section style={{ background: BG, padding: "60px 24px 100px", position: "relative", overflow: "hidden" }}>
      {/* Background decoration */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.2, pointerEvents: "none" }}>
        <DotGrid />
      </div>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 500, height: 300,
        background: `radial-gradient(ellipse, rgba(20,184,166,0.12) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <FadeIn>
        <div style={{
          maxWidth: 560, margin: "0 auto",
          background: "rgba(13,32,53,0.9)", border: `1px solid ${BORDER}`,
          borderRadius: 24, padding: "48px 40px", textAlign: "center",
          backdropFilter: "blur(20px)",
          boxShadow: `0 0 80px rgba(20,184,166,0.1), 0 32px 64px rgba(0,0,0,0.4)`,
          position: "relative",
        }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 24,
            background: "rgba(20,184,166,0.1)", border: `1px solid ${BORDER}`,
            borderRadius: 20, padding: "5px 14px",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ color: T, fontSize: 12, fontWeight: 600, letterSpacing: "0.5px" }}>FREE TRIAL · NO CARD</span>
          </div>

          <h2 style={{
            fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, color: TEXT,
            lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 16,
          }}>
            Stop Shipping Into{" "}
            <em style={{ color: T, fontStyle: "italic" }}>Silence</em>
          </h2>

          <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            Join 3,000+ builders trading honest feedback every day. Get started with 30 free credits. No card required.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/signup" style={{
              background: T, color: DARKER, padding: "12px 28px",
              borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              Start free →
            </Link>
            <Link href="#how-it-works" style={{
              background: "transparent", color: TEXT,
              border: `1px solid ${BORDER}`,
              padding: "12px 28px", borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: "none",
            }}>
              See how it works
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
