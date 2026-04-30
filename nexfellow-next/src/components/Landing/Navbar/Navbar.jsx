"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { T, BG, DARKER, MUTED, TEXT, BORDER } from "../shared/tokens";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername]     = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);

    if (typeof window !== "undefined") {
      const flag = localStorage.getItem("isLoggedIn");
      const ud   = JSON.parse(localStorage.getItem("user") || "{}");
      if (flag === "true" && ud?.username) {
        setIsLoggedIn(true);
        setUsername(ud.username);
      }
    }
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const link = { color: MUTED, textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" };
  const btn  = { background: T, color: DARKER, padding: "8px 22px", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(7,26,44,0.96)" : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom: scrolled ? `1px solid ${BORDER}` : "none",
      transition: "all 0.3s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/NexFellowLogo.svg" alt="NexFellow" style={{ height: 34, width: 34 }} />
            <span style={{ color: TEXT, fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" }}>
              Nex<span style={{ color: T }}>Fellow</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <Link href="/"               style={link}>Home</Link>
            <Link href="#how-it-works"   style={link}>How it works</Link>
            <Link href="/mission"        style={link}>Mission</Link>
            <Link href="/blogs"          style={link}>Blogs</Link>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {isLoggedIn && username ? (
              <Link href={`/dashboard/${username}`} style={btn}>Dashboard</Link>
            ) : (
              <>
                <Link href="/login"  style={link}>Log In</Link>
                <Link href="/signup" style={btn}>Get Started</Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ borderTop: `1px solid ${BORDER}`, padding: "16px 0", display: "flex", flexDirection: "column", gap: 16 }}>
            <Link href="/"             style={link}>Home</Link>
            <Link href="#how-it-works" style={link}>How it works</Link>
            <Link href="/mission"      style={link}>Mission</Link>
            <Link href="/blogs"        style={link}>Blogs</Link>
            <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
              <Link href="/login"  style={link}>Log In</Link>
              <Link href="/signup" style={btn}>Get Started</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
