"use client";

import Link from "next/link";
import { T, DARKER, MUTED, TEXT, BORDER, BORDER2 } from "../shared/tokens";

const PRODUCT_LINKS  = [["How it works", "#how-it-works", true], ["Features", "/"], ["Launches", "/launches"], ["Changelog", "/"]];
const COMPANY_LINKS  = [["Mission", "/mission"], ["About us", "/"], ["Success Stories", "/"], ["Contact us", "/contact"]];
const SUPPORT_LINKS  = [["How credits work", "/", true], ["Report a bug", "/"], ["Request a feature", "/"], ["API docs", "/docs", true]];
const SOCIAL_ICONS   = ["𝕏", "in", "⌥", "◉"];

function LinkGroup({ title, links }) {
  return (
    <div>
      <h4 style={{ color: TEXT, fontWeight: 700, fontSize: 13, marginBottom: 16, letterSpacing: "0.5px", textTransform: "uppercase" }}>{title}</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map(([label, href, badge], i) => (
          <Link key={i} href={href || "/"} style={{ color: MUTED, textDecoration: "none", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            {label}
            {badge && title === "PRODUCT" && (
              <span style={{ background: T, color: DARKER, fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "1px 5px" }}>NEW</span>
            )}
            {badge && title === "SUPPORT" && (
              <span style={{ background: "rgba(20,184,166,0.15)", color: T, fontSize: 9, fontWeight: 600, borderRadius: 4, padding: "1px 5px", border: `1px solid ${BORDER}` }}>BETA</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: DARKER, borderTop: `1px solid ${BORDER2}`, position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 64 }}>

          {/* Brand */}
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 16 }}>
              <img src="/NexFellowLogo.svg" alt="NexFellow" style={{ height: 32 }} />
              <span style={{ color: TEXT, fontWeight: 700, fontSize: 18 }}>Nex<span style={{ color: T }}>Fellow</span></span>
            </Link>
            <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.8, maxWidth: 240, marginBottom: 20 }}>
              NexFellow connects you with experienced builders who give honest, actionable product feedback. Launch faster with real user insights.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {SOCIAL_ICONS.map((icon, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER2}`, display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontSize: 13, cursor: "pointer" }}>
                  {icon}
                </div>
              ))}
            </div>
          </div>

          <LinkGroup title="PRODUCT"  links={PRODUCT_LINKS} />
          <LinkGroup title="COMPANY"  links={COMPANY_LINKS} />
          <LinkGroup title="SUPPORT"  links={SUPPORT_LINKS} />
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: `1px solid ${BORDER2}`, paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ color: MUTED, fontSize: 12 }}>© {year} NexFellow</p>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/terms"   style={{ color: MUTED, textDecoration: "none", fontSize: 12 }}>Terms and Conditions</Link>
            <span style={{ color: MUTED, fontSize: 12 }}>•</span>
            <Link href="/privacy" style={{ color: MUTED, textDecoration: "none", fontSize: 12 }}>Privacy Policy</Link>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div style={{
        textAlign: "center", fontSize: "clamp(48px, 12vw, 140px)",
        fontWeight: 900, color: "rgba(20,184,166,0.04)",
        letterSpacing: "-4px", lineHeight: 1, paddingBottom: 8,
        userSelect: "none",
      }}>
        NexFellow
      </div>
    </footer>
  );
}
