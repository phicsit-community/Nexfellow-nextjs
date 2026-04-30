import { T, MUTED, TEXT, DARKER } from "../shared/tokens";

const SIDEBAR_CORE = [
  { icon: "🏠", label: "Home" },
  { icon: "📦", label: "My Products", badge: 3, active: true },
];
const SIDEBAR_DISCOVER = [
  { icon: "🌐", label: "BuildersMap", badge: "2 new" },
  { icon: "🚀", label: "Launches" },
  { icon: "📈", label: "Momentum Board" },
];
const SIDEBAR_COMMUNITY = [
  { icon: "👥", label: "Community", dot: true },
  { icon: "🏆", label: "Leaderboard" },
  { icon: "📥", label: "Inbox" },
];
const STATS = [
  { label: "TOTAL PRODUCTS", value: "4",   sub: "+2 this month",      icon: "📦" },
  { label: "TOTAL REVIEWS",  value: "62",  sub: "+14 this month",     icon: "💬" },
  { label: "AVG. RATING",    value: "4.1", sub: "↑0.3 vs last round", icon: "⭐" },
  { label: "RESPONSE RATE",  value: "94%", sub: "↑8% this week",      icon: "📊" },
];

function SidebarGroup({ title, items }) {
  return (
    <div style={{ padding: "0 12px", marginBottom: 12 }}>
      <div style={{ fontSize: 9, color: "rgba(148,163,184,0.5)", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 6 }}>
        {title}
      </div>
      {items.map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
          borderRadius: 6, marginBottom: 2,
          background: item.active ? "rgba(20,184,166,0.12)" : "transparent",
        }}>
          <span style={{ fontSize: 12 }}>{item.icon}</span>
          <span style={{ fontSize: 11, color: item.active ? T : MUTED, fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
          {item.badge && (
            <span style={{
              marginLeft: "auto", fontSize: 9, fontWeight: 700, borderRadius: 10, padding: "1px 5px",
              background: typeof item.badge === "number" ? T : "rgba(20,184,166,0.2)",
              color: typeof item.badge === "number" ? DARKER : T,
            }}>{item.badge}</span>
          )}
          {item.dot && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: T }} />}
        </div>
      ))}
    </div>
  );
}

export default function DashboardMockup() {
  return (
    <div style={{
      background: "#0a1628", borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.1)",
      overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
      width: "100%", maxWidth: 680,
    }}>
      {/* Top bar */}
      <div style={{ background: "#071220", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/NexFellowLogo.svg" alt="" style={{ height: 22 }} />
          <span style={{ color: T, fontWeight: 700, fontSize: 13 }}>NexFellow</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "4px 12px", display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: MUTED }}>🔍 Search</span>
            <span style={{ fontSize: 10, color: "rgba(148,163,184,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "1px 5px" }}>⌘K</span>
          </div>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white" }}>S</div>
        </div>
      </div>

      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <div style={{ width: 160, background: "#071220", padding: "16px 0", borderRight: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <SidebarGroup title="CORE"      items={SIDEBAR_CORE} />
          <SidebarGroup title="DISCOVER"  items={SIDEBAR_DISCOVER} />
          <SidebarGroup title="COMMUNITY" items={SIDEBAR_COMMUNITY} />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: 16, overflowX: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ color: TEXT, fontWeight: 700, fontSize: 15, margin: 0 }}>My products</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", color: MUTED, fontSize: 11, cursor: "pointer" }}>⬇ Export</button>
              <button style={{ background: T, color: DARKER, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ New submission</button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
            {[["All (4)", true], ["In review (2)", false], ["Launched (2)", false], ["Draft (1)", false]].map(([label, active], i) => (
              <div key={i} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: active ? 600 : 400, color: active ? DARKER : MUTED, background: active ? T : "rgba(255,255,255,0.04)", cursor: "pointer" }}>
                {label}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 8, color: MUTED, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: TEXT, fontSize: 20, fontWeight: 800 }}>{s.value}</span>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                </div>
                <div style={{ color: T, fontSize: 9, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Product row */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ color: TEXT, fontSize: 12, fontWeight: 600, flex: 2 }}>TaskFlow AI</span>
              <span style={{ fontSize: 9, background: T, color: DARKER, borderRadius: 4, padding: "2px 8px", fontWeight: 700 }}>LAUNCHED</span>
              <span style={{ fontSize: 9, background: "rgba(34,197,94,0.15)", color: "#22c55e", borderRadius: 4, padding: "2px 8px", fontWeight: 600 }}>DONE</span>
              <span style={{ color: MUTED, fontSize: 11, flex: 1 }}>12 reviews</span>
              <span style={{ color: "#f59e0b", fontSize: 11 }}>★ 4.2</span>
            </div>
            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 6, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, color: MUTED, marginBottom: 4 }}>Feedback (3)</div>
              <p style={{ color: "#cbd5e1", fontSize: 10, lineHeight: 1.5, margin: 0 }}>
                The onboarding is smooth but the pricing page caused confusion — users aren't clear on the difference between Starter and Pro. A comparison table would help a lot. Also the CTA button on mobile is hidden below the fold on smaller screens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
