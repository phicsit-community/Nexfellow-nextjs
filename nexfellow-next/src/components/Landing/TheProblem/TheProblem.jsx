"use client";

import FadeIn from "../shared/FadeIn";
import { T, BG, CARD, MUTED, TEXT, BORDER, BORDER2, DARKER } from "../shared/tokens";

/* ── Mockup components ─────────────────────────────────────────────── */

function ChatMock() {
  return (
    <div style={{ background: "#0b1c2e", borderRadius: 12, padding: 16, maxWidth: 320 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#334155", flexShrink: 0 }} />
        <span style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>Dave from College</span>
      </div>
      <div style={{ background: "#1e40af", borderRadius: "10px 10px 10px 2px", padding: "9px 12px", color: "white", fontSize: 12, lineHeight: 1.55, marginBottom: 8, maxWidth: "88%" }}>
        Hey man, just finished the MVP. Would love your thoughts when you have a sec!
      </div>
      <div style={{ background: "#1e293b", borderRadius: "10px 10px 2px 10px", padding: "9px 12px", color: "#94a3b8", fontSize: 12, lineHeight: 1.55, maxWidth: "88%", marginLeft: "auto", textAlign: "right" }}>
        Looks amazing bro! Great job 🔥<br />Let me know when it launches.
      </div>
    </div>
  );
}

function RedditMock() {
  return (
    <div style={{ background: "#0b1c2e", borderRadius: 12, padding: 16, maxWidth: 340 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 2 }}>
          <span style={{ color: "#64748b", fontSize: 12 }}>▲</span>
          <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 13 }}>-12</span>
          <span style={{ color: "#64748b", fontSize: 12 }}>▼</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#64748b", fontSize: 10, marginBottom: 6 }}>
            u/throwaway_dev99 &nbsp;•&nbsp; 2 hours ago
          </div>
          <div style={{ color: "#cbd5e1", fontSize: 12, lineHeight: 1.6, marginBottom: 8 }}>
            Honestly this is just another wrapper around ChatGPT. Why would anyone pay $10/mo for this when you can just use the API? Hard pass.
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ color: "#64748b", fontSize: 10, cursor: "pointer" }}>💬 Reply</span>
            <span style={{ color: "#64748b", fontSize: 10, cursor: "pointer" }}>Share</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardMock() {
  return (
    <div style={{ background: "#0b1c2e", borderRadius: 12, padding: 16, maxWidth: 320 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ color: "#64748b", fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase" }}>
          Today's Leaderboard
        </span>
        <span style={{ color: "#ef4444", fontSize: 11, fontFamily: "monospace", fontWeight: 600 }}>
          ⏱ 23:59:58
        </span>
      </div>
      {[
        { rank: "#37", name: "Your App",          votes: 14,  highlight: true  },
        { rank: "#38", name: "Another Template",  votes: 12,  highlight: false },
      ].map((item, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 10px", borderRadius: 6, marginBottom: 6,
          background: item.highlight ? "rgba(20,184,166,0.08)" : "rgba(255,255,255,0.03)",
          border: item.highlight ? `1px solid rgba(20,184,166,0.2)` : "1px solid rgba(255,255,255,0.04)",
        }}>
          <span style={{ color: "#64748b", fontSize: 12 }}>
            {item.rank}&nbsp;
            <span style={{ color: item.highlight ? TEXT : "#64748b" }}>{item.name}</span>
          </span>
          <span style={{ color: item.highlight ? T : "#64748b", fontSize: 12, fontWeight: 600 }}>
            {item.votes}
          </span>
        </div>
      ))}
    </div>
  );
}

