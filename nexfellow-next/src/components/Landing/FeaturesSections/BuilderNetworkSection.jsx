"use client";

import Link from "next/link";
import FadeIn from "../shared/FadeIn";
import { T, BG, MUTED, TEXT, BORDER, BORDER2 } from "../shared/tokens";

const BUILDER_NODES = [
  { id: "center", label: "YOU", x: 50, y: 50, size: 52, primary: true },
  { id: "ai", label: "AI", x: 30, y: 28, size: 38 },
  { id: "dev", label: "DEV", x: 70, y: 28, size: 38 },
  { id: "data", label: "DATA", x: 78, y: 55, size: 34 },
  { id: "lcm", label: "LCM", x: 22, y: 65, size: 34 },
  { id: "biz", label: "BIZ", x: 60, y: 75, size: 30 },
];

const CONNECTIONS = [
  ["center", "ai"], ["center", "dev"], ["center", "data"],
  ["center", "lcm"], ["center", "biz"], ["ai", "dev"],
];

const PROFILE_CARDS = [
  { name: "Sneha M.", role: "Building AI solutions, Platform", online: true, top: "4%", right: "0%" },
  { name: "Rohan J.", role: "SaaS Founder, DevOps", online: false, top: "28%", right: "0%" },
  { name: "Priya S.", role: "B2B Growth, Payments", online: true, bottom: "10%", right: "0%" },
];

export default function BuilderNetworkSection() {
  return (
    <section style={{ background: BG, padding: "120px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

        {/* Left — text */}
        <FadeIn>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 28, height: 2, background: T }} />
              <span style={{ color: T, fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Network &amp; Connections</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 52px)", fontWeight: 800, color: TEXT, lineHeight: 1.12, letterSpacing: "-1px", marginBottom: 24 }}>
              Find your{" "}
              <span style={{ color: T }}>co-founder,</span>
              <br />collaborator, or first user.
            </h2>
            <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.75, marginBottom: 28, maxWidth: 460 }}>
              BuilderMap is a live, searchable network of builders on NexFellow designed for real discovery. Find the people most likely to use your product, collaborate with you, or amplify your launch.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
              {["AI-matched by domain & stage", "Filter by availability status", "View what they're building"].map((tag, i) => (
                <span key={i} style={{
                  background: "rgba(20,184,166,0.08)", color: MUTED,
                  border: `1px solid ${BORDER}`, borderRadius: 20,
                  fontSize: 12, fontWeight: 500, padding: "6px 14px",
                }}>
                  {tag}
                </span>
              ))}
            </div>
            <Link href="/signup" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: T, color: "#051018",
              padding: "12px 28px", borderRadius: 100, fontWeight: 700, fontSize: 15, textDecoration: "none",
            }}>
              Explore BuilderMap <span>→</span>
            </Link>
          </div>
        </FadeIn>

        {/* Right — network diagram */}
        <FadeIn delay={0.2} direction="left">
          <div style={{ position: "relative", height: 420 }}>

            {/* Main network card */}
            <div style={{
              position: "absolute", left: "5%", top: "50%", transform: "translateY(-50%)",
              width: "58%",
              background: "linear-gradient(135deg, rgba(13,32,53,0.9), rgba(20,50,80,0.7))",
              border: `1px solid ${BORDER}`,
              borderRadius: 20, padding: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}>
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <span style={{ color: MUTED, fontSize: 11, fontWeight: 600, letterSpacing: "1px" }}>BuilderMap</span>
              </div>

              {/* SVG network */}
              <svg viewBox="0 0 200 160" width="100%" height="160" style={{ overflow: "visible" }}>
                {/* Connection lines */}
                {CONNECTIONS.map(([from, to], i) => {
                  const a = BUILDER_NODES.find(n => n.id === from);
                  const b = BUILDER_NODES.find(n => n.id === to);
                  const x1 = a.x * 2, y1 = a.y * 1.6;
                  const x2 = b.x * 2, y2 = b.y * 1.6;
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={`rgba(20,184,166,0.25)`} strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  );
                })}
                {/* Nodes */}
                {BUILDER_NODES.map((node) => {
                  const cx = node.x * 2, cy = node.y * 1.6;
                  const r = node.size / 5;
                  return (
                    <g key={node.id}>
                      <circle cx={cx} cy={cy} r={r + 3} fill={`rgba(20,184,166,0.08)`} />
                      <circle cx={cx} cy={cy} r={r}
                        fill={node.primary ? T : "rgba(13,32,53,0.9)"}
                        stroke={node.primary ? T : "rgba(20,184,166,0.4)"}
                        strokeWidth="1.5"
                      />
                      <text x={cx} y={cy + 4} textAnchor="middle"
                        fill={node.primary ? "#051018" : T}
                        fontSize={node.primary ? 7 : 6}
                        fontWeight="700" fontFamily="Inter,sans-serif"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Connect buttons */}
              {[["40%", "20%"], ["20%", "60%"], ["65%", "65%"]].map(([l, t], i) => (
                <div key={i} style={{
                  position: "absolute", left: l, top: t,
                  background: T, color: "#051018",
                  fontSize: 9, fontWeight: 700, borderRadius: 10,
                  padding: "3px 10px", cursor: "pointer",
                  boxShadow: `0 0 12px rgba(20,184,166,0.3)`,
                }}>
                  Connect
                </div>
              ))}
            </div>

            {/* Profile cards on the right */}
            {PROFILE_CARDS.map((p, i) => (
              <div key={i} style={{
                position: "absolute", right: 0,
                top: p.top, bottom: p.bottom,
                width: "36%",
                background: "rgba(13,32,53,0.95)",
                border: `1px solid ${BORDER}`,
                borderRadius: 12, padding: "10px 12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${i === 0 ? "#14b8a6,#0f766e" : i === 1 ? "#7c3aed,#2563eb" : "#ec4899,#8b5cf6"})`,
                    flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ color: TEXT, fontSize: 11, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: p.online ? "#22c55e" : "#64748b" }} />
                      <span style={{ color: MUTED, fontSize: 9 }}>{p.online ? "Online" : "Offline"}</span>
                    </div>
                  </div>
                </div>
                <p style={{ color: MUTED, fontSize: 9.5, lineHeight: 1.4 }}>{p.role}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
