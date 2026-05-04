"use client";

import Link from "next/link";
import FadeIn from "../shared/FadeIn";
import { T, BG, MUTED, TEXT, BORDER, BORDER2, CARD } from "../shared/tokens";

const LISTING_ITEMS = [
  { name: "TaskFlow AI", badge: "LAUNCH", tag: "Predictive sprint planning using repository metadata.", upvotes: 244, category: "Engineering" },
  { name: "ShipLog", badge: "FEATURED", tag: "Automated changelog generation directly from git commits.", upvotes: 182, category: "DevOps" },
  { name: "PitchPal", badge: null, tag: "AI-assisted investor deck formatting and content review.", upvotes: 79, category: "Fundraising" },
  { name: "FocusDock", badge: null, tag: "Context notification management for technical leads.", upvotes: 45, category: "Productivity" },
];

const BADGE_STYLES = {
  LAUNCH: { background: "rgba(20,184,166,0.18)", color: T, border: `1px solid ${BORDER}` },
  FEATURED: { background: "rgba(139,92,246,0.18)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" },
};

function ListingCard({ item }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 16px",
      borderBottom: `1px solid ${BORDER2}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
        {/* Icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "rgba(20,184,166,0.12)", border: `1px solid ${BORDER}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>{item.name}</span>
            {item.badge && (
              <span style={{ ...BADGE_STYLES[item.badge], fontSize: 9, fontWeight: 700, borderRadius: 6, padding: "2px 7px", letterSpacing: "0.5px" }}>
                {item.badge}
              </span>
            )}
          </div>
          <p style={{ color: MUTED, fontSize: 11, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>{item.tag}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <span style={{ color: MUTED, fontSize: 10, background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: 6 }}>{item.category}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="2">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          <span style={{ color: TEXT, fontSize: 12, fontWeight: 700 }}>{item.upvotes}</span>
        </div>
      </div>
    </div>
  );
}

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
              <span style={{ color: "#22c55e" }}>builders</span>
              <br />who truly care
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
          <div style={{
            background: "rgba(13,32,53,0.95)", border: `1px solid ${BORDER}`,
            borderRadius: 16, overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          }}>
            {/* Window chrome */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${BORDER2}` }}>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
              </div>
              <span style={{ color: MUTED, fontSize: 11, fontWeight: 600 }}>Active Listings</span>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ color: MUTED, fontSize: 10, background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 6 }}>Filter</span>
                <span style={{ color: T, fontSize: 10, background: "rgba(20,184,166,0.12)", padding: "3px 10px", borderRadius: 6, border: `1px solid ${BORDER}` }}>Trending</span>
              </div>
            </div>

            {/* Targeted row header */}
            <div style={{ padding: "10px 16px 4px", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ color: "#22c55e", fontSize: 10, fontWeight: 600, letterSpacing: "0.5px" }}>Targeted by category</span>
            </div>

            {LISTING_ITEMS.map((item, i) => (
              <ListingCard key={i} item={item} />
            ))}

            {/* Footer note */}
            <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
              <span style={{ color: MUTED, fontSize: 10 }}>Stays live for 72 hrs · Maximum visibility in the ever feed it lives on</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
