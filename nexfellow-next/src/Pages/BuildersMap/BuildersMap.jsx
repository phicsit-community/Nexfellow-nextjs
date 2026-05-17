"use client";

import { useState } from "react";
import { MapPin, Plus, Minus, Settings2, ArrowRight } from "lucide-react";
import styles from "./BuildersMap.module.css";

const VB_W = 520;
const VB_H = 580;

// Approximate India outline (simplified polygon, viewBox 0 0 520 580)
const INDIA_PATH = [
  "M 210,55",
  "C 255,25 320,18 380,48",
  "L 440,95",
  "C 470,125 490,165 492,215",
  "L 488,265",
  "C 496,305 492,340 482,372",
  "L 468,408",
  "C 452,442 428,468 400,492",
  "L 368,520",
  "L 335,550",
  "C 310,562 282,565 258,552",
  "L 228,535",
  "L 196,510",
  "C 170,484 148,450 134,412",
  "L 118,368",
  "C 105,324 104,278 118,237",
  "L 138,193",
  "C 155,148 180,110 208,80",
  "Z",
].join(" ");

const BUILDERS = [
  { id: "RK", initials: "RK", name: "Raj Kumar", city: "Delhi", color: "#8B5CF6", svgX: 295, svgY: 168, match: 82, category: "Tech" },
  { id: "SM", initials: "SM", name: "Siddharth M.", city: "Pune", color: "#14B8A6", svgX: 165, svgY: 370, match: 76, category: "Design" },
  { id: "AS", initials: "AS", name: "Ananya Singh", city: "Pune", color: "#F97316", svgX: 212, svgY: 314, match: 79, category: "Product" },
  { id: "RM", initials: "RM", name: "Rohan Mehta", city: "Mumbai", color: "#14B8A6", svgX: 140, svgY: 346, match: 88, category: "SaaS", nameLabel: "Rohan", online: true },
  { id: "PM2", initials: "PM", name: "Priya M.", city: "Mumbai", color: "#EAB308", svgX: 128, svgY: 390, match: 71, category: "Design" },
  { id: "MK", initials: "MK", name: "Manish K.", city: "Bangalore", color: "#14B8A6", svgX: 252, svgY: 476, match: 80, category: "Tech" },
  { id: "DG", initials: "DG", name: "Dev Gupta", city: "Bangalore", color: "#14B8A6", svgX: 285, svgY: 493, match: 74, category: "Startup" },
  { id: "VR", initials: "VR", name: "Vivek R.", city: "Hyderabad", color: "#475569", svgX: 298, svgY: 388, match: 72, category: "Tech" },
  { id: "PK", initials: "PK", name: "Priya Kapoor", city: "Mumbai", color: "#F97316", svgX: 194, svgY: 360, match: 79, category: "Mobile", isDefault: true },
];

const CITY_LABELS = [
  { text: "DELHI", x: 312, y: 148 },
  { text: "PUNE", x: 152, y: 352 },
  { text: "BANGALORE", x: 240, y: 456 },
  { text: "HYDERABAD", x: 325, y: 368 },
];

const TOP_MATCHES = [
  {
    id: "RM",
    initials: "RM",
    name: "Rohan Mehta",
    color: "#14B8A6",
    role: "Founder · SaaS · Mumbai",
    status: "Shipping TaskFlow v2.1",
    match: 88,
    tags: ["React", "Go", "Growth", "B2B SaaS"],
    badge: "Open to co-found",
    online: true,
    compatibility: {
      overall: 88,
      items: [
        { label: "Skill fit", value: 92, color: "#22C55E" },
        { label: "Stage fit", value: 88, color: "#A855F7" },
        { label: "Goal alignment", value: 85, color: "#22C55E" },
        { label: "Interest overlap", value: 94, color: "#F97316" },
      ],
    },
    crossedPaths: [
      "Both reviewed TaskFlow AI",
      "Connected in Indie Hackers India",
      "Attended same office hours",
    ],
  },
  {
    id: "AS2",
    initials: "AS",
    name: "Anika Sharma",
    color: "#F97316",
    role: "Designer · Indie Hacker · Pune",
    status: "Working on UI kit",
    match: 84,
    tags: ["Figma", "React"],
    badge: null,
    online: false,
  },
];

