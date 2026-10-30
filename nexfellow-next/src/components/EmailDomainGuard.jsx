"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  getEmailDomain,
  isDeliverableDomain,
  isProviderDomain,
  suggestEmail,
} from "@/utils/emailDomain";

// Clerk's prebuilt <SignIn>/<SignUp> only check that an address looks like an email, so
// a typo such as ekta@gmal.com goes straight to "Verify your email" and the code never
// arrives. Wrapped in this, their form submit is caught in the capture phase, before
// Clerk's React onSubmit sees it, and only let through once the domain is known to
// receive mail.

const EMAIL_INPUT = 'input[name="emailAddress"], input[name="identifier"]';

// Only show "Checking…" when the lookup is slow enough to notice
const CHECKING_DELAY_MS = 400;

// Clerk dev-instance test addresses (jane+clerk_test@example.com) never get real mail,
// and example.com publishes a null MX
const isClerkTestEmail = (email) => email.includes("+clerk_test@");

// A spot right under the email field, inside Clerk's card
function noticeSlot(input) {
  const field = input.closest(".cl-formField");
  if (!field) return null;
  let slot = field.querySelector(":scope > [data-email-domain-notice]");
  if (!slot) {
    slot = document.createElement("div");
    slot.setAttribute("data-email-domain-notice", "");
    field.append(slot);
  }
  return slot;
}

// Sets a React-controlled input's value so that its onChange fires
function setInputValue(input, value) {
  const { set } = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  set.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

const textStyle = { margin: "6px 0 0", fontSize: "13px", lineHeight: "1.5", textAlign: "left" };

const suggestionStyle = {
  background: "none",
  border: "none",
  padding: 0,
  font: "inherit",
  color: "#00d4a8",
  fontWeight: 600,
  textDecoration: "underline",
  cursor: "pointer",
};

export default function EmailDomainGuard({ children }) {
  const rootRef = useRef(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const root = rootRef.current;
    // Addresses that passed the check, or that the user kept after a suggestion; their
    // next submit goes straight through to Clerk
    const approved = new Set();
    let attempt = 0;
    let checkingTimer;

    const onSubmit = (event) => {
      const form = event.target;
      const input = form.querySelector(EMAIL_INPUT);
      if (!input) return;
      const email = input.value.trim();
      const domain = getEmailDomain(email);
      if (
        !domain ||
        isProviderDomain(domain) ||
        isClerkTestEmail(email) ||
        approved.has(email)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const current = ++attempt;
      const slot = noticeSlot(input);
      const suggestion = suggestEmail(email);
      clearTimeout(checkingTimer);
      checkingTimer = setTimeout(
        () => setNotice({ kind: "checking", slot }),
        CHECKING_DELAY_MS
      );

      isDeliverableDomain(domain).then((deliverable) => {
        // Superseded by an edit or another submit
        if (current !== attempt) return;
        clearTimeout(checkingTimer);
        if (deliverable === false) {
          setNotice({ kind: "undeliverable", slot, input, domain, suggestion });
          return;
        }
        approved.add(email);
        if (suggestion) {
          // Typo-squatted domains (gnail.com, hotmai.com) do receive mail, so this is
          // only a suggestion: pressing Continue again keeps the address as typed
          setNotice({ kind: "typo", slot, input, email, suggestion });
          return;
        }
        setNotice(null);
        if (form.isConnected) form.requestSubmit();
      });
    };

    const onInput = (event) => {
      if (!event.target.matches(EMAIL_INPUT)) return;
      attempt++;
      clearTimeout(checkingTimer);
      setNotice(null);
    };

    root.addEventListener("submit", onSubmit, true);
    root.addEventListener("input", onInput);
    return () => {
      root.removeEventListener("submit", onSubmit, true);
      root.removeEventListener("input", onInput);
      clearTimeout(checkingTimer);
    };
  }, []);

  const suggestionButton = notice?.suggestion && (
    <button
      type="button"
      style={suggestionStyle}
      onClick={() => {
        setInputValue(notice.input, notice.suggestion);
        notice.input.focus();
      }}
    >
      {notice.suggestion}
    </button>
  );

  let message = null;
  if (notice?.kind === "checking") {
    message = (
      <p aria-live="polite" style={{ ...textStyle, color: "#94a3b8" }}>
        Checking your email address…
      </p>
    );
  } else if (notice?.kind === "undeliverable") {
    message = (
      <p role="alert" style={{ ...textStyle, color: "#f87171" }}>
        {notice.domain} can&apos;t receive email.{" "}
        {suggestionButton ? (
          <>Did you mean {suggestionButton}?</>
        ) : (
          "Check your email address for typos."
        )}
      </p>
    );
  } else if (notice?.kind === "typo") {
    message = (
      <p role="status" style={{ ...textStyle, color: "#94a3b8" }}>
        Did you mean {suggestionButton}? If {notice.email} is right, press Continue
        again.
      </p>
    );
  }

  return (
    <div ref={rootRef} style={{ display: "contents" }}>
      {children}
      {message && (notice.slot ? createPortal(message, notice.slot) : message)}
    </div>
  );
}
