"use client";

import FadeIn from "../../Landing/shared/FadeIn";
import { T, MUTED, TEXT, BORDER, BORDER2 } from "../../Landing/shared/tokens";
import { useIsMobile } from "../../Landing/shared/useIsMobile";

const PROBLEMS = [
  {
    icon: (
      <svg width="38" height="31" viewBox="0 0 38 31" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30.4 17.1V13.3H38V17.1H30.4ZM32.68 30.4L26.6 25.84L28.88 22.8L34.96 27.36L32.68 30.4ZM28.88 7.6L26.6 4.56L32.68 0L34.96 3.04L28.88 7.6ZM5.7 28.5V20.9H3.8C2.755 20.9 1.86042 20.5279 1.11625 19.7838C0.372083 19.0396 0 18.145 0 17.1V13.3C0 12.255 0.372083 11.3604 1.11625 10.6163C1.86042 9.87208 2.755 9.5 3.8 9.5H11.4L20.9 3.8V26.6L11.4 20.9H9.5V28.5H5.7ZM17.1 19.855V10.545L12.445 13.3H3.8V17.1H12.445L17.1 19.855ZM22.8 21.565V8.835C23.655 9.595 24.3438 10.5212 24.8662 11.6137C25.3888 12.7063 25.65 13.9017 25.65 15.2C25.65 16.4983 25.3888 17.6938 24.8662 18.7862C24.3438 19.8787 23.655 20.805 22.8 21.565Z" fill="#24B2B4" />
      </svg>

    ),
    title: "Shipping into silence",
    body: "Most products get fewer than 50 visitors in their first month. Real users, not vanity metrics, are impossible to find.",
  },
  {
    icon: (
      <svg width="31" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M27.4938 29.4726L22.6685 24.6473V24.8903H0.451288V21.0022C0.451288 20.2154 0.653789 19.4922 1.05879 18.8326C1.46379 18.173 2.00187 17.6697 2.67301 17.3225C4.10788 16.6051 5.56588 16.067 7.04703 15.7083C8.52818 15.3496 10.0325 15.1702 11.5599 15.1702C11.8376 15.1702 12.1211 15.176 12.4104 15.1876C12.6997 15.1991 12.9832 15.2165 13.2609 15.2396L11.8029 13.7816C11.7566 13.7816 11.7161 13.7816 11.6814 13.7816C11.6467 13.7816 11.6062 13.7816 11.5599 13.7816C10.0325 13.7816 8.7249 13.2378 7.63718 12.1501C6.54946 11.0623 6.0056 9.75476 6.0056 8.22732C6.0056 8.18104 6.0056 8.14054 6.0056 8.10582C6.0056 8.07111 6.0056 8.03061 6.0056 7.98432L0 1.97872L1.97872 0L29.4726 27.4938L27.4938 29.4726ZM22.1825 15.3785C23.3628 15.5174 24.4737 15.7546 25.5151 16.0901C26.5566 16.4257 27.5286 16.8365 28.4311 17.3225C29.2643 17.7854 29.9007 18.3003 30.3404 18.8673C30.7801 19.4343 31 20.0534 31 20.7245V24.8903H30.8264L25.2721 19.3359C25.0638 18.5722 24.6993 17.849 24.1786 17.1663C23.6579 16.4836 22.9925 15.8876 22.1825 15.3785ZM11.5599 17.9474C10.2639 17.9474 8.97947 18.1036 7.70661 18.416C6.43374 18.7284 5.17245 19.1971 3.92273 19.8219C3.71445 19.9377 3.54666 20.0997 3.41937 20.308C3.29209 20.5162 3.22844 20.7477 3.22844 21.0022V22.1131H19.8914V21.8701L16.8712 18.8499C15.9918 18.5491 15.1066 18.3234 14.2156 18.173C13.3246 18.0226 12.4393 17.9474 11.5599 17.9474ZM18.5722 12.6361C19.0119 11.9881 19.3417 11.2938 19.5616 10.5532C19.7814 9.81262 19.8914 9.03733 19.8914 8.22732C19.8914 7.25532 19.7236 6.31803 19.388 5.41545C19.0524 4.51288 18.5722 3.6913 17.9474 2.95073C18.2714 2.83501 18.5954 2.7598 18.9194 2.72508C19.2434 2.69037 19.5674 2.67301 19.8914 2.67301C21.4188 2.67301 22.7264 3.21687 23.8141 4.30459C24.9018 5.39231 25.4457 6.69989 25.4457 8.22732C25.4457 9.75476 24.8729 11.0623 23.7273 12.1501C22.5817 13.2378 21.2452 13.7816 19.7178 13.7816L18.5722 12.6361ZM16.5588 10.6226L14.3371 8.4009C14.3371 8.35461 14.3371 8.32568 14.3371 8.31411C14.3371 8.30254 14.3371 8.27361 14.3371 8.22732C14.3371 7.46361 14.0651 6.80982 13.5213 6.26596C12.9774 5.7221 12.3236 5.45017 11.5599 5.45017C11.5136 5.45017 11.4847 5.45017 11.4731 5.45017C11.4616 5.45017 11.4326 5.45017 11.3863 5.45017L9.16461 3.22844C9.5349 3.0433 9.91676 2.90444 10.3102 2.81187C10.7036 2.7193 11.1202 2.67301 11.5599 2.67301C13.0873 2.67301 14.3949 3.21687 15.4826 4.30459C16.5704 5.39231 17.1142 6.69989 17.1142 8.22732C17.1142 8.66704 17.0679 9.08361 16.9754 9.47704C16.8828 9.87047 16.7439 10.2523 16.5588 10.6226Z" fill="#24B2B4" />
      </svg>

    ),
    title: "Building alone",
    body: "Solo founders have no warm intros, no one watching for competitive moves. The network gap is real.",
  },
  {
    icon: (
      <svg width="31" height="41" viewBox="0 0 31 41" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.875 40.6875C2.80938 40.6875 1.89714 40.3081 1.13828 39.5492C0.379427 38.7904 0 37.8781 0 36.8125V17.4375C0 16.3719 0.379427 15.4596 1.13828 14.7008C1.89714 13.9419 2.80938 13.5625 3.875 13.5625H5.8125V9.6875C5.8125 7.00729 6.75703 4.72266 8.64609 2.83359C10.5352 0.944531 12.8198 0 15.5 0C18.1802 0 20.4648 0.944531 22.3539 2.83359C24.243 4.72266 25.1875 7.00729 25.1875 9.6875V13.5625H27.125C28.1906 13.5625 29.1029 13.9419 29.8617 14.7008C30.6206 15.4596 31 16.3719 31 17.4375V36.8125C31 37.8781 30.6206 38.7904 29.8617 39.5492C29.1029 40.3081 28.1906 40.6875 27.125 40.6875H3.875ZM3.875 36.8125H27.125V17.4375H3.875V36.8125ZM15.5 31C16.5656 31 17.4779 30.6206 18.2367 29.8617C18.9956 29.1029 19.375 28.1906 19.375 27.125C19.375 26.0594 18.9956 25.1471 18.2367 24.3883C17.4779 23.6294 16.5656 23.25 15.5 23.25C14.4344 23.25 13.5221 23.6294 12.7633 24.3883C12.0044 25.1471 11.625 26.0594 11.625 27.125C11.625 28.1906 12.0044 29.1029 12.7633 29.8617C13.5221 30.6206 14.4344 31 15.5 31ZM9.6875 13.5625H21.3125V9.6875C21.3125 8.07292 20.7474 6.70052 19.6172 5.57031C18.487 4.4401 17.1146 3.875 15.5 3.875C13.8854 3.875 12.513 4.4401 11.3828 5.57031C10.2526 6.70052 9.6875 8.07292 9.6875 9.6875V13.5625Z" fill="#24B2B4" />
      </svg>

    ),
    title: "Gatekept distribution",
    body: "Product Hunt is a pay-to-win leaderboard. There's no platform built specifically for builders.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 32L25.6 25.6H9.6C8.72 25.6 7.96667 25.2867 7.34 24.66C6.71333 24.0333 6.4 23.28 6.4 22.4V20.8H24C24.88 20.8 25.6333 20.4867 26.26 19.86C26.8867 19.2333 27.2 18.48 27.2 17.6V6.4H28.8C29.68 6.4 30.4333 6.71333 31.06 7.34C31.6867 7.96667 32 8.72 32 9.6V32ZM3.2 16.28L5.08 14.4H20.8V3.2H3.2V16.28ZM0 24V3.2C0 2.32 0.313333 1.56667 0.94 0.94C1.56667 0.313333 2.32 0 3.2 0H20.8C21.68 0 22.4333 0.313333 23.06 0.94C23.6867 1.56667 24 2.32 24 3.2V14.4C24 15.28 23.6867 16.0333 23.06 16.66C22.4333 17.2867 21.68 17.6 20.8 17.6H6.4L0 24Z" fill="#24B2B4" />
      </svg>

    ),
    title: "Zero honest feedback",
    body: "Friends say 'looks great.' Reddit tears it apart. Builders need qualified, specific feedback.",
  },
];

