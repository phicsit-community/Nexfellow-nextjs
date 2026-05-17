"use client";

import { motion } from "framer-motion";
import { T, MUTED, BORDER2 } from "../shared/tokens";

const ACTIVITIES = [
  "James Harrison received 13 feedbacks on CloudStack today",
  "Emma Richardson received 18 feedbacks on DraftAI today",
  "Sophie Lambert received 7 feedbacks on PayShift today",
  "Harry Gallagher got 9 new matches on BuilderMap",
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          color: MUTED, fontSize: 12, fontWeight: 700,
          padding: "16px 14px 8px", whiteSpace: "nowrap", flexShrink: 0,
          textTransform: "uppercase", letterSpacing: "1.5px",
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
