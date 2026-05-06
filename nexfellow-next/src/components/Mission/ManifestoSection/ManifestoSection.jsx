"use client";

import FadeIn from "../../Landing/shared/FadeIn";
import { T, MUTED, TEXT } from "../../Landing/shared/tokens";

const ITEMS = [
  {
    text: <>Every great product deserves to be <em style={{ fontStyle: "normal", color: "#F6B64C", fontWeight: 700 }}>found.</em></>,
  },
  {
    text: <>Builders give the most <em style={{ fontStyle: "normal", color: "#F6B64C", fontWeight: 700 }}>honest feedback.</em> Not investors. Not users. Builders.</>,
  },
  {
    text: <>Your <em style={{ fontStyle: "normal", color: T, fontWeight: 700 }}>network</em> should compound like your code does.</>,
  },
  {
    text: <>Distribution is a <em style={{ fontStyle: "normal", color: "#F6B64C", fontWeight: 700 }}>skill.</em> We&apos;re here to teach it.</>,
  },
  {
    text: <>Shipping alone is <em style={{ fontStyle: "normal", color: "#F6B64C", fontWeight: 700 }}>romantic.</em> Growing together is <em style={{ fontStyle: "normal", color: T, fontWeight: 700 }}>unstoppable.</em></>,
  },
  {
    text: <>The best AI SaaS tools in the world shouldn&apos;t die in a <em style={{ fontStyle: "normal", color: "#a78bfa", fontWeight: 700 }}>Product Hunt graveyard.</em></>,
  },
];

export default function ManifestoSection() {
  return (
    <section style={{ padding: "100px 24px", position: "relative" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 28, height: 1, background: MUTED }} />
            <span style={{ color: MUTED, fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>What We Believe</span>
          </div>

          <h2 style={{
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 800,
            color: TEXT,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            marginBottom: 64,
          }}>
            The <em style={{ fontStyle: "normal", color: T }}>NexFellow</em> Manifesto
          </h2>
        </FadeIn>

        <div style={{ display: "flex", paddingLeft: 200, flexDirection: "column", gap: 0 }}>
          {ITEMS.map((item, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                padding: "28px 0",
                borderBottom: i < ITEMS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <span style={{
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "1.5px solid rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.3)", display: "block" }} />
                </span>
                <p style={{
                  fontSize: "clamp(17px, 2.5vw, 22px)",
                  fontWeight: 600,
                  color: TEXT,
                  lineHeight: 1.5,
                }}>
                  {item.text}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
