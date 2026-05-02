"use client";
import { useEffect, useRef, useState } from "react";

export default function ProductShowcase() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // If the section is already visible on load, skip the animation
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // trigger when section bottom edge is at least 80px above viewport bottom
      { rootMargin: "0px 0px -80px 0px", threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ marginTop: 100, display: "flex", justifyContent: "center", overflow: "hidden" }}
    >
      <div style={{ position: "relative", width: "100%", maxWidth: 1348 }}>
        {/* Background SVG */}
        <img
          src="/product-showcase.svg"
          alt="Get honest feedback on product 10x faster"
          style={{ width: "100%", display: "block" }}
        />
        {/* Dashboard overlay — slides up when section scrolls into view */}
        <img
          src="/products.png"
          alt="NexFellow dashboard"
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            width: "92%",
            display: "block",
            transform: visible
              ? "translateX(-50%) translateY(0)"
              : "translateX(-50%) translateY(80px)",
            opacity: visible ? 1 : 0,
            transition: "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 3.5s ease",
          }}
        />
      </div>
    </section>
  );
}
