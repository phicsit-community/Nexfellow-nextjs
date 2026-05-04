"use client";

import Image from "next/image";
import Link from "next/link";
import FadeIn from "../shared/FadeIn";
import { T, BG, MUTED, TEXT } from "../shared/tokens";

export default function EarlyAdopterSection() {
  return (
    <section style={{ background: BG, padding: "120px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

        {/* Left — text */}
        <FadeIn>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 28, height: 2, background: T }} />
              <span style={{ color: T, fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Visibility &amp; Distribution</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 52px)", fontWeight: 800, color: TEXT, lineHeight: 1.12, letterSpacing: "-1px", marginBottom: 24 }}>
              Your product in front of{" "}
              <span style={{ color: "#CDF461" }}>builders
              <br />who truly care</span>
            </h2>
            <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.75, marginBottom: 32, maxWidth: 460 }}>
              The Early Adopter Board is a curated, searchable listing of products actively seeking users. Unlike Product Hunt's 24-hour sprint, your listing stays visible for your entire review window — and gets boosted every time you receive new feedback.
            </p>
            <Link href="/signup" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: T, color: "#051018",
              padding: "12px 28px", borderRadius: 100, fontWeight: 700, fontSize: 15, textDecoration: "none",
            }}>
              See It Live <span>→</span>
            </Link>
          </div>
        </FadeIn>

        {/* Right — dashboard mockup */}
        <FadeIn delay={0.2} direction="left">
          <Image
            src="/earlyAdopter.png"
            alt="Early Adopter Board dashboard"
            width={540}
            height={380}
            style={{ width: "100%", height: "auto", borderRadius: 16, mixBlendMode: "lighten" }}
          />

        </FadeIn>
      </div>
    </section>
  );
}