function DMMock() {
  return (
    <div style={{ background: "#0b1c2e", borderRadius: 12, padding: 16, maxWidth: 320 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>SJ</div>
        <div>
          <div style={{ color: TEXT, fontSize: 12, fontWeight: 600 }}>Sarah Jenkins</div>
          <div style={{ color: "#64748b", fontSize: 10 }}>Product Lead @ TechCorp</div>
        </div>
      </div>
      <div style={{ background: "#1e293b", borderRadius: "8px 8px 8px 2px", padding: "9px 12px", color: "#94a3b8", fontSize: 11, lineHeight: 1.65, marginBottom: 8 }}>
        Hi Sarah, I saw your post about workflow inefficiencies. I've been building a tool that solves exactly this. Would you be open to a 10-min chat to see if it makes sense for your team?
      </div>
      <div style={{ color: "#475569", fontSize: 10 }}>Sent 3 days ago &nbsp;•&nbsp; ✓ Seen</div>
    </div>
  );
}

/* ── Problem data ──────────────────────────────────────────────────── */

const PROBLEMS = [
  {
    num: "01",
    title: "Friends say 'looks great!'",
    body: "They don't want to hurt your feelings. They've never built anything either. Their encouragement is kind, but it isn't validation.",
    flip: false,
    Mock: ChatMock,
  },
  {
    num: "02",
    title: "Reddit tears it apart",
    body: "Anonymous strangers with no skin in the game. The criticism stings but rarely tells you what to actually fix. Noise masquerading as critique.",
    flip: true,
    Mock: RedditMock,
  },
  {
    num: "03",
    title: "The Launch is a 24-hour sprint",
    body: "A leaderboard for badges, not a community for builders. By Wednesday morning, your launch is buried under a dozen new AI templates.",
    flip: false,
    Mock: LeaderboardMock,
  },
  {
    num: "04",
    title: "Cold DMs feel desperate",
    body: "You don't have warm intros, co-marketing partners, or a network watching for competitive moves. Solo is hard. Isolation is the enemy of growth.",
    flip: true,
    Mock: DMMock,
  },
];

/* ── Component ─────────────────────────────────────────────────────── */

export default function TheProblem() {
  return (
    <section style={{ background: BG, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <FadeIn>
          <div style={{ marginBottom: 72 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 2, background: T }} />
              <span style={{ color: T, fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>THE PROBLEM</span>
            </div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 800, color: TEXT, lineHeight: 1.15, letterSpacing: "-1px", maxWidth: 640 }}>
              Building is the easy part.{" "}
              <span style={{ color: T }}>Getting heard</span>{" "}
              is where most products die.
            </h2>
          </div>
        </FadeIn>

        {/* Problem rows — alternating layout */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {PROBLEMS.map((p, i) => (
            <FadeIn key={i} delay={0.1 + i * 0.1}>
              <div style={{
                display: "flex",
                flexDirection: p.flip ? "row-reverse" : "row",
                alignItems: "center",
                gap: 64,
                padding: "48px 0",
                borderBottom: i < PROBLEMS.length - 1 ? `1px solid ${BORDER2}` : "none",
              }}>
                {/* Text side */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 36, height: 36, borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    background: "rgba(20,184,166,0.06)",
                    color: T, fontSize: 12, fontWeight: 700,
                    marginBottom: 20,
                  }}>{p.num}</div>
                  <h3 style={{ color: TEXT, fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginBottom: 14 }}>
                    {p.title}
                  </h3>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.8, maxWidth: 400 }}>
                    {p.body}
                  </p>
                </div>

                {/* Mock side */}
                <div style={{ flex: 1, display: "flex", justifyContent: p.flip ? "flex-start" : "flex-end" }}>
                  <p.Mock />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Bottom testimonial */}
        <FadeIn delay={0.4}>
          <div style={{
            marginTop: 72, background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: "36px 40px", textAlign: "center", maxWidth: 700, margin: "72px auto 0",
          }}>
            <div style={{ fontSize: 36, color: T, lineHeight: 1, marginBottom: 20 }}>"</div>
            <p style={{ color: TEXT, fontSize: 16, lineHeight: 1.85, fontStyle: "italic", marginBottom: 24 }}>
              I shipped four products before NexFellow. All four had the same story — months of building, then silence. It wasn't the tech. It was who I was building for. NexFellow broke that cycle.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${T}, #0f766e)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: DARKER }}>RP</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: TEXT, fontWeight: 600, fontSize: 14 }}>Rahul P.</div>
                <div style={{ color: T, fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>Founder · NexFellow Member</div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
