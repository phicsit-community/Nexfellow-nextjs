"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/Landing/Footer/Footer";

const TEAL = "#14b8a6";
const PURPLE = "#7c3aed";
const AMBER = "#f59e0b";

function CheckIcon({ color = TEAL, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7.5" fill={`${color}18`} />
      <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7.5" fill="#94a3b810" />
      <path d="M10 6L6 10M6 6l4 4" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CoinIcon({ color = "#94a3b8" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="9" fill={`${color}22`} stroke={color} strokeWidth="1.2" />
      <text x="10" y="14" textAnchor="middle" fill={color} fontSize="10" fontWeight="700">✦</text>
    </svg>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "#94a3b8",
      marginBottom: 8,
    }}>
      {children}
    </p>
  );
}

function FeatureItem({ text, included = true, muted = false, color = TEAL }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
      {included ? <CheckIcon color={color} /> : <XIcon />}
      <span style={{
        fontSize: 13,
        color: muted ? "#94a3b8" : "#334155",
        lineHeight: 1.5,
      }}>
        {text}
      </span>
    </div>
  );
}

function FeatureSection({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#94a3b8",
        marginBottom: 8,
        paddingTop: 12,
        borderTop: "1px solid #f1f5f9",
      }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function PlanCard({ plan, isAnnual, accent, badge, badgeBg, featured }) {
  const borderColor = featured === "pro" ? `${PURPLE}55` : featured === "founder" ? `${AMBER}55` : "#e2e8f0";
  const shadowStyle = featured ? `0 0 0 2px ${featured === "pro" ? PURPLE : AMBER}33, 0 8px 32px rgba(0,0,0,0.08)` : "0 1px 4px rgba(0,0,0,0.06)";

  return (
    <div style={{
      background: "#fff",
      border: `1.5px solid ${borderColor}`,
      borderRadius: 16,
      padding: "28px 24px",
      boxShadow: shadowStyle,
      display: "flex",
      flexDirection: "column",
      position: "relative",
    }}>
      {badge && (
        <div style={{
          position: "absolute",
          top: -12,
          left: "50%",
          transform: "translateX(-50%)",
          background: badgeBg,
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "4px 14px",
          borderRadius: 20,
          whiteSpace: "nowrap",
        }}>
          {badge}
        </div>
      )}

      {/* Plan title & subtitle */}
      <p style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{plan.name}</p>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.4 }}>{plan.subtitle}</p>

      {/* Price */}
      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
          ${isAnnual ? plan.annualMonthly ?? plan.monthly : plan.monthly}
        </span>
        <span style={{ fontSize: 14, color: "#64748b", marginLeft: 2 }}>/mo</span>
      </div>
      {plan.monthly !== 0 && (
        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
          {isAnnual
            ? `$${plan.annualTotal}/yr · save 2 months`
            : `$${plan.annualTotal}/yr · save 2 months`}
        </p>
      )}
      {plan.monthly === 0 && (
        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>forever free · no card required</p>
      )}

      {/* Credits widget */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: plan.creditsBg,
        borderRadius: 10,
        padding: "10px 14px",
        marginBottom: 20,
      }}>
        <CoinIcon color={plan.creditsColor} />
        <span style={{ fontSize: 12.5, color: plan.creditsColor, fontWeight: 600 }}>
          {plan.creditsText}
        </span>
      </div>

      {/* Features */}
      <div style={{ flex: 1 }}>
        {plan.sections.map((section, i) => (
          <FeatureSection key={i} label={section.label}>
            {section.items.map((item, j) => (
              <FeatureItem
                key={j}
                text={item.text}
                included={item.included !== false}
                muted={item.muted}
                color={plan.checkColor}
              />
            ))}
          </FeatureSection>
        ))}
      </div>

      {/* CTA button */}
      <button style={{
        marginTop: 20,
        width: "100%",
        padding: "12px 0",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        border: plan.ctaBorder || "none",
        background: plan.ctaBg,
        color: plan.ctaColor,
        transition: "opacity 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        {plan.cta}
      </button>
    </div>
  );
}

