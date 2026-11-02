"use client";

import { useEffect, useRef, useState } from "react";
import { hasCustomAvatar, getAvatarInitial } from "../../utils/avatar";
import styles from "./UserAvatar.module.css";

// Avatar hosts fail transiently (Google answers a burst of profile-photo
// requests with 503s), so a photo that fails is retried once before giving up.
const RETRY_DELAY_MS = 1500;

/**
 * A user's photo, or their initial when they have none or it won't load, so
 * never a broken image. `className` sizes and shapes both; other props
 * (onClick, mouse handlers, loading) go to whichever element renders.
 *
 * @param user - anything with picture / name / username
 */
export default function UserAvatar({ user, className = "", alt, ...rest }) {
  const picture = user?.picture;
  // "first" → (error) "waiting" → "retry" → (error) "failed", per picture:
  // a new picture starts over at "first"
  const [state, setState] = useState({ picture, phase: "first" });
  const phase = state.picture === picture ? state.phase : "first";
  const retryTimer = useRef(null);

  useEffect(() => () => clearTimeout(retryTimer.current), []);

  const handleError = () => {
    if (phase === "first") {
      setState({ picture, phase: "waiting" });
      retryTimer.current = setTimeout(() => setState({ picture, phase: "retry" }), RETRY_DELAY_MS);
    } else {
      setState({ picture, phase: "failed" });
    }
  };

  const label = alt || user?.name || user?.username || "User";

  if (!hasCustomAvatar(picture) || phase === "waiting" || phase === "failed") {
    return (
      <div className={`${className} ${styles.initial}`} role="img" aria-label={label} {...rest}>
        <span className={styles.letter}>{getAvatarInitial(user)}</span>
      </div>
    );
  }

  return (
    <img
      // A new element so the retry issues a fresh request
      key={phase}
      src={picture}
      alt={label}
      className={className}
      onError={handleError}
      {...rest}
    />
  );
}
