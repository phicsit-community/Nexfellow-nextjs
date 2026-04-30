"use client";

export default function ProductShowcase() {
  return (
    <section style={{ marginTop: 100, display: "flex", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 1348 }}>
        {/* Background SVG */}
        <img
          src="/product-showcase.svg"
          alt="Get honest feedback on product 10x faster"
          style={{ width: "100%", display: "block" }}
        />
        {/* Dashboard overlay — bottom-aligned with the SVG */}
        <img
          src="/products.png"
          alt="NexFellow dashboard"
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "92%",
            display: "block",
          }}
        />
      </div>
    </section>
  );
}
