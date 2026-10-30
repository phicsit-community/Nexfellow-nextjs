// Mailbox providers people sign up with most, roughly by popularity (the first match
// wins a tie). They skip the DNS lookup, and an address one typo away from one of them
// (gmal.com, gmial.com, gmail.con, hotmial.com) gets a "did you mean" suggestion.
const PROVIDER_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "yahoo.co.in",
  "rediffmail.com",
  "live.com",
  "outlook.in",
  "yahoo.in",
  "ymail.com",
  "googlemail.com",
  "protonmail.com",
  "proton.me",
  "yahoo.co.uk",
  "hotmail.co.uk",
  "aol.com",
  "zoho.com",
  "msn.com",
  "me.com",
  "mac.com",
  "mail.com",
  "email.com",
  "gmx.com",
];

// Shorter domains (me.com, aol.com, live.com) are one edit away from too many real
// domains to guess at
const MIN_SUGGESTION_LENGTH = 9;

const verdicts = new Map();

export function getEmailDomain(email) {
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const domain = email.slice(at + 1).toLowerCase();
  return domain.includes(".") ? domain : null;
}

export const isProviderDomain = (domain) => PROVIDER_DOMAINS.includes(domain);

// Optimal string alignment distance: insert, delete, substitute, or swap two adjacent
// characters, so gmial → gmail is one edit, not two
function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

// "ekta@gmal.com" → "ekta@gmail.com"; null when the domain doesn't look like a typo
export function suggestEmail(email) {
  const domain = getEmailDomain(email);
  if (!domain || isProviderDomain(domain)) return null;
  const match = PROVIDER_DOMAINS.find(
    (provider) =>
      provider.length >= MIN_SUGGESTION_LENGTH && editDistance(domain, provider) === 1
  );
  return match ? `${email.slice(0, email.lastIndexOf("@"))}@${match}` : null;
}

// true: the domain has a mail server. false: it can't receive email. null: the check
// itself failed (timeout, server error), in which case callers let the address through.
export async function isDeliverableDomain(domain) {
  if (verdicts.has(domain)) return verdicts.get(domain);
  try {
    const res = await fetch(`/api/email-domain?domain=${encodeURIComponent(domain)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const { deliverable } = await res.json();
    if (typeof deliverable !== "boolean") return null;
    verdicts.set(domain, deliverable);
    return deliverable;
  } catch {
    return null;
  }
}
