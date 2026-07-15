"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    name: "Growth pack",
    price: 15,
    subtitle: "Most popular top-up. Covers a full sprint of product launches.",
    credits: 150,
    bonus: "+25 bonus",
    featured: true,
    items: ["Instant · no expiry", "7 feedback rounds", "1 free priority boost included"],
    cta: "Buy Growth",
  },
  {
    name: "Scale pack",
    price: 35,
    subtitle: "For builders running multiple products or community sprints.",
    credits: 400,
    bonus: "+75 bonus",
    featured: false,
    items: ["Instant · no expiry", "20 feedback rounds", "3 priority boosts and 1 board spotlight", "Works on any plan"],
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

  return (
    <>
      <div style={{ background: tk.bgPage, minHeight: "100vh" }}>

        {/* Header */}
        <header style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "10px 5px",
          borderBottom: `1px solid ${tk.borderSubtle}`,
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <svg width="240" height="64" viewBox="0 0 234 63" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M51.5655 9.32775C48.8684 7.6466 40.7709 15.0879 39.9092 14.2659C39.1925 13.5814 45.0669 8.6946 43.9059 6.85933C42.8592 5.20515 36.2348 7.22535 23.0283 11.3338C16.9689 13.2218 13.8455 14.2621 11.1754 16.9578C10.2456 17.8979 7.28786 20.8878 6.79854 25.2672C6.74973 25.6949 6.73561 26.0507 6.73047 26.2947V43.4363C6.73047 50.7273 13.5244 56.6363 21.9045 56.6363H41.6134C42.8194 56.644 47.8795 56.5516 52.1242 52.9684C52.5403 52.6165 56.9891 48.7533 57.0816 43.3823C57.0816 43.3053 57.0816 43.2411 57.0816 43.2C57.0816 38.2511 57.0816 33.3023 57.0816 28.3534C57.0816 28.207 57.106 27.8564 57.0816 27.3889C57.0225 26.2806 56.7669 25.3058 56.3572 24.2347C55.9295 23.1173 55.3298 22.0783 54.1302 19.9965C53.5973 19.073 52.8459 17.826 52.6764 17.5563C52.4324 17.171 52.4272 17.18 52.3373 16.9578C50.6986 12.9135 52.8138 10.1048 51.5655 9.32775Z" fill="#24B2B4" stroke="black" strokeWidth="0.235419" strokeMiterlimit="10"/>
              <path d="M50.7377 37.8542C49.1631 31.204 42.6157 31.904 42.6157 31.904C42.6157 31.904 39.405 32.0324 37.3681 34.5034C36.3008 35.7993 36.0131 37.2454 35.8153 38.2626C35.0987 41.9536 36.6206 43.6926 35.4082 45.045C34.5811 45.9671 33.1222 45.9966 31.9406 46.0197C30.759 46.0429 29.4003 46.0724 28.5411 45.2492C27.2349 43.9957 28.5064 42.1668 27.6356 38.2651C27.3595 37.0258 27.0769 35.7119 26.0842 34.506C24.046 32.0324 20.8365 31.9065 20.8365 31.9065C20.8365 31.9065 14.2866 31.2066 12.7146 37.8567C12.1867 40.0888 11.8336 40.5396 11.045 41.368C9.84931 42.6176 8.0911 42.9901 6.76184 43.1057C6.72358 44.1346 6.8238 45.164 7.0598 46.1662C7.47431 47.7959 8.20716 49.3275 9.21615 50.6728C9.86729 51.5539 10.6199 52.3553 11.4585 53.0603C13.0173 54.3416 14.8188 55.2947 16.755 55.8626C18.1201 56.2737 19.528 56.5263 20.9508 56.6152C21.4645 56.6486 21.7368 56.6435 23.4334 56.6409C24.8333 56.6409 26.2319 56.6409 27.6305 56.6409C31.152 56.6242 32.9141 56.6153 33.8979 56.6217C36.3381 56.6384 38.7911 56.6217 41.2377 56.6409C42.1638 56.655 43.0898 56.6005 44.0079 56.4778C45.016 56.3444 46.0096 56.1178 46.9759 55.801L47.1737 55.7342C48.6949 55.1927 50.1334 54.4424 51.4479 53.5047C52.3394 52.8332 53.147 52.0571 53.8534 51.1929C54.5084 50.4146 55.6951 48.9826 56.4297 46.8122C56.8346 45.6118 57.0449 44.3545 57.0526 43.0877C56.2512 43.1159 54.0897 43.0877 52.5999 41.7674C52.2108 41.4181 51.5185 41.1535 50.7377 37.8542Z" fill="#FFFEFF" stroke="black" strokeWidth="0.235419" strokeMiterlimit="10"/>
              <path d="M20.643 41.6023C22.5751 41.6023 24.1414 40.036 24.1414 38.1039C24.1414 36.1718 22.5751 34.6055 20.643 34.6055C18.7108 34.6055 17.1445 36.1718 17.1445 38.1039C17.1445 40.036 18.7108 41.6023 20.643 41.6023Z" fill="black"/>
              <path d="M43.1781 41.6023C45.1103 41.6023 46.6766 40.036 46.6766 38.1039C46.6766 36.1718 45.1103 34.6055 43.1781 34.6055C41.246 34.6055 39.6797 36.1718 39.6797 38.1039C39.6797 40.036 41.246 41.6023 43.1781 41.6023Z" fill="black"/>
              <path d="M31.908 50.2509C31.376 50.2507 30.8612 50.0629 30.4541 49.7205C28.7242 48.2692 27.2639 45.9369 26.5473 44.6757C26.3139 44.2688 26.2122 43.7996 26.2561 43.3326C26.3 42.8655 26.4874 42.4236 26.7926 42.0673C27.9984 40.6592 29.6154 39.6647 31.4161 39.2238C31.7432 39.1493 32.083 39.1493 32.4101 39.2238C34.2108 39.6647 35.8278 40.6592 37.0336 42.0673C37.3388 42.4236 37.526 42.8657 37.5697 43.3328C37.6134 43.7998 37.5114 44.269 37.2776 44.6757C36.561 45.9369 35.102 48.2718 33.3708 49.7205C32.9614 50.0649 32.443 50.2529 31.908 50.2509Z" fill="#FBCC18" stroke="black" strokeWidth="0.224343" strokeMiterlimit="10"/>
              <path d="M31.9076 44.5486C29.5149 44.1467 28.0547 43.3594 28.0547 43.3594C29.104 45.7212 31.9076 47.726 31.9076 47.726C31.9076 47.726 34.7177 45.7186 35.7682 43.3594C35.7682 43.3594 34.3015 44.1467 31.9076 44.5486Z" fill="black"/>
              {/* NEx — theme-aware fill */}
              <path d="M88.3048 24.1445L84.1513 44.9117H79.3147L72.4616 33.5199L70.1781 44.9117H64.4219L68.5753 24.1445H73.4107L80.2946 35.5068L82.5485 24.1445H88.3048Z" fill={tk.textPrimary}/>
              <path d="M105.927 38.2563H94.1189C94.327 40.0364 95.5432 40.8673 97.7689 40.8673C99.1919 40.8673 100.587 40.4216 101.655 39.5612L103.999 43.0917C101.981 44.5751 99.5785 45.1684 97.1447 45.1684C91.9831 45.1684 88.6016 42.3211 88.6016 37.8402C88.6016 32.5001 92.5469 28.5547 98.3314 28.5547C103.227 28.5547 106.253 31.4033 106.253 35.6184C106.241 36.507 106.132 37.3916 105.927 38.2563ZM94.4451 35.2896H101.062C101.091 33.5686 99.8752 32.5604 98.0656 32.5604C96.1661 32.5604 94.9794 33.6868 94.4451 35.2896Z" fill={tk.textPrimary}/>
              <path d="M118.651 36.9256L123.011 44.9063H117.019L114.824 40.6937L110.938 44.9063H104.559L112.598 36.6585L108.36 28.8242H114.268L116.404 32.9186L120.231 28.8242H126.432L118.651 36.9256Z" fill={tk.textPrimary}/>
              {/* Fellow — always teal */}
              <path d="M134.284 28.6781L133.364 33.2477H142.532L141.612 37.7864H132.474L131.05 44.9066H125.176L129.327 24.1445H145.585L144.665 28.6833L134.284 28.6781Z" fill="#24B2B4"/>
              <path d="M161.459 38.2563H149.651C149.86 40.0364 151.076 40.8673 153.3 40.8673C154.724 40.8673 156.119 40.4216 157.186 39.5612L159.53 43.0917C157.514 44.5751 155.11 45.1684 152.677 45.1684C147.516 45.1684 144.133 42.3211 144.133 37.8402C144.133 32.5001 148.079 28.5547 153.864 28.5547C158.76 28.5547 161.786 31.4033 161.786 35.6184C161.773 36.5069 161.664 37.3915 161.459 38.2563ZM149.978 35.2896H156.593C156.624 33.5686 155.406 32.5604 153.597 32.5604C151.699 32.5604 150.517 33.6868 149.978 35.2896Z" fill="#24B2B4"/>
              <path d="M166.922 22.8906H172.559L168.168 44.9036H162.531L166.922 22.8906Z" fill="#24B2B4"/>
              <path d="M176.204 22.8906H181.84L177.449 44.9036H171.812L176.204 22.8906Z" fill="#24B2B4"/>
              <path d="M181.602 37.8402C181.602 32.5296 185.725 28.5547 191.48 28.5547C196.618 28.5547 199.907 31.4328 199.907 35.8534C199.907 41.1935 195.783 45.1684 190.027 45.1684C184.9 45.1684 181.602 42.2608 181.602 37.8402ZM194.18 36.1501C194.18 34.2801 193.083 33.0677 191.154 33.0677C188.899 33.0677 187.327 34.8773 187.327 37.5769C187.327 39.4469 188.425 40.6336 190.353 40.6336C192.613 40.6297 194.188 38.8201 194.188 36.1501H194.18Z" fill="#24B2B4"/>
              <path d="M230.464 28.8242L221.683 44.9037H216.106L214.593 36.1525L209.875 44.9037H204.353L201.633 28.8242H206.794L208.248 38.4963L213.559 28.8242H218.396L219.879 38.4963L225.19 28.8242H230.464Z" fill="#24B2B4"/>
            </svg>
          </Link>
        </header>

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
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px" }}>
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
                  style={{
                    width: "100%",
                    padding: "11px 0",
                    borderRadius: 9,
                    border: pack.featured ? "none" : `1.5px solid ${tk.border}`,
                    background: pack.featured ? TEAL : "transparent",
                    color: pack.featured ? "#fff" : tk.textSecondary,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.82"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  {pack.cta}
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
