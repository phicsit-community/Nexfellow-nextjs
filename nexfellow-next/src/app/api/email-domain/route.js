import { Resolver } from "node:dns/promises";
import { domainToASCII } from "node:url";

// Tells the sign-in/sign-up forms whether an email domain can receive mail, so a typo
// like ekta@gmal.com is caught before Clerk sends a verification code that never arrives.
// See components/EmailDomainGuard.

const resolver = new Resolver({ timeout: 2000, tries: 2 });

// Dot-separated hostname labels (after punycode conversion) ending in a non-numeric TLD
const DOMAIN_PATTERN =
  /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]([a-z0-9-]{0,61}[a-z0-9])?$/;

// true: has a mail server. false: can't receive mail. null: DNS itself failed.
async function hasMailServer(domain) {
  try {
    const records = await resolver.resolveMx(domain);
    // A lone "0 ." record is a null MX (RFC 7505): the domain declares it takes no
    // mail. gmail.co, gmail.cm and yahooo.com all publish one.
    return records.some((record) => record.exchange !== "");
  } catch (err) {
    // No such domain, or no MX records. RFC 5321 would fall back to the A record, but
    // in practice MX-less domains with an A record are parked typo domains (gmial.com,
    // hotmial.com, yaho.com), not mailboxes.
    if (err.code === "ENOTFOUND" || err.code === "ENODATA") return false;
    return null;
  }
}

export async function GET(request) {
  const domain = domainToASCII(
    request.nextUrl.searchParams.get("domain")?.trim().toLowerCase() ?? ""
  );
  // Not ours to judge: the client lets the address through and Clerk validates it
  if (!DOMAIN_PATTERN.test(domain)) {
    return Response.json({ error: "Invalid domain" }, { status: 400 });
  }

  const deliverable = await hasMailServer(domain);
  return Response.json(
    { deliverable },
    {
      headers: {
        "Cache-Control": deliverable === null ? "no-store" : "public, max-age=3600",
      },
    }
  );
}
