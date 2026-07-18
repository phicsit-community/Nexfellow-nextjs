"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import api from "@/lib/axios";

const TEAL = "#14b8a6";
const PURPLE = "#7c3aed";
const AMBER = "#f59e0b";

const LIGHT = {
  bgPage: "#ffffff",
  bgCard: "#ffffff",
  bgCardAlt: "#f8fafc",
  border: "#e2e8f0",
  borderSubtle: "#f1f5f9",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  toggleBg: "#f1f5f9",
  toggleActive: "#ffffff",
  toggleActiveShadow: "0 1px 4px rgba(0,0,0,0.10)",
  toggleActiveText: "#0f172a",
  toggleInactiveText: "#64748b",
  freeCreditsColor: "#94a3b8",
  freeCreditsBg: "#f8fafc",
  freeCreditsBorder: "#e2e8f0",
  valuePropBg: "#f8fafc",
  featureSectionBorder: "#f1f5f9",
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
  toggleBg: "#111111",
  toggleActive: "#222222",
  toggleActiveShadow: "0 1px 6px rgba(0,0,0,0.50)",
  toggleActiveText: "#f0f0f0",
  toggleInactiveText: "#666666",
  freeCreditsColor: "#606060",
  freeCreditsBg: "#111111",
  freeCreditsBorder: "#242424",
  valuePropBg: "#141414",
  featureSectionBorder: "#222222",
};

