"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function FadeIn({ children, delay = 0, direction = "up", style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const yStart = direction === "up" ? 30 : direction === "down" ? -30 : 0;
  const xStart = direction === "left" ? 30 : direction === "right" ? -30 : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yStart, x: xStart }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
