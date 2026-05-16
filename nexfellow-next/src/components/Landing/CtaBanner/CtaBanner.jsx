"use client";

import Link from "next/link";
import FadeIn from "../shared/FadeIn";
import { T, MUTED, TEXT, BORDER, DARKER } from "../shared/tokens";
import { playfair } from "@/app/fonts";

export default function CtaBanner() {
  return (
    <>
    <section className="cta-banner-section" style={{ position: "relative", overflow: "hidden", padding: "80px 24px 100px"}}>

      {/* Background image with oval vignette mask */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/ctaBg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        maskImage: "radial-gradient(ellipse 75% 85% at 50% 50%, black 30%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 75% 85% at 50% 50%, black 30%, transparent 75%)",
        opacity: 1,
        pointerEvents: "none",
      }} />

      {/* Dark edge vignette so corners stay dark */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 90% 90% at 50% 50%, transparent 100%)`,
        pointerEvents: "none",
      }} />

      <FadeIn>
        <div className="cta-card" style={{
          maxWidth: 700, margin: "0 auto",
          position: "relative",
          background: "rgba(8, 24, 42, 0)",
          backdropFilter: "blur(13px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          borderRadius: 24,
          padding: "48px 40px",
          textAlign: "center",
          boxShadow: `
            0 0 0 1px rgba(20,184,166,0.15),
            0 8px 32px rgba(0,0,0,0.45),
            0 32px 80px rgba(0,0,0,0.35),
            inset 0 1px 0 rgba(255,255,255,0.08)
          `,
        }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24,
            background: "rgba(20,184,166,0.12)", border: `1px solid ${BORDER}`,
            borderRadius: 20, padding: "5px 14px",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
            <span style={{ color: T, fontSize: 12, fontWeight: 600, letterSpacing: "0.5px" }}>FREE TIER · NO CARD</span>
          </div>

          <h2 style={{
            fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, color: TEXT,
            lineHeight: 1.15, letterSpacing: "-1px", marginBottom: 16,
          }}>
            Stop Shipping <br />Into{" "}
            <em className={playfair.className} style={{
              fontStyle: "italic",
              fontWeight: 400,
              color: "#F6B64C",
              letterSpacing: "-3px",
            }}>Silence</em>
          </h2>

          <p className="cta-desc" style={{ color: MUTED, fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            Join 3,000+ builders trading honest feedback every day.<br className="cta-br" />
            Get started with 30 free credits. No card required.
          </p>

          <div className="cta-buttons" style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/signup" className="cta-btn-primary" style={{
              background: T, color: DARKER, padding: "12px 28px",
              borderRadius: 100, fontWeight: 700, fontSize: 15, textDecoration: "none",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              Start free →
            </Link>
            <Link href="#how-it-works" className="cta-btn-secondary" style={{
              background: "rgba(255,255,255,0.06)",
              color: TEXT,
              border: "1px solid rgba(255,255,255,0.14)",
              padding: "12px 28px", borderRadius: 100, fontWeight: 600, fontSize: 15, textDecoration: "none",
              backdropFilter: "blur(8px)",
            }}>
              See how it works
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>

    <style>{`
      @media (max-width: 480px) {
        .cta-banner-section { padding: 40px 16px 56px !important; }
        .cta-card { padding: 24px 18px !important; border-radius: 18px !important; }
        .cta-br { display: none; }
        .cta-desc { font-size: 13px !important; margin-bottom: 24px !important; }
        .cta-buttons { gap: 8px !important; }
        .cta-btn-primary { padding: 10px 18px !important; font-size: 13px !important; }
        .cta-btn-secondary { padding: 10px 14px !important; font-size: 13px !important; }
      }
    `}</style>
    </>
  );
}
