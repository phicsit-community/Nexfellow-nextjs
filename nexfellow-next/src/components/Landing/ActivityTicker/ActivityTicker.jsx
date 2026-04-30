"use client";

import { motion } from "framer-motion";
import { T, MUTED, DARKER, BORDER2 } from "../shared/tokens";

const ACTIVITIES = [
  "Vikash K.  submitted PricePilot for feedback · just now",
  "Sneha M.  earned +25 cr from a referral",
  "ShipLog  featured in this week's digest — +340 views",
  "Arjun R.  left a 5-star review for DevKit",
  "Priya S.  joined NexFellow as a reviewer",
  "BuilderDAO  got 12 new feedback responses",
  "Rohan T.  launched FlowMetrics — 3 reviews in 1hr",
  "Meera K.  submitted NoteSync for feedback",
];

export default function ActivityTicker() {
  const items = [...ACTIVITIES, ...ACTIVITIES];

  return (
    <div style={{
      background: "rgba(5,16,24,0.9)",
      borderTop: `1px solid ${BORDER2}`,
      borderBottom: `1px solid ${BORDER2}`,
      padding: "12px 0", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{
          background: T, color: DARKER, fontSize: 11, fontWeight: 700,
          padding: "4px 14px", whiteSpace: "nowrap", flexShrink: 0,
          textTransform: "uppercase", letterSpacing: "0.8px",
        }}>
          RECENT ACTIVITY
        </div>

        <div style={{ overflow: "hidden", flex: 1 }}>
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ display: "flex", whiteSpace: "nowrap" }}
          >
            {items.map((item, i) => (
              <span
                key={i}
                style={{ color: MUTED, fontSize: 13, padding: "0 32px", display: "inline-flex", alignItems: "center", gap: 12 }}
              >
                {item}
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T, display: "inline-block", opacity: 0.6 }} />
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