const CITY_STATS = [
  { city: "Mumbai", count: 14, label: "Hottest city today", color: "#F97316" },
  { city: "Bangalore", count: 11, label: "↑ 3 this week", color: "#14B8A6" },
  { city: "Delhi", count: 8, label: "Co-found hotspot", color: "#F97316" },
  { city: "Hyderabad", count: 5, label: "Growing", color: "#A855F7" },
];

const PIN_OPTIONS = [
  { id: "coffee", label: "Open for coffee chat", desc: "Meet in person or video · this week" },
  { id: "cofounder", label: "Looking for co-founder", desc: "Share what you need · be specific" },
  { id: "review", label: "Open to reviewing products", desc: "Earn credits · help others ship" },
  { id: "advise", label: "Happy to advise", desc: "30-min office hours · my expertise" },
];

const LIVE_FEED = [
  { text: "Rohan M. just shipped TaskFlow v2.1 · Mumbai", color: "#22C55E" },
  { text: "Anika S. looking for a dev co-founder · Pune", color: "#F97316" },
  { text: "Meera K. submitted to 72hr Challenge · Bangalore", color: "#A855F7" },
  { text: "Rahul K. got 8 reviews on FocusDock", color: "#F97316" },
];

function getPopupPos(builder) {
  const xPct = (builder.svgX / VB_W) * 100;
  const yPct = (builder.svgY / VB_H) * 100;
  const left = xPct > 55 ? `${xPct - 33}%` : `${xPct + 4}%`;
  const top = `${Math.max(2, yPct - 14)}%`;
  return { left, top };
}

