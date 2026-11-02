import { useCallback, useEffect, useState } from "react";
import api from "../lib/axios";

// Follows are one-way: `isFollowing` is you → them, `followsYou` is them → you.
// Every follow button uses these labels so they read the same everywhere.
export const followLabel = ({ isFollowing, followsYou }) =>
  isFollowing ? "Unfollow" : followsYou ? "Follow back" : "Follow";

/**
 * Follow state for one user plus a toggle, shared by every follow button.
 *
 * @param targetUserId - the user to follow; nothing is fetched while it's empty
 * @param onChange - called with the new isFollowing after a successful toggle
 */
export default function useFollow(targetUserId, { onChange } = {}) {
  const [status, setStatus] = useState({ isFollowing: false, followsYou: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus({ isFollowing: false, followsYou: false });
    if (!targetUserId) return;
    let cancelled = false;
    api
      .get(`/user/followStatus/${targetUserId}`)
      .then(({ data }) => {
        if (cancelled) return;
        setStatus({
          isFollowing: Boolean(data.isFollowing),
          followsYou: Boolean(data.followsYou),
        });
      })
      // Signed out, or the user is gone: stay on "Follow"
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [targetUserId]);

  const toggle = useCallback(async () => {
    if (loading || !targetUserId) return;
    setLoading(true);
    const next = !status.isFollowing;
    try {
      await api.post(`/user/toggleFollow/${targetUserId}`, {
        action: next ? "follow" : "unfollow",
      });
      setStatus((prev) => ({ ...prev, isFollowing: next }));
      onChange?.(next);
    } finally {
      setLoading(false);
    }
  }, [loading, targetUserId, status.isFollowing, onChange]);

  return { ...status, loading, toggle, label: followLabel(status) };
}
