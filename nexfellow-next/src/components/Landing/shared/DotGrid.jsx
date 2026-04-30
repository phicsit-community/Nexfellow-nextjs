import { T } from "./tokens";

export default function DotGrid() {
  return (
    <svg
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        opacity: 0.35, pointerEvents: "none",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.2" fill={T} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}
