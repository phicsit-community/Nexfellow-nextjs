"use client";

import FadeIn from "../shared/FadeIn";
import DashboardMockup from "./DashboardMockup";
import { BG, T2, MUTED } from "../shared/tokens";

export default function ProductShowcase() {
  return (
    <section style={{
      background: `linear-gradient(180deg, ${BG} 0%, #0a3d38 40%, #0a3d38 60%, ${BG} 100%)`,
      padding: "100px 24px", textAlign: "center", overflow: "hidden",
    }}>
      <FadeIn>
        <h2 style={{
          fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800,
          color: "#f1f5f9", lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 16,
        }}>
          Get honest<br />
          feedback on product<br />
          <span style={{ color: T2 }}>10x faster</span>
        </h2>
        <p style={{ color: MUTED, fontSize: 16, maxWidth: 480, margin: "0 auto 60px" }}>
          Get detailed reviews, insights, and priority fixes from builders who understand your problem space.
        </p>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <DashboardMockup />
        </div>
      </FadeIn>
    </section>
  );
}