function CheckIcon({ color = TEAL, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7.5" fill={`${color}20`} />
      <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon({ tk, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7.5" fill={`${tk.textMuted}18`} />
      <path d="M10 6L6 10M6 6l4 4" stroke={tk.textMuted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeatureItem({ text, included = true, muted = false, color = TEAL, tk }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
      {included ? <CheckIcon color={color} /> : <XIcon tk={tk} />}
      <span style={{ fontSize: 13, color: muted ? tk.textMuted : tk.textSecondary, lineHeight: 1.5 }}>
        {text}
      </span>
    </div>
  );
}

function FeatureSection({ label, children, tk }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: tk.textMuted,
        marginBottom: 8,
        paddingTop: 12,
        borderTop: `1px solid ${tk.featureSectionBorder}`,
      }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function PlanCard({ plan, isAnnual, featured, tk, planId, onCheckout, checkoutLoading, isCurrent }) {
  const borderColor = featured === "pro"
    ? `${PURPLE}55`
    : featured === "founder"
    ? `${AMBER}55`
    : tk.border;

  const shadowStyle = featured
    ? `0 0 0 1px ${featured === "pro" ? PURPLE : AMBER}33, 0 8px 40px ${featured === "pro" ? PURPLE : AMBER}12`
    : "none";

  return (
    <div style={{
      background: tk.bgCard,
      border: `1.5px solid ${borderColor}`,
      borderRadius: 16,
      padding: "28px 24px",
      boxShadow: shadowStyle,
      display: "flex",
      flexDirection: "column",
      position: "relative",
    }}>
      {plan.badge && (
        <div style={{
          position: "absolute",
          top: -12,
          left: "50%",
          transform: "translateX(-50%)",
          background: plan.badgeBg,
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "4px 14px",
          borderRadius: 20,
          whiteSpace: "nowrap",
        }}>
          {plan.badge}
        </div>
      )}

      <p style={{ fontSize: 18, fontWeight: 700, color: tk.textPrimary, marginBottom: 4 }}>{plan.name}</p>
      <p style={{ fontSize: 13, color: tk.textSecondary, marginBottom: 20, lineHeight: 1.4 }}>{plan.subtitle}</p>

      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: tk.textPrimary, lineHeight: 1 }}>
          ${isAnnual ? plan.annualMonthly ?? plan.monthly : plan.monthly}
        </span>
        <span style={{ fontSize: 14, color: tk.textSecondary, marginLeft: 2 }}>/mo</span>
      </div>
      {plan.monthly === 0 ? (
        <p style={{ fontSize: 12, color: tk.textMuted, marginBottom: 16 }}>forever free · no card required</p>
      ) : isAnnual ? (
        <p style={{ fontSize: 12, color: tk.textMuted, marginBottom: 16 }}>
          ${plan.annualTotal}/yr · save 2 months
        </p>
      ) : null}

      {/* Credits widget */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: plan.name === "Free" ? tk.freeCreditsBg : plan.creditsBg,
        border: `1px solid ${plan.name === "Free" ? tk.freeCreditsBorder : plan.creditsBorder}`,
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 20,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: `${plan.name === "Free" ? tk.freeCreditsColor : plan.creditsColor}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1l2.09 5.26L17 7.27l-4 3.89.94 5.34L9 13.77l-4.94 2.73L5 11.16 1 7.27l5.91-.01L9 1z"
              fill={plan.name === "Free" ? tk.freeCreditsColor : plan.creditsColor} />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: plan.name === "Free" ? tk.freeCreditsColor : plan.creditsColor, lineHeight: 1 }}>
            {plan.creditsAmount}
          </span>
          <span style={{ fontSize: 11.5, color: plan.name === "Free" ? tk.freeCreditsColor : plan.creditsColor, opacity: 0.7, lineHeight: 1.3 }}>
            {plan.creditsSub}
          </span>
        </div>
      </div>

      {/* Features */}
      <div style={{ flex: 1 }}>
        {plan.sections.map((section, i) => (
          <FeatureSection key={i} label={section.label} tk={tk}>
            {section.items.map((item, j) => (
              <FeatureItem
                key={j}
                text={item.text}
                included={item.included !== false}
                muted={item.muted}
                color={plan.checkColor}
                tk={tk}
              />
            ))}
          </FeatureSection>
        ))}
      </div>

      <button
        onClick={planId && !isCurrent ? () => onCheckout(planId) : undefined}
        disabled={checkoutLoading !== null || isCurrent}
        style={{
          marginTop: 20,
          width: "100%",
          padding: "12px 0",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          cursor: checkoutLoading !== null || isCurrent ? "not-allowed" : "pointer",
          border: plan.ctaBorder(tk) || "none",
          background: isCurrent ? "transparent" : plan.ctaBg,
          color: isCurrent ? tk.textSecondary : plan.name === "Free" ? tk.textSecondary : plan.ctaColor,
          transition: "opacity 0.2s",
          opacity: checkoutLoading !== null && checkoutLoading !== planId ? 0.5 : 1,
        }}
        onMouseEnter={e => { if (checkoutLoading === null && !isCurrent) e.currentTarget.style.opacity = "0.82"; }}
        onMouseLeave={e => { if (checkoutLoading === null && !isCurrent) e.currentTarget.style.opacity = "1"; }}
      >
        {isCurrent ? "Current Plan" : checkoutLoading !== null && checkoutLoading === planId ? "Processing…" : plan.cta}
      </button>
    </div>
  );
}

const PLANS = [
  {
    name: "Free",
    subtitle: "Try NexFellow. no card, no catch, no expiry",
    monthly: 0,
    annualMonthly: 0,
    annualTotal: 0,
    creditsAmount: "30 credits",
    creditsSub: "per month · expires in 30 days",
    creditsColor: null,
    creditsBg: null,
    creditsBorder: null,
    checkColor: TEAL,
    cta: "Get started free",
    ctaBg: "transparent",
    ctaColor: null,
    ctaBorder: (tk) => `1.5px solid ${tk.border}`,
    sections: [
      {
        label: "Submissions",
        items: [{ text: "Unlimited product submissions (credit gate)" }],
      },
      {
        label: "Broadcasts",
        items: [{ text: "No broadcast access", included: false, muted: true }],
      },
      {
        label: "Posts",
        items: [
          { text: "Post up to 500 characters per post" },
          { text: "1 image attachments" },
        ],
      },
      {
        label: "Badge",
        items: [{ text: "No verified badge", included: false, muted: true }],
      },
      {
        label: "Platform",
        items: [
          { text: "BuilderMap (view only)" },
          { text: "Community feed" },
          { text: "No feedback analytics", included: false, muted: true },
          { text: "No priority review queue", included: false, muted: true },
        ],
      },
    ],
  },
  {
    name: "Builder Pro",
    subtitle: "For serious builders actively shipping products",
    monthly: 16,
    annualMonthly: 13,
    annualTotal: 160,
    badge: "Most Popular",
    badgeBg: PURPLE,
    creditsAmount: "200 credits",
    creditsSub: "per month · rollover up to 100",
    creditsColor: PURPLE,
    creditsBg: `${PURPLE}12`,
    creditsBorder: `${PURPLE}22`,
    checkColor: TEAL,
    cta: "Upgrade to Pro →",
    ctaBg: TEAL,
    ctaColor: "#fff",
    ctaBorder: () => "none",
    sections: [
      {
        label: "Submissions",
        items: [{ text: "Unlimited product submissions (credit-eligible)" }],
      },
      {
        label: "Broadcasts",
        items: [
          { text: "3 free broadcasts / month" },
          { text: "Extra broadcasts at ~10 cr each" },
          { text: "48 hr cooldown between sends" },
        ],
      },
      {
        label: "Posts",
        items: [
          { text: "Post up to 2,000 characters per post" },
          { text: "Up to 2 image attachments per post" },
        ],
      },
      {
        label: "Badge",
        items: [
          { text: "Blue verified badge on profile & posts" },
          { text: "Fellow Score + early adopter listing" },
        ],
      },
      {
        label: "Platform",
        items: [
          { text: "Full BuilderMap + connect requests" },
          { text: "Priority feedback queue [24hr SLA]" },
          { text: "Feedback analytics dashboard" },
        ],
      },
    ],
  },
  {
    name: "Founder",
    subtitle: "For teams, accelerators & community builders",
    monthly: 49,
    annualMonthly: 41,
    annualTotal: 490,
    badge: "Teams & Orgs",
    badgeBg: AMBER,
    creditsAmount: "600 credits",
    creditsSub: "per month · rollover up to 300",
    creditsColor: AMBER,
    creditsBg: `${AMBER}10`,
    creditsBorder: `${AMBER}22`,
    checkColor: AMBER,
    cta: "Go Founder →",
    ctaBg: "transparent",
    ctaColor: AMBER,
    ctaBorder: () => `1.5px solid ${AMBER}55`,
    sections: [
      {
        label: "Submissions",
        items: [{ text: "Unlimited product submissions (credit gate)" }],
      },
      {
        label: "Broadcasts",
        items: [
          { text: "Unlimited broadcasts" },
          { text: "Still credit-costed (~10 cr each)" },
          { text: "24 hr cooldown between sends" },
        ],
      },
      {
        label: "Posts",
        items: [
          { text: "Post up to 5,000 characters per post" },
          { text: "Up to 4 image attachments per post" },
        ],
      },
      {
        label: "Badge",
        items: [
          { text: "Orange verified badge on profile & posts" },
          { text: "Spotlight on early adopter board" },
        ],
      },
      {
        label: "Platform",
        items: [
          { text: "Everything in Pro" },
          { text: "Team seats (up to 5 members)" },
          { text: "Admin tools + dedicated support" },
        ],
      },
    ],
  },
];

const VALUE_PROPS = [
  {
    tag: "BUILDER PRO VS. ALTERNATIVES",
    headline: "$9/mo",
    headlineColor: PURPLE,
    body: "A product consultant charges $150–$500 per session. One feedback round on NexFellow with 10 verified builders costs less than a coffee meeting.",
  },
  {
    tag: "THE COFFEE TEST",
    headline: "$0.53/day",
    headlineColor: null, // uses tk.textPrimary
    body: "Builder Pro breaks down to 53 cents a day. The insight from one good feedback round can save months of building in the wrong direction.",
  },
  {
    tag: "WHAT YOU'RE REALLY PAYING FOR",
    headline: "Credibility",
    headlineColor: AMBER,
    body: "Your Fellow Score, verified badge, and public feedback track record signal to investors, accelerators, and co-founders. That's infrastructure, not a subscription.",
  },
];

const CREDIT_PACKS = [
  {
    id: "starter",
    name: "Starter pack",
    price: 5,
    subtitle: "For when you need feedback fast and run dry mid-launch. Never expires.",
    credits: 50,
    bonus: null,
    featured: false,
    items: ["Instant · no expiry", "2 feedback rounds", "Works on any plan"],
    cta: "Buy Starter",
  },
  {
    id: "growth",
    name: "Growth pack",
    price: 15,
    subtitle: "Most popular top-up. Covers a full sprint of product launches.",
    credits: 150,
    bonus: null,
    featured: true,
    items: ["Instant · no expiry", "7 feedback rounds", "Works on any plan"],
    cta: "Buy Growth",
  },
  {
    id: "scale",
    name: "Scale pack",
    price: 35,
    subtitle: "For builders running multiple products or community sprints.",
    credits: 400,
    bonus: null,
    featured: false,
    items: ["Instant · no expiry", "20 feedback rounds", "Works on any plan"],
    cta: "Buy Scale",
  },
];

const FAQ_ITEMS = [
  {
    q: "What is NexFellow Premium?",
    a: "NexFellow Premium is designed for builders who want to grow faster. You'll get priority feedback from verified builders within 24 hours, a verified badge that helps build trust with investors and potential co-founders, full access to BuilderMap to connect with other builders, and detailed insights that show exactly what users like, dislike, and think you should improve.",
    defaultOpen: true,
  },
  {
    q: "How does the feedback guarantee work?",
    a: "Premium members receive feedback requests that are prioritized within the community. Our goal is to help you receive actionable feedback within 24 hours of submitting your request."
  },
  {
    q: "Who provides the feedback?",
    a: "Feedback comes from real founders, builders, creators, marketers, developers, designers, and early adopters who are actively building products and startups."
  },
  {
    q: "Can I submit more than one product?",
    a: "Yes. Depending on your subscription, you can submit multiple products, updates, landing pages, features, or product iterations for feedback."
  },
  {
    q: "Is the feedback generated by AI?",
    a: "No. Feedback is provided by real people. We may use AI tools to improve organization and summaries, but the feedback itself comes from human reviewers."
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes. You can cancel your subscription at any time from your billing settings. Your benefits will remain active until the end of your current billing period."
  },
  {
    q: "Do you offer refunds?",
    a: "No, we do not offer refunds. If you believe you were charged incorrectly or experienced a billing issue, please contact our support team and we'll be happy to help."
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept major credit cards, debit cards, and other payment methods supported by our payment partner."
  },
  {
    q: "Will my subscription renew automatically?",
    a: "Yes. Subscriptions renew automatically at the end of each billing cycle unless canceled before the renewal date."
  },
  {
    q: "Do you offer discounts for annual subscriptions?",
    a: "Yes. Annual subscriptions may include discounted pricing compared to monthly billing."
  },
  {
    q: "How can I contact support?",
    a: <>You can reach our support team by emailing <a href="mailto:community@nexfellow.com" style={{ color: "inherit", textDecoration: "underline" }}>community@nexfellow.com</a>. We typically respond within one business day.</>
  }
]

function FaqItem({ q, a, defaultOpen, isLast, tk }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div style={{
      borderBottom: isLast ? "none" : `1px solid ${tk.border}`,
      padding: "20px 24px",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: 0,
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: tk.textPrimary }}>{q}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}
        >
          <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke={tk.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && a && (
        <p style={{ marginTop: 12, fontSize: 14, color: tk.textSecondary, lineHeight: 1.7 }}>{a}</p>
      )}
    </div>
  );
}

export default function Premium() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [currentTier, setCurrentTier] = useState(null);
  const { effectiveTheme } = useTheme();
  const tk = effectiveTheme === "dark" ? DARK : LIGHT;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/user/profile");
        if (!cancelled) setCurrentTier(data?.subscriptionTier ?? "free");
      } catch {
        if (!cancelled) setCurrentTier("free");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleCheckout = async (planId) => {
    const interval = isAnnual ? "annual" : "monthly";
    setCheckoutLoading(planId);
    try {
      const { data } = await api.post("/payments/checkout", { planId, interval });
      window.location.href = data.checkoutUrl;
    } catch (err) {
      const message = err?.response?.data?.error ?? "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePackCheckout = async (packId) => {
    setCheckoutLoading(packId);
    try {
      const { data } = await api.post("/payments/checkout-credit-pack", { packId });
      window.location.href = data.checkoutUrl;
    } catch (err) {
      const message = err?.response?.data?.error ?? "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <>
      <div style={{ background: tk.bgPage, minHeight: "100vh" }}>

        {/* Hero */}
        <section style={{ textAlign: "center", padding: "64px 24px 48px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: `${PURPLE}14`,
            color: PURPLE,
            border: `1px solid ${PURPLE}30`,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "6px 14px",
            borderRadius: 20,
            marginBottom: 24,
          }}>
            <span>✦</span>
            <span>Transparent Pricing</span>
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 800,
            color: tk.textPrimary,
            lineHeight: 1.2,
            maxWidth: 780,
            margin: "0 auto 32px",
          }}>
            <span style={{ display: "block" }}>Start free. Upgrade when</span>
            <span style={{ display: "block" }}>you're ready to ship faster.</span>
          </h1>

          {/* Billing toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              background: tk.toggleBg,
              border: effectiveTheme === "dark" ? `1px solid ${tk.border}` : "none",
              borderRadius: 24,
              padding: 4,
            }}>
              {["Monthly", "Annual"].map((label) => {
                const active = label === "Monthly" ? !isAnnual : isAnnual;
                return (
                  <button
                    key={label}
                    onClick={() => setIsAnnual(label === "Annual")}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 20,
                      border: "none",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      background: active ? tk.toggleActive : "transparent",
                      color: active ? tk.toggleActiveText : tk.toggleInactiveText,
                      boxShadow: active ? tk.toggleActiveShadow : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              border: `1px solid ${TEAL}40`,
              color: TEAL,
              background: `${TEAL}14`,
              padding: "8px 14px",
              borderRadius: 20,
              whiteSpace: "nowrap",
            }}>
              Save 2 months with annual
            </span>
          </div>
        </section>

        {/* Plans */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px" }}>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: tk.textMuted,
            marginBottom: 24,
          }}>
            Plans — Pricing & Credits
          </p>
          <div className="premium-plans-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            <PlanCard plan={PLANS[0]} isAnnual={isAnnual} tk={tk} planId={null} onCheckout={handleCheckout} checkoutLoading={checkoutLoading} isCurrent={currentTier === "free"} />
            <PlanCard plan={PLANS[1]} isAnnual={isAnnual} featured="pro" tk={tk} planId="builder_pro" onCheckout={handleCheckout} checkoutLoading={checkoutLoading} isCurrent={currentTier === "builder_pro"} />
            <PlanCard plan={PLANS[2]} isAnnual={isAnnual} featured="founder" tk={tk} planId="founder" onCheckout={handleCheckout} checkoutLoading={checkoutLoading} isCurrent={currentTier === "founder"} />
          </div>
        </section>

        {/* Value Props */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px" }}>
          <div style={{ border: `1px solid ${tk.border}`, padding: 32, borderRadius: 12 }}>
            <h2 style={{
              fontSize: "clamp(16px, 2.5vw, 20px)",
              fontWeight: 700,
              color: tk.textPrimary,
              marginBottom: 24,
            }}>
              Why this pricing is fair — and what makes it worth it
            </h2>
            <div className="premium-value-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {VALUE_PROPS.map((vp, i) => (
                <div key={i} style={{
                  background: tk.valuePropBg,
                  border: `1px solid ${tk.border}`,
                  borderRadius: 12,
                  padding: "20px 22px",
                }}>
                  <p style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: tk.textMuted,
                    marginBottom: 10,
                  }}>
                    {vp.tag}
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: vp.headlineColor ?? tk.textPrimary, marginBottom: 10 }}>
                    {vp.headline}
                  </p>
                  <p style={{ fontSize: 13, color: tk.textSecondary, lineHeight: 1.65 }}>{vp.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Credit Packs */}
        <section id="credit-packs" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px", scrollMarginTop: 24 }}>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: tk.textMuted,
            marginBottom: 24,
          }}>
            Buy Credits — Instant Top-Ups, Never Expire
          </p>
          <div className="premium-credits-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {CREDIT_PACKS.map((pack, i) => (
              <div key={i} style={{
                background: tk.bgCard,
                border: pack.featured ? `1.5px solid ${PURPLE}55` : `1.5px solid ${tk.border}`,
                borderRadius: 14,
                padding: "24px 22px",
                position: "relative",
                boxShadow: pack.featured ? `0 0 0 1px ${PURPLE}18, 0 8px 32px ${PURPLE}10` : "none",
                display: "flex",
                flexDirection: "column",
              }}>
                {pack.featured && (
                  <div style={{
                    position: "absolute",
                    top: -11,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: PURPLE,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    padding: "3px 12px",
                    borderRadius: 20,
                    whiteSpace: "nowrap",
                  }}>
                    Best value
                  </div>
                )}
                <p style={{ fontSize: 16, fontWeight: 700, color: tk.textPrimary, marginBottom: 4 }}>{pack.name}</p>
                {pack.subtitle && (
                  <p style={{ fontSize: 12, color: tk.textSecondary, lineHeight: 1.5, marginBottom: 12 }}>{pack.subtitle}</p>
                )}
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 34, fontWeight: 800, color: tk.textPrimary }}>${pack.price}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: pack.featured ? PURPLE : tk.textPrimary }}>
                    ✦ {pack.credits} credits
                  </span>
                  {pack.bonus && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: pack.featured ? PURPLE : TEAL,
                      background: pack.featured ? `${PURPLE}14` : `${TEAL}14`,
                      border: `1px solid ${pack.featured ? `${PURPLE}28` : `${TEAL}28`}`,
                      padding: "2px 8px",
                      borderRadius: 10,
                    }}>
                      {pack.bonus}
                    </span>
                  )}
                </div>
                <div style={{ marginBottom: 18, flex: 1 }}>
                  {pack.items.map((item, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                      <CheckIcon color={pack.featured ? PURPLE : TEAL} />
                      <span style={{ fontSize: 13, color: tk.textSecondary }}>{item}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handlePackCheckout(pack.id)}
                  disabled={checkoutLoading === pack.id}
                  style={{
                    width: "100%",
                    padding: "11px 0",
                    borderRadius: 9,
                    border: pack.featured ? "none" : `1.5px solid ${tk.border}`,
                    background: pack.featured ? TEAL : "transparent",
                    color: pack.featured ? "#fff" : tk.textSecondary,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: checkoutLoading === pack.id ? "default" : "pointer",
                    opacity: checkoutLoading === pack.id ? 0.7 : 1,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={e => { if (checkoutLoading !== pack.id) e.currentTarget.style.opacity = "0.82"; }}
                  onMouseLeave={e => { if (checkoutLoading !== pack.id) e.currentTarget.style.opacity = "1"; }}
                >
                  {checkoutLoading === pack.id ? "Redirecting…" : pack.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: tk.textMuted,
            marginBottom: 20,
          }}>
            Frequently Asked
          </p>
          <div style={{ border: `1px solid ${tk.border}`, borderRadius: 12, overflow: "hidden" }}>
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem
                key={i}
                q={item.q}
                a={item.a}
                defaultOpen={item.defaultOpen}
                isLast={i === FAQ_ITEMS.length - 1}
                tk={tk}
              />
            ))}
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .premium-plans-grid { grid-template-columns: 1fr !important; }
          .premium-value-grid { grid-template-columns: 1fr !important; }
          .premium-credits-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 600px) and (max-width: 900px) {
          .premium-value-grid { grid-template-columns: 1fr 1fr !important; }
          .premium-credits-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </>
  );
}
