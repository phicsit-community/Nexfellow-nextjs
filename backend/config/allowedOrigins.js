// Origins allowed to call the API and open socket connections (site + admin panel).
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://admin.geekclash.in",
  "https://geekclash.in",
  "https://nexfellow.com",
  "https://www.nexfellow.com",
  "https://admin.nexfellow.com",
  "https://nexfellow-dark.onrender.com",
  "https://nexfellow.onrender.com",
  "https://nexfellow-nextjs-1.onrender.com",
  "https://nexfellow-nextjs.vercel.app",
  process.env.SITE_URL,
  process.env.ADMIN_URL,
];

const isAllowedOrigin = (origin) =>
  !origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");

module.exports = { isAllowedOrigin };