const PLANS = [
  {
    name: "Free",
    subtitle: "Try NexFellow — no card, no catch, no expiry",
    monthly: 0,
    annualMonthly: 0,
    annualTotal: 0,
    creditsText: "30 credits per month · expires in 30 days",
    creditsColor: "#94a3b8",
    creditsBg: "#f8fafc",
    checkColor: TEAL,
    cta: "Get started free",
    ctaBg: "transparent",
    ctaColor: "#334155",
    ctaBorder: "1.5px solid #e2e8f0",
    sections: [
      {
        label: "Submissions",
        items: [
          { text: "Unlimited product submissions (credit gate)" },
        ],
      },
      {
        label: "Broadcasts",
        items: [
          { text: "No broadcast access", included: false, muted: true },
        ],
      },
      {
        label: "Posts",
        items: [
          { text: "Post up to 150 words per post" },
          { text: "No image attachments", included: false, muted: true },
        ],
      },
      {
        label: "Badge",
        items: [
          { text: "No verified badge", included: false, muted: true },
        ],
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
    annualMonthly: 7,
    annualTotal: 86,
    creditsText: "200 credits per month · rollover up to 100",
    creditsColor: PURPLE,
    creditsBg: `${PURPLE}0d`,
    checkColor: TEAL,
    cta: "Upgrade to Pro →",
    ctaBg: TEAL,
    ctaColor: "#fff",
    sections: [
      {
        label: "Submissions",
        items: [
          { text: "Unlimited product submissions (credit-eligible)" },
        ],
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
          { text: "Post up to 500 words per post" },
          { text: "Up to 3 image attachments per post" },
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
    monthly: 29,
    annualMonthly: 23,
    annualTotal: 278,
    creditsText: "600 credits per month · rollover up to 300",
    creditsColor: AMBER,
    creditsBg: `${AMBER}12`,
    checkColor: AMBER,
    cta: "Go Founder →",
    ctaBg: "transparent",
    ctaColor: AMBER,
    ctaBorder: `1.5px solid ${AMBER}`,
    sections: [
      {
        label: "Submissions",
        items: [
          { text: "Unlimited product submissions (credit gate)" },
        ],
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
          { text: "Post up to 1,000 words per post" },
          { text: "Up to 10 image attachments per post" },
        ],
      },
      {
        label: "Badge",
        items: [
          { text: "Orange verified badge on profile & posts" },
          { text: "Community org account + orange badge" },
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
    accent: PURPLE,
    headline: "$9/mo",
    headlineColor: PURPLE,
    body: "A product consultant charges $150–$500 per session. One feedback round on NexFellow with 10 verified builders costs less than a coffee meeting.",
  },
  {
    tag: "THE COFFEE TEST",
    accent: "#0f172a",
    headline: "$0.30/day",
    headlineColor: "#0f172a",
    body: "Builder Pro breaks down to 30 cents a day. The insight from one good feedback round can save months of building in the wrong direction.",
  },
  {
    tag: "WHAT YOU'RE REALLY PAYING FOR",
    accent: AMBER,
    headline: "Credibility",
    headlineColor: AMBER,
    body: "Your Fellow Score, verified badge, and public feedback track record signal to investors, accelerators, and co-founders. That's infrastructure, not a subscription.",
  },
];

const CREDIT_PACKS = [
  {
    name: "Starter pack",
    price: 5,
    credits: 50,
    bonus: null,
    featured: false,
    items: ["Instant · no expiry", "+ 2 feedback rounds"],
    cta: "Buy Starter",
  },
  {
    name: "Growth pack",
    price: 12,
    credits: 150,
    bonus: "+20 bonus",
    featured: true,
    items: ["Instant · no expiry", "+ 7 feedback rounds", "+ 1 free priority boost included"],
    cta: "Buy Growth",
  },
  {
    name: "Scale pack",
    price: 29,
    credits: 400,
    bonus: "+60 bonus",
    featured: false,
    items: ["Instant · no expiry", "+ 20 feedback rounds", "+ 3 priority boosts + 1 board spotlight"],
    cta: "Buy Scale",
  },
];

const FAQ_ITEMS = [
  {
    q: "Why is Builder Pro $9 and not $2?",
    a: "Because $2 signals a side project. $9 signals a platform worth relying on. The price is part of the trust signal — for you, for reviewers, and for any investor or accelerator who sees your NexFellow profile. At 30 cents a day, it's one of the cheapest ways to get structured product validation from real builders anywhere in the world.",
    defaultOpen: true,
  },
  { q: "Can I get a refund if I'm not happy?", a: "" },
  { q: "What happens to my credits if I downgrade?", a: "" },
  { q: "Can I earn enough credits to not need a plan?", a: "" },
  { q: "Is there a trial period for Pro?", a: "" },
];

function FaqItem({ q, a, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div style={{
      borderBottom: "1px solid #f1f5f9",
      padding: "18px 0",
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
        <span style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{q}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}
        >
          <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && a && (
        <p style={{ marginTop: 12, fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{a}</p>
      )}
    </div>
  );
}

export default function Premium() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <>
      <div style={{ background: "#ffffff", minHeight: "100vh" }}>

        {/* Logo-only header */}
        <header style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "10px 5px", borderBottom: "1px solid #f1f5f9" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <svg width="240" height="64" viewBox="0 0 234 63" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M51.5655 9.32775C48.8684 7.6466 40.7709 15.0879 39.9092 14.2659C39.1925 13.5814 45.0669 8.6946 43.9059 6.85933C42.8592 5.20515 36.2348 7.22535 23.0283 11.3338C16.9689 13.2218 13.8455 14.2621 11.1754 16.9578C10.2456 17.8979 7.28786 20.8878 6.79854 25.2672C6.74973 25.6949 6.73561 26.0507 6.73047 26.2947V43.4363C6.73047 50.7273 13.5244 56.6363 21.9045 56.6363H41.6134C42.8194 56.644 47.8795 56.5516 52.1242 52.9684C52.5403 52.6165 56.9891 48.7533 57.0816 43.3823C57.0816 43.3053 57.0816 43.2411 57.0816 43.2C57.0816 38.2511 57.0816 33.3023 57.0816 28.3534C57.0816 28.207 57.106 27.8564 57.0816 27.3889C57.0225 26.2806 56.7669 25.3058 56.3572 24.2347C55.9295 23.1173 55.3298 22.0783 54.1302 19.9965C53.5973 19.073 52.8459 17.826 52.6764 17.5563C52.4324 17.171 52.4272 17.18 52.3373 16.9578C50.6986 12.9135 52.8138 10.1048 51.5655 9.32775Z" fill="#24B2B4" stroke="black" strokeWidth="0.235419" strokeMiterlimit="10"/>
              <path d="M50.7377 37.8542C49.1631 31.204 42.6157 31.904 42.6157 31.904C42.6157 31.904 39.405 32.0324 37.3681 34.5034C36.3008 35.7993 36.0131 37.2454 35.8153 38.2626C35.0987 41.9536 36.6206 43.6926 35.4082 45.045C34.5811 45.9671 33.1222 45.9966 31.9406 46.0197C30.759 46.0429 29.4003 46.0724 28.5411 45.2492C27.2349 43.9957 28.5064 42.1668 27.6356 38.2651C27.3595 37.0258 27.0769 35.7119 26.0842 34.506C24.046 32.0324 20.8365 31.9065 20.8365 31.9065C20.8365 31.9065 14.2866 31.2066 12.7146 37.8567C12.1867 40.0888 11.8336 40.5396 11.045 41.368C9.84931 42.6176 8.0911 42.9901 6.76184 43.1057C6.72358 44.1346 6.8238 45.164 7.0598 46.1662C7.47431 47.7959 8.20716 49.3275 9.21615 50.6728C9.86729 51.5539 10.6199 52.3553 11.4585 53.0603C13.0173 54.3416 14.8188 55.2947 16.755 55.8626C18.1201 56.2737 19.528 56.5263 20.9508 56.6152C21.4645 56.6486 21.7368 56.6435 23.4334 56.6409C24.8333 56.6409 26.2319 56.6409 27.6305 56.6409C31.152 56.6242 32.9141 56.6153 33.8979 56.6217C36.3381 56.6384 38.7911 56.6217 41.2377 56.6409C42.1638 56.655 43.0898 56.6005 44.0079 56.4778C45.016 56.3444 46.0096 56.1178 46.9759 55.801L47.1737 55.7342C48.6949 55.1927 50.1334 54.4424 51.4479 53.5047C52.3394 52.8332 53.147 52.0571 53.8534 51.1929C54.5084 50.4146 55.6951 48.9826 56.4297 46.8122C56.8346 45.6118 57.0449 44.3545 57.0526 43.0877C56.2512 43.1159 54.0897 43.0877 52.5999 41.7674C52.2108 41.4181 51.5185 41.1535 50.7377 37.8542Z" fill="#FFFEFF" stroke="black" strokeWidth="0.235419" strokeMiterlimit="10"/>
              <path d="M20.643 41.6023C22.5751 41.6023 24.1414 40.036 24.1414 38.1039C24.1414 36.1718 22.5751 34.6055 20.643 34.6055C18.7108 34.6055 17.1445 36.1718 17.1445 38.1039C17.1445 40.036 18.7108 41.6023 20.643 41.6023Z" fill="black"/>
              <path d="M43.1781 41.6023C45.1103 41.6023 46.6766 40.036 46.6766 38.1039C46.6766 36.1718 45.1103 34.6055 43.1781 34.6055C41.246 34.6055 39.6797 36.1718 39.6797 38.1039C39.6797 40.036 41.246 41.6023 43.1781 41.6023Z" fill="black"/>
              <path d="M31.908 50.2509C31.376 50.2507 30.8612 50.0629 30.4541 49.7205C28.7242 48.2692 27.2639 45.9369 26.5473 44.6757C26.3139 44.2688 26.2122 43.7996 26.2561 43.3326C26.3 42.8655 26.4874 42.4236 26.7926 42.0673C27.9984 40.6592 29.6154 39.6647 31.4161 39.2238C31.7432 39.1493 32.083 39.1493 32.4101 39.2238C34.2108 39.6647 35.8278 40.6592 37.0336 42.0673C37.3388 42.4236 37.526 42.8657 37.5697 43.3328C37.6134 43.7998 37.5114 44.269 37.2776 44.6757C36.561 45.9369 35.102 48.2718 33.3708 49.7205C32.9614 50.0649 32.443 50.2529 31.908 50.2509Z" fill="#FBCC18" stroke="black" strokeWidth="0.224343" strokeMiterlimit="10"/>
              <path d="M31.9076 44.5486C29.5149 44.1467 28.0547 43.3594 28.0547 43.3594C29.104 45.7212 31.9076 47.726 31.9076 47.726C31.9076 47.726 34.7177 45.7186 35.7682 43.3594C35.7682 43.3594 34.3015 44.1467 31.9076 44.5486Z" fill="black"/>
              <path d="M88.3048 24.1445L84.1513 44.9117H79.3147L72.4616 33.5199L70.1781 44.9117H64.4219L68.5753 24.1445H73.4107L80.2946 35.5068L82.5485 24.1445H88.3048Z" fill="#071a2c"/>
              <path d="M105.927 38.2563H94.1189C94.327 40.0364 95.5432 40.8673 97.7689 40.8673C99.1919 40.8673 100.587 40.4216 101.655 39.5612L103.999 43.0917C101.981 44.5751 99.5785 45.1684 97.1447 45.1684C91.9831 45.1684 88.6016 42.3211 88.6016 37.8402C88.6016 32.5001 92.5469 28.5547 98.3314 28.5547C103.227 28.5547 106.253 31.4033 106.253 35.6184C106.241 36.507 106.132 37.3916 105.927 38.2563ZM94.4451 35.2896H101.062C101.091 33.5686 99.8752 32.5604 98.0656 32.5604C96.1661 32.5604 94.9794 33.6868 94.4451 35.2896Z" fill="#071a2c"/>
              <path d="M118.651 36.9256L123.011 44.9063H117.019L114.824 40.6937L110.938 44.9063H104.559L112.598 36.6585L108.36 28.8242H114.268L116.404 32.9186L120.231 28.8242H126.432L118.651 36.9256Z" fill="#071a2c"/>
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
            background: `${PURPLE}12`,
            color: PURPLE,
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
            color: "#0f172a",
            lineHeight: 1.2,
            maxWidth: 780,
            margin: "0 auto 32px",
          }}>
            <span style={{ display: "block" }}>Start free. Upgrade when</span>
            <span style={{ display: "block" }}>you're ready to ship faster.</span>
          </h1>

          {/* Billing toggle */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0,
            background: "#f1f5f9",
            borderRadius: 24,
            padding: 4,
          }}>
            <button
              onClick={() => setIsAnnual(false)}
              style={{
                padding: "8px 20px",
                borderRadius: 20,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: !isAnnual ? "#fff" : "transparent",
                color: !isAnnual ? "#0f172a" : "#64748b",
                boxShadow: !isAnnual ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              style={{
                padding: "8px 20px",
                borderRadius: 20,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: isAnnual ? "#fff" : "transparent",
                color: isAnnual ? "#0f172a" : "#64748b",
                boxShadow: isAnnual ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s",
              }}
            >
              Annual
            </button>
            
          </div>
          <span style={{
              fontSize: 11,
              fontWeight: 700,
              border: `0.1px solid ${TEAL}55`,
              color: TEAL,
              background: `${TEAL}18`,
              padding: "10px 15px",
              borderRadius: 20,
              marginLeft: 10,
              whiteSpace: "nowrap",
            }}>
              Save 2 months with annual
            </span>
        </section>

        {/* Plans */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px" }}>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#94a3b8",
            marginBottom: 24,
          }}>
            Plans — Pricing & Credits
          </p>
          <div className="premium-plans-grid" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 20,
          }}>
            <PlanCard plan={PLANS[0]} isAnnual={isAnnual} />
            <PlanCard plan={PLANS[1]} isAnnual={isAnnual} featured="pro" badge="Most Popular" badgeBg={PURPLE} />
            <PlanCard plan={PLANS[2]} isAnnual={isAnnual} featured="founder" badge="Teams & Orgs" badgeBg={AMBER} />
          </div>
        </section>

        {/* Value Props */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px" }}>
          <h2 style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 24,
          }}>
            Why this pricing is fair — and what makes it worth it
          </h2>
          <div className="premium-value-grid" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}>
            {VALUE_PROPS.map((vp, i) => (
              <div key={i} style={{
                background: "#f8fafc",
                border: "1px solid #f1f5f9",
                borderRadius: 12,
                padding: "20px 22px",
              }}>
                <p style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#94a3b8",
                  marginBottom: 10,
                }}>
                  {vp.tag}
                </p>
                <p style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: vp.headlineColor,
                  marginBottom: 10,
                }}>
                  {vp.headline}
                </p>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>{vp.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Credit Packs */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px" }}>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#94a3b8",
            marginBottom: 24,
          }}>
            Buy Credits — Instant Top-Ups, Never Expire
          </p>
          <div className="premium-credits-grid" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}>
            {CREDIT_PACKS.map((pack, i) => (
              <div key={i} style={{
                background: "#fff",
                border: pack.featured ? `1.5px solid ${PURPLE}55` : "1.5px solid #e2e8f0",
                borderRadius: 14,
                padding: "24px 22px",
                position: "relative",
                boxShadow: pack.featured ? `0 0 0 2px ${PURPLE}22, 0 6px 24px rgba(0,0,0,0.07)` : "0 1px 4px rgba(0,0,0,0.05)",
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
                <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{pack.name}</p>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 34, fontWeight: 800, color: "#0f172a" }}>${pack.price}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: pack.featured ? PURPLE : "#0f172a",
                  }}>
                    ✦ {pack.credits} credits
                  </span>
                  {pack.bonus && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: pack.featured ? PURPLE : TEAL,
                      background: pack.featured ? `${PURPLE}14` : `${TEAL}14`,
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
                      <span style={{ fontSize: 13, color: "#64748b" }}>{item}</span>
                    </div>
                  ))}
                </div>
                <button style={{
                  width: "100%",
                  padding: "11px 0",
                  borderRadius: 9,
                  border: pack.featured ? "none" : "1.5px solid #e2e8f0",
                  background: pack.featured ? TEAL : "transparent",
                  color: pack.featured ? "#fff" : "#334155",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  {pack.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 80px" }}>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#94a3b8",
            marginBottom: 4,
          }}>
            Frequently Asked
          </p>
          <div>
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} defaultOpen={item.defaultOpen} />
            ))}
          </div>
        </section>
      </div>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .premium-plans-grid {
            grid-template-columns: 1fr !important;
          }
          .premium-value-grid {
            grid-template-columns: 1fr !important;
          }
          .premium-credits-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 600px) and (max-width: 900px) {
          .premium-value-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .premium-credits-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
