// Newest Unicode emoji version this device's fonts can draw. The picker lists
// emoji as images, but the textarea uses native glyphs, so emoji newer than
// the OS font (e.g. Windows 10) show up as empty boxes once inserted.
// One probe emoji per version; ZWJ sequences split into parts when unsupported.
const PROBES = [
  ["12.0", "\u{1F971}"],
  ["13.0", "\u{1F972}"],
  ["13.1", "\u{1F62E}‍\u{1F4A8}"],
  ["14.0", "\u{1FAE0}"],
  ["15.0", "\u{1FAE8}"],
  ["15.1", "\u{1F642}‍↔️"],
  ["16.0", "\u{1FAE9}"],
];

let cached;

const isSupported = (ctx, emoji, singleWidth) => {
  const size = 32;
  ctx.clearRect(0, 0, size * 3, size * 2);
  if (ctx.measureText(emoji).width > singleWidth * 1.3) return false;
  ctx.fillText(emoji, 0, 0);
  const { data } = ctx.getImageData(0, 0, size * 3, size * 2);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0 && Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) > 40) {
      return true; // coloured pixel: a real colour emoji, not a monochrome tofu box
    }
  }
  return false;
};

/** Returns e.g. "13.0", or null when every probed version renders. */
export const getSupportedEmojiVersion = () => {
  if (cached !== undefined) return cached;
  cached = null;
  if (typeof document === "undefined") return cached;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 64;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return cached;
    ctx.font = "32px sans-serif";
    ctx.textBaseline = "top";
    const singleWidth = ctx.measureText("\u{1F600}").width;
    let supported = "11.0";
    for (const [version, emoji] of PROBES) {
      if (!isSupported(ctx, emoji, singleWidth)) {
        cached = supported;
        return cached;
      }
      supported = version;
    }
  } catch {
    cached = null;
  }
  return cached;
};
