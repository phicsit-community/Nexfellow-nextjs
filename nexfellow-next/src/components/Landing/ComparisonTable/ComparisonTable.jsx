"use client";

import FadeIn from "../shared/FadeIn";
import { T, BG, BG2, MUTED, TEXT, BORDER, BORDER2 } from "../shared/tokens";

const ROWS = [
  { capability: "Structured feedback from verified builders", nexfellow: "check", producthunt: "cross", indiehackers: "partial" },
  { capability: "Ongoing product visibility (not just launch day)", nexfellow: "check", producthunt: "cross", indiehackers: "dash" },
  { capability: "AI-matched reviewers by domain & stage", nexfellow: "check", producthunt: "cross", indiehackers: "cross" },
  { capability: "Early adopter pipeline", nexfellow: "check", producthunt: "partial", indiehackers: "cross" },
  { capability: "Builder network — find co-founders & users", nexfellow: "check", producthunt: "cross", indiehackers: "dash" },
  { capability: "Warm intro system", nexfellow: "check", producthunt: "cross", indiehackers: "cross" },
  { capability: "Credit economy — earn by giving", nexfellow: "check", producthunt: "cross", indiehackers: "cross" },
  { capability: "Free tier with real value", nexfellow: "check", producthunt: "partial", indiehackers: "partial" },
  { capability: "India-first pricing (₹ pricing)", nexfellow: "check", producthunt: "cross", indiehackers: "cross", highlight: true },
];

