const axios = require("axios");
const sharp = require("sharp");

// Clerk always hands us an image_url, even when the account has no photo:
//   - email signups get a Clerk-generated silhouette (img.clerk.com, type "default")
//   - Google accounts without a photo get Google's "monogram": a flat coloured
//     square with the first letter of the *Google* account name in white.
// Neither is a photo the user chose, and the monogram's letter is wrong as soon
// as onboarding sets a different name (issue #46). Treat both as "no photo" so
// the app's own default is stored and the UI renders the user's real initial.
//
// Google uses the same URL shape for monograms and real photos, so a monogram
// can only be recognised from its pixels.

const SAMPLE_SIZE = 96;
const FETCH_TIMEOUT_MS = 4000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Returns the decoded payload of an img.clerk.com URL, e.g.
// { type: "default", ... } or { type: "proxy", src: "https://images.clerk.dev/oauth_google/..." }.
function decodeClerkImage(url) {
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname !== "img.clerk.com") return null;
    return JSON.parse(Buffer.from(pathname.slice(1), "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function isGoogleImage(url) {
  try {
    const { hostname } = new URL(url);
    if (hostname.endsWith(".googleusercontent.com")) return true;
    const src = decodeClerkImage(url)?.src || "";
    return src.includes("/oauth_google/") || src.includes("googleusercontent.com");
  } catch {
    return false;
  }
}

// A monogram is a solid background plus a glyph that is a pure blend of that
// background and white (anti-aliased edges included). Photos, logos and
// illustrations fail at least one of: same colour in all four corners, mostly
// background, every other pixel on the background→white line.
async function isMonogram(buffer) {
  const data = await sharp(buffer)
    .flatten({ background: "#ffffff" })
    .resize(SAMPLE_SIZE, SAMPLE_SIZE, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer();

  const n = SAMPLE_SIZE * SAMPLE_SIZE;
  const pixel = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

  const bg = pixel(0);
  const corners = [SAMPLE_SIZE - 1, n - SAMPLE_SIZE, n - 1].map(pixel);
  if (!corners.every((c) => dist(c, bg) <= 12)) return false;

  const toWhite = bg.map((v) => 255 - v);
  const len2 = toWhite[0] ** 2 + toWhite[1] ** 2 + toWhite[2] ** 2;
  if (Math.sqrt(len2) < 80) return false; // background too light for a white glyph

  let background = 0;
  let onLine = 0;
  let glyph = 0;
  for (let i = 0; i < n; i++) {
    const p = pixel(i);
    if (dist(p, bg) <= 12) {
      background++;
      continue;
    }
    const t =
      ((p[0] - bg[0]) * toWhite[0] + (p[1] - bg[1]) * toWhite[1] + (p[2] - bg[2]) * toWhite[2]) / len2;
    const projected = bg.map((v, k) => v + t * toWhite[k]);
    if (t >= -0.1 && t <= 1.1 && dist(p, projected) <= 24) {
      onLine++;
      if (t >= 0.6) glyph++;
    }
  }

  return (
    background / n >= 0.6 &&
    (background + onLine) / n >= 0.98 &&
    glyph / n >= 0.005 &&
    glyph / n <= 0.3
  );
}

// True when `url` is a provider-generated placeholder rather than a real photo.
// Only Clerk and Google images are ever inspected (never arbitrary URLs), and
// any fetch/decode failure answers false so a real photo is never dropped.
async function isPlaceholderAvatar(url) {
  if (!url) return false;
  if (decodeClerkImage(url)?.type === "default") return true;
  if (!isGoogleImage(url)) return false;

  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: FETCH_TIMEOUT_MS,
      maxContentLength: MAX_IMAGE_BYTES,
    });
    return await isMonogram(Buffer.from(res.data));
  } catch (err) {
    console.warn(`[placeholderAvatar] Could not inspect ${url}: ${err.message}`);
    return false;
  }
}

module.exports = { isPlaceholderAvatar, isMonogram };
