"use client";

import FadeIn from "../../Landing/shared/FadeIn";
import { T, MUTED, TEXT, CARD, BORDER } from "../../Landing/shared/tokens";

const TwitterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);
const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

export default function FounderSection() {
  return (
    <section style={{ padding: "100px 24px", position: "relative" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 28, height: 1, background: MUTED }} />
            <span style={{ color: MUTED, fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Who&apos;s Building This</span>
          </div>

          <h2 style={{
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 800,
            color: TEXT,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            marginBottom: 64,
          }}>
            Built by a builder, for{" "}
            <em style={{ fontStyle: "normal", color: T }}>builders</em>
          </h2>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 32, alignItems: "start" }}>

          {/* Left: founder card */}
          <FadeIn direction="right">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Profile card */}
              <div style={{
                background: CARD,
                border: `1px solid rgba(255,255,255,0.07)`,
                borderRadius: 16,
                padding: "28px 24px",
                textAlign: "center",
              }}>
                {/* Avatar */}
                <div style={{
                  width: 80, height: 80,
                  borderRadius: "50%",
                  border: `2px solid ${BORDER}`,
                  background: "rgba(20,184,166,0.1)",
                  margin: "0 auto 16px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={T} strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>

                <h3 style={{ color: TEXT, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Rahul Patel</h3>
                <p style={{ color: T, fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 16 }}>
                  Founder &amp; CEO, NexFellow
                </p>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                  {["Indie hacker", "Ex-Razorpay", "5+ builder"].map((tag, i) => (
                    <span key={i} style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 20,
                      padding: "4px 10px",
                      color: MUTED,
                      fontSize: 11,
                      fontWeight: 500,
                    }}>{tag}</span>
                  ))}
                </div>

                <p style={{ color: MUTED, fontSize: 12, marginBottom: 16 }}>Ahmedabad</p>

                {/* Social icons */}
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  {[TwitterIcon, GithubIcon, GridIcon].map((Icon, i) => (
                    <div key={i} style={{
                      width: 32, height: 32,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: MUTED, cursor: "pointer",
                    }}>
                      <Icon />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mission mini-card */}
              <div style={{
                background: CARD,
                border: `1px solid rgba(255,255,255,0.07)`,
                borderRadius: 16,
                padding: "20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>🚀</span>
                  <span style={{ color: TEXT, fontSize: 13, fontWeight: 700 }}>The Mission</span>
                </div>
                <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.65 }}>
                  NexFellow is the platform I wished existed. A network where giving makes you powerful and honest,
                  and where your product gets the visibility it deserves — not based on who you know but on how much you contribute.
                </p>
              </div>

            </div>
          </FadeIn>

          {/* Right: quote blocks */}
          <FadeIn direction="left" delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Main large quote */}
              <div style={{
                background: CARD,
                border: `1px solid rgba(255,255,255,0.07)`,
                borderRadius: 16,
                padding: "36px",
              }}>
                <div style={{ fontSize: 40, color: T, lineHeight: 1, marginBottom: 20, fontFamily: "Georgia, serif" }}>&ldquo;</div>
                <p style={{ color: TEXT, fontSize: "clamp(15px, 2vw, 17px)", lineHeight: 1.75, marginBottom: 16 }}>
                  I launched four products before NexFellow. All four had the same story: months of building, a launch week spike,
                  then silence. I got feedback from friends (&ldquo;looks cool&rdquo;), harsh replies on Reddit, and zero real signal on what to fix first.
                </p>
                <p style={{ color: TEXT, fontSize: "clamp(15px, 2vw, 17px)", lineHeight: 1.75, marginBottom: 28 }}>
                  What I actually needed was 10 builders who understood the problem space to tell me exactly where the UX broke,
                  why the pricing page confused them, and whether the positioning was landing. I needed a warm intro to someone
                  who&apos;d been through this before. I needed a co-launch partner with a complementary audience.
                </p>
                <div>
                  <p style={{ color: TEXT, fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Rahul Patel</p>
                  <p style={{ color: MUTED, fontSize: 13 }}>on why he started NexFellow.</p>
                </div>
              </div>

              {/* Secondary pull-quote card */}
              <div style={{
                background: "rgba(20,184,166,0.04)",
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: "24px",
              }}>
                <p style={{ color: TEXT, fontSize: "clamp(13px, 1.8vw, 15px)", lineHeight: 1.7, fontStyle: "italic" }}>
                  &ldquo;The AI SaaS market doesn&apos;t have a building problem. It has a distribution problem.
                  And distribution is a community problem. NexFellow is my answer to that.&rdquo;
                </p>
              </div>

            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
