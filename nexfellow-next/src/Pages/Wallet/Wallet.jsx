"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Copy,
  Download,
  ExternalLink,
  Zap,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import api from "@/lib/axios";

const TEAL = "#14b8a6";
const PURPLE = "#7c3aed";
const AMBER = "#f59e0b";
const RED = "#ef4444";

const LIGHT = {
  bgPage: "#f8fafc",
  bgCard: "#ffffff",
  bgCardAlt: "#f8fafc",
  border: "#e2e8f0",
  borderSubtle: "#f1f5f9",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
};

const DARK = {
  bgPage: "#0d0d0d",
  bgCard: "#141414",
  bgCardAlt: "#111111",
  border: "#242424",
  borderSubtle: "#181818",
  textPrimary: "#f0f0f0",
  textSecondary: "#888888",
  textMuted: "#4a4a4a",
};

// Mirrors backend/constants/plans.js for display purposes only.
const PLAN_INFO = {
  free: { name: "Free", monthly: 0, credits: 30, color: TEAL, next: "builder_pro" },
  builder_pro: { name: "Builder Pro", monthly: 16, credits: 200, color: PURPLE, next: "founder" },
  founder: { name: "Founder", monthly: 49, credits: 600, color: AMBER, next: null },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatTile({ label, value, positive, tk }) {
  return (
    <div style={{
      background: tk.bgCardAlt,
      border: `1px solid ${tk.border}`,
      borderRadius: 10,
      padding: "12px 14px",
    }}>
      <p style={{
        fontSize: 11,
        fontWeight: 600,
        color: tk.textMuted,
        marginBottom: 6,
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}>
        {positive === true && <TrendingUp size={12} color={TEAL} />}
        {positive === false && <TrendingDown size={12} color={RED} />}
        {label}
      </p>
      <p style={{ fontSize: 20, fontWeight: 800, color: tk.textPrimary }}>{value}</p>
    </div>
  );
}

function TxIcon({ eventType }) {
  const color = eventType === "earn" ? TEAL : eventType === "penalty" ? RED : AMBER;
  return (
    <div style={{
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: `${color}18`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      {eventType === "earn"
        ? <TrendingUp size={15} color={color} />
        : <TrendingDown size={15} color={color} />}
    </div>
  );
}

const HISTORY_TABS = [
  { key: "all", label: "All" },
  { key: "earn", label: "Earned" },
  { key: "spend", label: "Spent" },
  { key: "plan", label: "Plan" },
];

export default function Wallet() {
  const { effectiveTheme } = useTheme();
  const tk = effectiveTheme === "dark" ? DARK : LIGHT;

  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [earnEvents, setEarnEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [historyTab, setHistoryTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profileRes, summaryRes, earnRes] = await Promise.all([
          api.get("/user/profile"),
          api.get("/credits/summary"),
          api.get("/credits/earn-events"),
        ]);
        if (cancelled) return;
        setProfile(profileRes.data);
        setSummary(summaryRes.data);
        setEarnEvents(earnRes.data.events ?? []);
      } catch (err) {
        toast.error("Couldn't load your wallet. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = { limit: 20 };
        if (historyTab !== "all") params.type = historyTab;
        const { data } = await api.get("/credits/history", { params });
        if (!cancelled) setTransactions(data.transactions ?? []);
      } catch (err) {
        if (!cancelled) toast.error("Couldn't load transaction history.");
      }
    })();
    return () => { cancelled = true; };
  }, [historyTab]);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const { data } = await api.post("/payments/portal");
      window.location.href = data.portalUrl;
    } catch (err) {
      const message = err?.response?.data?.error ?? "Couldn't open billing portal.";
      toast.error(message);
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!profile?.referralCodeString) return;
    navigator.clipboard.writeText(profile.referralCodeString);
    toast.success("Referral code copied");
  };

  const handleCopyLink = () => {
    const code = profile?.referralCodeString;
    const text = code
      ? `Join me on NexFellow — use my referral code ${code} when you sign up: ${window.location.origin}`
      : window.location.origin;
    navigator.clipboard.writeText(text);
    toast.success("Referral message copied");
  };

  const handleShareTwitter = () => {
    const code = profile?.referralCodeString;
    const text = code
      ? `Join me on NexFellow — use my referral code ${code} when you sign up!`
      : "Join me on NexFellow!";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.origin)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareWhatsapp = () => {
    const code = profile?.referralCodeString;
    const text = code
      ? `Join me on NexFellow — use my referral code ${code} when you sign up: ${window.location.origin}`
      : `Join me on NexFellow: ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const handleExportCsv = () => {
    if (!transactions.length) return;
    const rows = [
      ["Date", "Description", "Type", "Credits", "Balance after"],
      ...transactions.map((tx) => [
        new Date(tx.createdAt).toISOString(),
        tx.description,
        tx.eventType,
        tx.delta,
        tx.balanceAfter,
      ]),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexfellow-credit-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ background: tk.bgPage, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: tk.textSecondary, fontSize: 14 }}>Loading wallet…</p>
      </div>
    );
  }

  const tier = profile?.subscriptionTier ?? "free";
  const plan = PLAN_INFO[tier] ?? PLAN_INFO.free;
  const nextPlan = plan.next ? PLAN_INFO[plan.next] : null;

  return (
    <div style={{ background: tk.bgPage, minHeight: "100vh", padding: "32px 24px 64px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: tk.textPrimary, marginBottom: 4 }}>Wallet</h1>
        <p style={{ fontSize: 13, color: tk.textSecondary, marginBottom: 28 }}>
          Track your credit balance, earnings, and subscription.
        </p>

        {/* Row 1: balance + plan */}
        <div className="wallet-top-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* Total balance */}
          <div style={{ background: tk.bgCard, border: `1px solid ${tk.border}`, borderRadius: 16, padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: tk.textMuted, marginBottom: 4 }}>
              Total Credit Balance
            </p>
            {(profile?.subscriptionExpiresAt || profile?.nextFreeCreditGrantAt) && (
              <p style={{ fontSize: 12, color: tk.textMuted, marginBottom: 12 }}>
                {profile.subscriptionExpiresAt
                  ? `Resets ${formatDate(profile.subscriptionExpiresAt)}`
                  : `Next free credit grant ${formatDate(profile.nextFreeCreditGrantAt)}`}
              </p>
            )}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 44, fontWeight: 800, color: tk.textPrimary, lineHeight: 1 }}>
                {summary?.balance ?? 0}
              </span>
              <span style={{ fontSize: 14, color: tk.textSecondary }}>credits</span>
              <span style={{
                marginLeft: 8,
                fontSize: 11,
                fontWeight: 700,
                color: plan.color,
                background: `${plan.color}14`,
                border: `1px solid ${plan.color}30`,
                padding: "4px 10px",
                borderRadius: 20,
              }}>
                {plan.name}
              </span>
            </div>

            <div className="wallet-stat-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
              <StatTile label="Earned this week" value={`+${summary?.earnedThisWeek ?? 0}`} positive tk={tk} />
              <StatTile label="Spent this week" value={`-${summary?.spentThisWeek ?? 0}`} positive={false} tk={tk} />
              <StatTile label="All time earned" value={summary?.totalEarned ?? 0} tk={tk} />
              <StatTile label="All time spent" value={summary?.totalSpent ?? 0} tk={tk} />
            </div>

            <Link href="/premium#credit-packs" style={{ textDecoration: "none" }}>
              <div style={{
                marginTop: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                border: `1px solid ${TEAL}30`,
                background: `${TEAL}0d`,
                borderRadius: 10,
                padding: "12px 14px",
                cursor: "pointer",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Zap size={15} color={TEAL} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: tk.textPrimary }}>Running low? Buy more credits</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: TEAL }}>From $5 →</span>
              </div>
            </Link>
          </div>

          {/* Current plan */}
          <div style={{
            background: tk.bgCard,
            border: `1.5px solid ${plan.color}40`,
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: tk.textPrimary }}>{plan.name}</p>
              {tier !== "free" && (
                <button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  style={{ background: "none", border: "none", color: tk.textMuted, fontSize: 12, cursor: "pointer", padding: 0 }}
                >
                  {portalLoading ? "…" : "Manage"}
                </button>
              )}
            </div>
            <p style={{ fontSize: 12, color: tk.textSecondary, marginBottom: 16 }}>
              {tier === "free" ? "No card required" : `${profile.subscriptionInterval === "annual" ? "Annual" : "Monthly"} plan`}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Sparkles size={16} color={plan.color} />
              <span style={{ fontSize: 14, fontWeight: 700, color: tk.textPrimary }}>{plan.credits} credits</span>
              <span style={{ fontSize: 12, color: tk.textMuted }}>/mo</span>
            </div>

            <div style={{ flex: 1 }}>
              {profile?.subscriptionExpiresAt ? (
                <p style={{ fontSize: 12, color: tk.textMuted, marginBottom: 16 }}>
                  Renews {formatDate(profile.subscriptionExpiresAt)}
                </p>
              ) : profile?.nextFreeCreditGrantAt && (
                <p style={{ fontSize: 12, color: tk.textMuted, marginBottom: 16 }}>
                  Next grant {formatDate(profile.nextFreeCreditGrantAt)}
                </p>
              )}
            </div>

            {nextPlan && (
              <Link href="/premium" style={{ textDecoration: "none" }}>
                <div style={{
                  background: `${nextPlan.color}10`,
                  border: `1px solid ${nextPlan.color}30`,
                  borderRadius: 10,
                  padding: "10px 12px",
                  marginBottom: 12,
                  cursor: "pointer",
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: nextPlan.color, marginBottom: 2 }}>
                    Upgrade to {nextPlan.name} — ${nextPlan.monthly}/mo
                  </p>
                  <p style={{ fontSize: 11, color: tk.textMuted }}>
                    Get {nextPlan.credits} credits/mo and more →
                  </p>
                </div>
              </Link>
            )}

            {tier === "free" ? (
              <Link href="/premium" style={{ textDecoration: "none" }}>
                <button style={{
                  width: "100%",
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "none",
                  background: TEAL,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}>
                  Upgrade plan →
                </button>
              </Link>
            ) : (
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                style={{
                  width: "100%",
                  padding: "8px 0",
                  borderRadius: 10,
                  border: `1px solid ${tk.border}`,
                  background: "transparent",
                  color: tk.textSecondary,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: portalLoading ? "not-allowed" : "pointer",
                }}
              >
                Cancel subscription
              </button>
            )}
          </div>
        </div>

        {/* Earn more credits */}
        <div style={{ background: tk.bgCard, border: `1px solid ${tk.border}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: tk.textMuted, marginBottom: 16 }}>
            Earn more credits
          </p>
          <div className="wallet-earn-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {earnEvents.map((event) => (
              <div key={event.code} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                border: `1px solid ${tk.borderSubtle}`,
                borderRadius: 10,
                padding: "12px 14px",
              }}>
                <span style={{ fontSize: 13, color: tk.textSecondary }}>{event.description}</span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: TEAL,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}>
                  +{event.delta} cr
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: history + referral */}
        <div className="wallet-bottom-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          {/* Transaction history */}
          <div style={{ background: tk.bgCard, border: `1px solid ${tk.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: tk.textMuted }}>
                Transaction History
              </p>
              <button
                onClick={handleExportCsv}
                disabled={!transactions.length}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: `1px solid ${tk.border}`,
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 11,
                  color: tk.textSecondary,
                  cursor: transactions.length ? "pointer" : "not-allowed",
                }}
              >
                <Download size={12} /> Export CSV
              </button>
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {HISTORY_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setHistoryTab(t.key)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: `1px solid ${historyTab === t.key ? TEAL : tk.border}`,
                    background: historyTab === t.key ? `${TEAL}14` : "transparent",
                    color: historyTab === t.key ? TEAL : tk.textSecondary,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {transactions.length === 0 ? (
              <p style={{ fontSize: 13, color: tk.textMuted, padding: "24px 0", textAlign: "center" }}>
                No transactions yet.
              </p>
            ) : (
              <div>
                {transactions.map((tx) => (
                  <div key={tx._id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: `1px solid ${tk.borderSubtle}`,
                  }}>
                    <TxIcon eventType={tx.eventType} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, marginBottom: 2 }}>
                        {tx.description}
                      </p>
                      <p style={{ fontSize: 11, color: tk.textMuted }}>
                        {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: tx.delta > 0 ? TEAL : RED,
                      whiteSpace: "nowrap",
                    }}>
                      {tx.delta > 0 ? "+" : ""}{tx.delta} cr
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Referral */}
          <div style={{ background: tk.bgCard, border: `1px solid ${tk.border}`, borderRadius: 16, padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: tk.textMuted, marginBottom: 8 }}>
              Refer Builders, Earn Credits
            </p>
            <p style={{ fontSize: 12, color: tk.textSecondary, marginBottom: 16, lineHeight: 1.5 }}>
              Share your code. When a friend joins, you both get bonus credits.
            </p>

            {profile?.referralCodeString ? (
              <>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: tk.bgCardAlt,
                  border: `1px solid ${tk.border}`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 12,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: tk.textPrimary, letterSpacing: "0.04em" }}>
                    {profile.referralCodeString}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    style={{ background: "none", border: "none", color: TEAL, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}
                  >
                    <Copy size={13} /> Copy
                  </button>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleShareTwitter} style={{
                    flex: 1, padding: "8px 0", borderRadius: 8, border: `1px solid ${tk.border}`,
                    background: "transparent", color: tk.textSecondary, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  }}>
                    X / Twitter
                  </button>
                  <button onClick={handleShareWhatsapp} style={{
                    flex: 1, padding: "8px 0", borderRadius: 8, border: `1px solid ${tk.border}`,
                    background: "transparent", color: tk.textSecondary, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  }}>
                    WhatsApp
                  </button>
                  <button onClick={handleCopyLink} style={{
                    flex: 1, padding: "8px 0", borderRadius: 8, border: `1px solid ${tk.border}`,
                    background: "transparent", color: tk.textSecondary, fontSize: 11, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  }}>
                    <ExternalLink size={11} /> Copy link
                  </button>
                </div>
              </>
            ) : (
              <p style={{ fontSize: 12, color: tk.textMuted }}>No referral code on your account yet.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .wallet-top-grid { grid-template-columns: 1fr !important; }
          .wallet-bottom-grid { grid-template-columns: 1fr !important; }
          .wallet-earn-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .wallet-stat-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
