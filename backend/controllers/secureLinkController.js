const crypto = require("crypto");

// Store secure links temporarily
const secureLinks = new Map(); // { token: { url, expiresAt } }

const generateSecureLink = (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ message: "Invalid URL" });
  }

  // Generate a secure token
  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // Expires in 24 hours

  // Store link in memory (Use database in production)
  secureLinks.set(token, { url, expiresAt });

  const baseUrl = req.protocol + "://" + req.get("host");
  const secureUrl = `${process.env.SITE_URL}/secure/${token}`;

  return res.json({ secureUrl, expiresAt });
};

const validateSecureLink = (req, res) => {
  const { token } = req.params;

  if (!secureLinks.has(token)) {
    return res.status(404).json({ message: "Invalid or expired secure link" });
  }

  const { url, expiresAt } = secureLinks.get(token);

  if (Date.now() > expiresAt) {
    secureLinks.delete(token);
    return res.status(410).json({ message: "Secure link expired" });
  }

  // 🔹 If user is not authenticated, store redirect URL in cookies and ask them to log in
  if (!req.signedCookies.userjwt) {
    res.cookie("redirectUrl", url, {
      signed: true,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    return res.status(401).json({ redirect: "/login" });
  }

  return res.json({ redirect: url });
};

module.exports = { generateSecureLink, validateSecureLink };