function Icon({ type }) {
  if (type === "check") {
    return (
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(20,184,166,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke={T} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (type === "cross") {
    return (
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  if (type === "partial") {
    return (
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(100,116,139,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return <span style={{ color: MUTED, fontSize: 18, display: "block", textAlign: "center" }}>—</span>;
}

const NexFellowLogoSmall = () => (
  <svg width="100" height="27" viewBox="0 0 234 63" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M51.5655 9.32775C48.8684 7.6466 40.7709 15.0879 39.9092 14.2659C39.1925 13.5814 45.0669 8.6946 43.9059 6.85933C42.8592 5.20515 36.2348 7.22535 23.0283 11.3338C16.9689 13.2218 13.8455 14.2621 11.1754 16.9578C10.2456 17.8979 7.28786 20.8878 6.79854 25.2672C6.74973 25.6949 6.73561 26.0507 6.73047 26.2947V43.4363C6.73047 50.7273 13.5244 56.6363 21.9045 56.6363H41.6134C42.8194 56.644 47.8795 56.5516 52.1242 52.9684C52.5403 52.6165 56.9891 48.7533 57.0816 43.3823C57.0816 43.3053 57.0816 43.2411 57.0816 43.2C57.0816 38.2511 57.0816 33.3023 57.0816 28.3534C57.0816 28.207 57.106 27.8564 57.0816 27.3889C57.0225 26.2806 56.7669 25.3058 56.3572 24.2347C55.9295 23.1173 55.3298 22.0783 54.1302 19.9965C53.5973 19.073 52.8459 17.826 52.6764 17.5563C52.4324 17.171 52.4272 17.18 52.3373 16.9578C50.6986 12.9135 52.8138 10.1048 51.5655 9.32775Z" fill="#24B2B4" />
    <path d="M50.7377 37.8542C49.1631 31.204 42.6157 31.904 42.6157 31.904C42.6157 31.904 39.405 32.0324 37.3681 34.5034C36.3008 35.7993 36.0131 37.2454 35.8153 38.2626C35.0987 41.9536 36.6206 43.6926 35.4082 45.045C34.5811 45.9671 33.1222 45.9966 31.9406 46.0197C30.759 46.0429 29.4003 46.0724 28.5411 45.2492C27.2349 43.9957 28.5064 42.1668 27.6356 38.2651C27.3595 37.0258 27.0769 35.7119 26.0842 34.506C24.046 32.0324 20.8365 31.9065 20.8365 31.9065C20.8365 31.9065 14.2866 31.2066 12.7146 37.8567C12.1867 40.0888 11.8336 40.5396 11.045 41.368C9.84931 42.6176 8.0911 42.9901 6.76184 43.1057C6.72358 44.1346 6.8238 45.164 7.0598 46.1662C7.47431 47.7959 8.20716 49.3275 9.21615 50.6728C9.86729 51.5539 10.6199 52.3553 11.4585 53.0603C13.0173 54.3416 14.8188 55.2947 16.755 55.8626C18.1201 56.2737 19.528 56.5263 20.9508 56.6152C21.4645 56.6486 21.7368 56.6435 23.4334 56.6409C24.8333 56.6409 26.2319 56.6409 27.6305 56.6409C31.152 56.6242 32.9141 56.6153 33.8979 56.6217C36.3381 56.6384 38.7911 56.6217 41.2377 56.6409C42.1638 56.655 43.0898 56.6005 44.0079 56.4778C45.016 56.3444 46.0096 56.1178 46.9759 55.801L47.1737 55.7342C48.6949 55.1927 50.1334 54.4424 51.4479 53.5047C52.3394 52.8332 53.147 52.0571 53.8534 51.1929C54.5084 50.4146 55.6951 48.9826 56.4297 46.8122C56.8346 45.6118 57.0449 44.3545 57.0526 43.0877C56.2512 43.1159 54.0897 43.0877 52.5999 41.7674C52.2108 41.4181 51.5185 41.1535 50.7377 37.8542Z" fill="#FFFEFF" />
    <path d="M88.3048 24.1445L84.1513 44.9117H79.3147L72.4616 33.5199L70.1781 44.9117H64.4219L68.5753 24.1445H73.4107L80.2946 35.5068L82.5485 24.1445H88.3048Z" fill="white" />
    <path d="M134.284 28.6781L133.364 33.2477H142.532L141.612 37.7864H132.474L131.05 44.9066H125.176L129.327 24.1445H145.585L144.665 28.6833L134.284 28.6781Z" fill="#24B2B4" />
  </svg>
);

export default function ComparisonTable() {
  return (
    <section style={{ background: BG2, padding: "100px 24px" }}>
      <FadeIn>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 20 }}>
              <NexFellowLogoSmall />
              <span style={{ color: TEXT, fontSize: "clamp(24px, 3.5vw, 42px)", fontWeight: 800, letterSpacing: "-1px" }}>vs the rest</span>
            </div>
            <p style={{ color: MUTED, fontSize: 15, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
              Product Hunt gives you one day. Indie Hackers gives you a thread. NexFellow gives you real feedback, real users, and a network every week.
            </p>
          </div>

          {/* Table */}
          <div style={{
            background: "rgba(7,26,44,0.7)", border: `1px solid ${BORDER}`,
            borderRadius: 20, overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          }}>
            {/* Header row */}
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <div style={{ padding: "20px 24px" }}>
                <span style={{ color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Capabilities</span>
              </div>
              <div style={{ padding: "20px 16px", textAlign: "center", borderLeft: `1px solid ${BORDER}`, background: "rgba(20,184,166,0.04)" }}>
                <NexFellowLogoSmall />
              </div>
              <div style={{ padding: "20px 16px", textAlign: "center", borderLeft: `1px solid ${BORDER}` }}>
                <span style={{ color: MUTED, fontSize: 13, fontWeight: 600 }}>Product Hunt</span>
              </div>
              <div style={{ padding: "20px 16px", textAlign: "center", borderLeft: `1px solid ${BORDER}` }}>
                <span style={{ color: MUTED, fontSize: 13, fontWeight: 600 }}>Indie Hackers</span>
              </div>
            </div>

            {/* Data rows */}
            {ROWS.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  borderBottom: i < ROWS.length - 1 ? `1px solid ${BORDER2}` : "none",
                  background: row.highlight ? "rgba(20,184,166,0.03)" : "transparent",
                }}
              >
                <div style={{ padding: "16px 24px", display: "flex", alignItems: "center" }}>
                  <span style={{
                    color: row.highlight ? T : TEXT,
                    fontSize: 13.5,
                    fontWeight: row.highlight ? 600 : 400,
                  }}>
                    {row.capability}
                  </span>
                </div>
                <div style={{ padding: "16px 16px", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: `1px solid ${BORDER2}`, background: "rgba(20,184,166,0.02)" }}>
                  <Icon type={row.nexfellow} />
                </div>
                <div style={{ padding: "16px 16px", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: `1px solid ${BORDER2}` }}>
                  <Icon type={row.producthunt} />
                </div>
                <div style={{ padding: "16px 16px", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: `1px solid ${BORDER2}` }}>
                  <Icon type={row.indiehackers} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