export default function ProblemSection() {
  const isMobile = useIsMobile();

  return (
    <section style={{ padding: isMobile ? "60px 16px" : "100px 24px", position: "relative" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Section label */}
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 28, height: 1, background: MUTED }} />
            <span style={{ color: MUTED, fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>Why We Exist</span>
          </div>

          <h2 style={{
            fontSize: "clamp(28px, 5vw, 54px)",
            fontWeight: 800,
            color: TEXT,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            marginBottom: 8,
          }}>
            The AI SaaS market is flooded.
          </h2>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 54px)",
            fontWeight: 800,
            color: T,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            marginBottom: 32,
          }}>
            Distribution is broken.
          </h2>

          <p style={{ color: MUTED, fontSize: isMobile ? 15 : 16, lineHeight: 1.7, maxWidth: 740, marginBottom: isMobile ? 40 : 64 }}>
            Thousands of builders ship great products every week and still get zero traction. Most don’t fail because of the idea. They fail because nobody gives honest feedback. That’s why NexFellow exists.
          </p>
        </FadeIn>

        {/* Two-column layout → single column on mobile */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>

          {/* Problem cards 2x2 */}
          <FadeIn direction="right" style={{ height: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: "100%", alignContent: "stretch" }}>
              {PROBLEMS.map((p, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.015)",
                  border: `1px solid ${BORDER2}`,
                  borderRadius: 18,
                  padding: isMobile ? "20px 16px" : "26px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                      {p.icon}
                    </div>
                    <h3 style={{ color: TEXT, fontSize: isMobile ? 17 : 19, fontWeight: 700, lineHeight: 1.3, margin: 0 }}>{p.title}</h3>
                  </div>
                  <p style={{ color: MUTED, fontSize: isMobile ? 13 : 14, lineHeight: 1.7, margin: 0 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Right: outer card with glow + nested inner card + testimonial */}
          <FadeIn direction="left" delay={0.1} style={{ height: "100%" }}>
            <div style={{
              background: "#0a1929",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18,
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Top-right glow */}
              <div style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(20,184,166,0.22) 0%, rgba(20,184,166,0.06) 50%, transparent 70%)",
                pointerEvents: "none",
              }} />

              {/* Inner nested card */}
              <div style={{
                background: "#0d2035",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 12,
                padding: "20px 18px",
                marginBottom: 24,
                position: "relative",
                zIndex: 1,
              }}>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 20 }}>
                  The gap we&apos;re closing
                </p>

                {/* Before NexFellow */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4,
                        background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ color: "#ef4444", fontSize: 9, fontWeight: 900 }}>✕</span>
                      </div>
                      <span style={{ color: MUTED, fontSize: 13 }}>Before NexFellow</span>
                    </div>
                    <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 600 }}>Low visibility</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 99 }}>
                    <div style={{ width: "18%", height: "100%", background: "#ef4444", borderRadius: 99 }} />
                  </div>
                </div>

                {/* With NexFellow */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4,
                        background: "rgba(20,184,166,0.12)", border: `1px solid ${BORDER}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ color: T, fontSize: 9, fontWeight: 900 }}>✓</span>
                      </div>
                      <span style={{ color: MUTED, fontSize: 13 }}>With NexFellow</span>
                    </div>
                    <span style={{ color: T, fontSize: 11, fontWeight: 600 }}>Builders find you</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 99 }}>
                    <div style={{ width: "85%", height: "100%", background: T, borderRadius: 99 }} />
                  </div>
                </div>
              </div>

              {/* Testimonial card */}
              <div style={{
                background: "#0d2035",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 12,
                padding: "20px 18px",
                position: "relative",
                zIndex: 1,
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20, flex: 1 }}>
                  <svg width="22" height="16" viewBox="0 0 26 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: 4 }}>
                    <path d="M2.55 18L6 12C4.35 12 2.9375 11.4125 1.7625 10.2375C0.5875 9.0625 0 7.65 0 6C0 4.35 0.5875 2.9375 1.7625 1.7625C2.9375 0.5875 4.35 0 6 0C7.65 0 9.0625 0.5875 10.2375 1.7625C11.4125 2.9375 12 4.35 12 6C12 6.575 11.9312 7.10625 11.7937 7.59375C11.6562 8.08125 11.45 8.55 11.175 9L6 18H2.55ZM16.05 18L19.5 12C17.85 12 16.4375 11.4125 15.2625 10.2375C14.0875 9.0625 13.5 7.65 13.5 6C13.5 4.35 14.0875 2.9375 15.2625 1.7625C16.4375 0.5875 17.85 0 19.5 0C21.15 0 22.5625 0.5875 23.7375 1.7625C24.9125 2.9375 25.5 4.35 25.5 6C25.5 6.575 25.4313 7.10625 25.2938 7.59375C25.1562 8.08125 24.95 8.55 24.675 9L19.5 18H16.05Z" fill={T} />
                  </svg>
                  <p style={{ color: TEXT, fontSize: 15, lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>
                    &quot; I shipped my SaaS tool on a Tuesday. By Friday I had 8 detailed reviews, 3 warm intros, and my first paying customer. &quot;
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "rgba(20,184,166,0.15)",
                    border: `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: T, fontSize: 13, fontWeight: 700, flexShrink: 0,
                  }}>R</div>
                  <div>
                    <p style={{ color: TEXT, fontSize: 13, fontWeight: 700, marginBottom: 1 }}>Michael Torres</p>
                    <p style={{ color: MUTED, fontSize: 12 }}>Indie Hacker</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
