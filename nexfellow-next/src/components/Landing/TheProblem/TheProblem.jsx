"use client";

import FadeIn from "../shared/FadeIn";
import { T, BG, CARD, MUTED, TEXT, BORDER, BORDER2, DARKER } from "../shared/tokens";

const PROBLEMS = [
  {
    title: "Friends say 'looks great!'",
    body: "They don't want to hurt your feelings. They've never built anything either. Their encouragement is kind, but it isn't validation.",
    mock: (
      <div style={{ background: "#1e293b", borderRadius: 8, padding: "10px 12px", fontSize: 11 }}>
        <div style={{ color: "#94a3b8", marginBottom: 6 }}>Dave from College</div>
        <div style={{ background: "#334155", borderRadius: 6, padding: "8px 10px", color: "#cbd5e1" }}>
          Hey bro, just finished the MVP. Would love your thoughts when you have a sec 🙏
        </div>
        <div style={{ marginTop: 8, color: "#94a3b8", fontSize: 10, lineHeight: 1.6 }}>
          Looks amazing bro! Keep it up!! 💪<br />Let me know when it launches 🚀
        </div>
      </div>
    ),
  },
  {
    title: "Reddit tears it apart",
    body: "Anonymous strangers with no skin in the game. The criticism stings but rarely tells you what to actually fix. Noise masquerading as critique.",
    mock: (
      <div style={{ background: "#1e293b", borderRadius: 8, padding: "10px 12px", fontSize: 11 }}>
        <div style={{ color: "#f87171", marginBottom: 4, fontWeight: 600 }}>r/startups · 3 hours ago</div>
        <div style={{ color: "#cbd5e1", marginBottom: 6, lineHeight: 1.5 }}>Honestly this is just another wrapper around ChatGPT. Why would anyone pay $99/mo when you can just use the API directly?</div>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ color: "#94a3b8", fontSize: 10 }}>▲ 47</span>
          <span style={{ color: "#94a3b8", fontSize: 10 }}>💬 Share</span>
        </div>
      </div>
    ),
  },
  {
    title: "The Launch is a 24-hour sprint",
    body: "A leaderboard for badges, not a community for builders. By Wednesday morning, your launch is buried under a dozen new AI templates.",
    mock: (
      <div style={{ background: "#1e293b", borderRadius: 8, padding: "10px 12px", fontSize: 11 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: "#94a3b8" }}>Product Hunt</span>
          <span style={{ color: "#94a3b8", fontSize: 10 }}>Today</span>
        </div>
        {[["Your App", "🔥", "142", true], ["AI Tool #7", "✨", "890", false], ["Another Template", "🤖", "674", false]].map(([name, icon, votes, you], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", color: you ? "#cbd5e1" : "#94a3b8" }}>
            <span>{icon} {name}</span>
            <span style={{ color: you ? "#f59e0b" : "#94a3b8" }}>▲ {votes}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Cold DMs feel desperate",
    body: "You don't have warm intros, co-marketing partners, or a network watching for competitive moves. Solo is hard. Isolation is the enemy of growth.",
    mock: (
      <div style={{ background: "#1e293b", borderRadius: 8, padding: "10px 12px", fontSize: 11 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>SJ</div>
          <div>
            <div style={{ color: "#f1f5f9", fontSize: 10, fontWeight: 600 }}>Satvik Jenkins</div>
            <div style={{ color: "#94a3b8", fontSize: 9 }}>Product Lead @ TechCorp</div>
          </div>
        </div>
        <div style={{ color: "#cbd5e1", lineHeight: 1.5, fontSize: 10 }}>
          Hi Samiran, love your post on workflow automation. I've been building a tool that solves exactly this! Would you be open to a 15-min call to see if it makes sense for your brand?
        </div>
        <div style={{ color: "#94a3b8", fontSize: 9, marginTop: 6 }}>3 days ago · Read</div>
      </div>
    ),
  },
];

export default function TheProblem() {
  return (
    <section style={{ background: BG, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <FadeIn>
          <div style={{ marginBottom: 60 }}>
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

        {/* Problem cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          {PROBLEMS.map((p, i) => (
            <FadeIn key={i} delay={0.1 + i * 0.1}>
              <div style={{
                background: CARD, border: `1px solid ${BORDER2}`,
                borderRadius: 16, padding: 24,
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20,
                alignItems: "start",
              }}>
                <div>
                  <h3 style={{ color: TEXT, fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{p.title}</h3>
                  <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.7 }}>{p.body}</p>
                </div>
                <div>{p.mock}</div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Bottom testimonial */}
        <FadeIn delay={0.3}>
          <div style={{
            marginTop: 48, background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: 32, textAlign: "center", maxWidth: 700, margin: "48px auto 0",
          }}>
            <div style={{ fontSize: 32, color: T, marginBottom: 16 }}>"</div>
            <p style={{ color: TEXT, fontSize: 16, lineHeight: 1.8, fontStyle: "italic", marginBottom: 20 }}>
              I shipped four products before NexFellow. All four had the same story — months of building, then silence. It wasn't the tech. It was who I was building for. NexFellow broke that cycle.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${T}, #0f766e)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: DARKER }}>RP</div>
              <div>
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