export default function BuildersMap() {
  const [activeTab, setActiveTab] = useState("matches");
  const [selectedBuilder, setSelectedBuilder] = useState(
    BUILDERS.find((b) => b.isDefault) || null
  );
  const [selectedMatch, setSelectedMatch] = useState(TOP_MATCHES[0]);
  const [activePins, setActivePins] = useState({ coffee: true });

  const handlePinClick = (builder) => {
    setSelectedBuilder((prev) => (prev?.id === builder.id ? null : builder));
  };

  const togglePin = (id) => {
    setActivePins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.body}>
        {/* ── Map Area ── */}
        <div className={styles.mapArea}>
          {/* Previous connections badge */}
          <div className={styles.connBadge}>
            <div className={styles.avatarStack}>
              {[
                { i: "SC", c: "#14B8A6" },
                { i: "AT", c: "#F97316" },
                { i: "EW", c: "#8B5CF6" },
              ].map((a) => (
                <span key={a.i} className={styles.stackAvatar} style={{ background: a.c }}>
                  {a.i}
                </span>
              ))}
            </div>
            <span className={styles.connText}>3 previous connections</span>
            <button className={styles.viewBtn}>
              View <ArrowRight size={11} />
            </button>
          </div>

          {/* Map canvas */}
          <div className={styles.mapCanvas}>
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              preserveAspectRatio="none"
              className={styles.mapSvg}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* India fill */}
              <path d={INDIA_PATH} fill="#C8E9EB" stroke="#8EC8CC" strokeWidth="1.5" />

              {/* City labels */}
              {CITY_LABELS.map(({ text, x, y }) => (
                <text
                  key={text}
                  x={x}
                  y={y}
                  fill="#94A3B8"
                  fontSize="9.5"
                  fontWeight="600"
                  letterSpacing="1.5"
                  textAnchor="middle"
                  style={{ userSelect: "none" }}
                >
                  {text}
                </text>
              ))}

            </svg>

            {/* Builder pins – HTML divs so they stay perfect circles */}
            <div className={styles.pinsOverlay}>
              {BUILDERS.map((b) => {
                const sel = selectedBuilder?.id === b.id;
                return (
                  <div
                    key={b.id}
                    className={`${styles.builderPin} ${sel ? styles.builderPinSel : ""}`}
                    style={{
                      left: `${(b.svgX / VB_W) * 100}%`,
                      top: `${(b.svgY / VB_H) * 100}%`,
                      background: b.color,
                    }}
                    onClick={() => handlePinClick(b)}
                  >
                    {b.initials}
                    <span className={`${styles.pinDot} ${b.online ? styles.pinDotGreen : styles.pinDotOrange}`} />
                    {b.nameLabel && <span className={styles.pinNameLabel}>{b.nameLabel}</span>}
                  </div>
                );
              })}
            </div>

            {/* Popup – HTML overlay aligned to SVG coords */}
            {selectedBuilder && (
              <div className={styles.popup} style={getPopupPos(selectedBuilder)}>
                <div className={styles.popupAvatar} style={{ background: selectedBuilder.color }}>
                  {selectedBuilder.initials}
                </div>
                <div className={styles.popupBody}>
                  <div className={styles.popupName}>{selectedBuilder.name}</div>
                  <div className={styles.popupCity}>{selectedBuilder.city}</div>
                  <div className={styles.popupMeta}>
                    <span className={styles.popupMatch}>{selectedBuilder.match}% match</span>
                    <span className={styles.popupSep}>|</span>
                    <span className={styles.popupCat}>{selectedBuilder.category}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map controls */}
          <div className={styles.mapControls}>
            <button className={styles.ctrlBtn}><Plus size={15} /></button>
            <button className={styles.ctrlBtn}><Minus size={15} /></button>
            <div className={styles.ctrlDivider} />
            <button className={styles.ctrlBtn}><Settings2 size={13} /></button>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className={styles.rightPanel}>
          <div className={styles.panelHdr}>
            <span className={styles.panelTitle}>Top matches near you</span>
            <span className={styles.builderBadge}>9 builders</span>
          </div>

          <div className={styles.tabBar}>
            <button
              className={`${styles.tabBtn} ${activeTab === "matches" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("matches")}
            >
              Matches
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === "nearby" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("nearby")}
            >
              Nearby
            </button>
          </div>

          <div className={styles.tabBody}>
            {activeTab === "matches" ? (
              <MatchesPanel match={selectedMatch} allMatches={TOP_MATCHES} onSelect={setSelectedMatch} />
            ) : (
              <NearbyPanel activePins={activePins} onToggle={togglePin} />
            )}
          </div>
        </div>
      </div>

      {/* ── Live Ticker ── */}
      <div className={styles.ticker}>
        <div className={styles.tickerLive}>
          <span className={styles.liveDot} />
          LIVE
        </div>
        <div className={styles.tickerScroll}>
          <div className={styles.tickerTrack}>
            {[...LIVE_FEED, ...LIVE_FEED].map((item, i) => (
              <span key={i} className={styles.tickerItem}>
                <span className={styles.tickerDot} style={{ background: item.color }} />
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Matches Panel ────────────────────────────────────────────────────────────

function MatchesPanel({ match, allMatches, onSelect }) {
  return (
    <div className={styles.matchesPanel}>
      {/* Featured match card */}
      <div className={styles.matchCard}>
        <div className={styles.cardTop}>
          <div className={styles.avatarWrap}>
            <div className={styles.bigAvatar} style={{ background: match.color }}>
              {match.initials}
            </div>
            {match.online && <span className={styles.onlineGreen} />}
          </div>
          <div>
            <div className={styles.cardName}>
              {match.name}
              <span className={styles.plusChip}>+</span>
            </div>
            <div className={styles.cardRole}>{match.role}</div>
          </div>
        </div>

        <div className={styles.nowRow}>
          <span className={styles.nowDot}>•</span>
          Now: {match.status}
        </div>

        <div className={styles.tagsRow}>
          {match.tags?.map((t) => (
            <span key={t} className={styles.tagChip}>{t}</span>
          ))}
        </div>

        {match.badge && <span className={styles.openBadge}>{match.badge}</span>}

        {/* Compatibility */}
        {match.compatibility && (
          <div className={styles.compatBlock}>
            <div className={styles.compatHdr}>
              <span className={styles.compatTitle}>COMPATIBILITY</span>
              <span className={styles.compatScore}>{match.compatibility.overall}%</span>
            </div>
            {match.compatibility.items.map((item) => (
              <div key={item.label} className={styles.barRow}>
                <span className={styles.barLabel}>{item.label}</span>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${item.value}%`, background: item.color }} />
                </div>
                <span className={styles.barPct}>{item.value}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Crossed paths */}
        {match.crossedPaths && (
          <div className={styles.crossedBlock}>
            <div className={styles.crossedTitle}>CROSSED PATHS</div>
            {match.crossedPaths.map((p, i) => (
              <div key={i} className={styles.crossedRow}>
                <span className={styles.crossArrow}>↗</span>
                {p}
              </div>
            ))}
          </div>
        )}

        <div className={styles.actionRow}>
          <button className={styles.connectBtn}>Connect</button>
          <button className={styles.messageBtn}>Message</button>
        </div>
      </div>

      {/* Top matches list */}
      <div className={styles.matchList}>
        <div className={styles.matchListHdr}>
          <span className={styles.matchListTitle}>TOP MATCHES</span>
          <button className={styles.scoresLink}>How scores work →</button>
        </div>
        {allMatches.map((m) => (
          <div
            key={m.id}
            className={`${styles.miniCard} ${m.id === match.id ? styles.miniCardSel : ""}`}
            onClick={() => onSelect(m)}
          >
            <div className={styles.miniAvaWrap}>
              <div className={styles.miniAva} style={{ background: m.color }}>{m.initials}</div>
              {m.online && <span className={styles.miniOnline} />}
            </div>
            <div className={styles.miniInfo}>
              <div className={styles.miniName}>
                {m.name}
                <span className={styles.plusChip}>+</span>
              </div>
              <div className={styles.miniRole}>{m.role}</div>
              {m.status && <div className={styles.miniStatus}>{m.status}</div>}
              {m.tags && (
                <div className={styles.miniTagRow}>
                  {m.tags.slice(0, 2).map((t) => (
                    <span key={t} className={styles.miniTag}>{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.miniScore} style={{ color: m.match >= 85 ? "#22C55E" : "#F97316" }}>
              {m.match}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Nearby Panel ─────────────────────────────────────────────────────────────

function NearbyPanel({ activePins, onToggle }) {
  return (
    <div className={styles.nearbyPanel}>
      <div className={styles.locationRow}>
        <MapPin size={13} color="#64748B" />
        <span className={styles.locationText}>Mumbai, Maharashtra</span>
        <span className={styles.locationBullet}>•</span>
      </div>
      <div className={styles.nearbyCount}>9 builders in your area</div>
      <div className={styles.nearbySubtitle}>
        Based on your listed location ·&nbsp;
        <button className={styles.updateLink}>Update →</button>
      </div>

      <div className={styles.cityGrid}>
        {CITY_STATS.map((s) => (
          <div key={s.city} className={styles.cityCard}>
            <div className={styles.cityName}>{s.city}</div>
            <div className={styles.cityCount} style={{ color: s.color }}>{s.count}</div>
            <div className={styles.cityStatLabel} style={{ color: s.color }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.dropSection}>
        <div className={styles.dropTitle}>DROP A PIN · TELL BUILDERS YOU'RE OPEN</div>
        {PIN_OPTIONS.map((opt) => (
          <div key={opt.id} className={styles.pinRow} onClick={() => onToggle(opt.id)}>
            <div>
              <div className={styles.pinLabel}>{opt.label}</div>
              <div className={styles.pinDesc}>{opt.desc}</div>
            </div>
            <div className={`${styles.toggle} ${activePins[opt.id] ? styles.toggleOn : ""}`}>
              <div className={styles.toggleThumb} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
