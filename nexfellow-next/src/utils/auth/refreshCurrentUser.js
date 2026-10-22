import api from "../../lib/axios";
import { setUser } from "../../store/slices/authSlice";

/**
 * Re-fetch the signed-in user's MongoDB record and merge it into Redux/localStorage.
 *
 * The cached user goes stale whenever the username changes server-side — new
 * accounts get an auto-generated username at signup and onboarding replaces it —
 * and pages that build URLs from the cached username then 404.
 *
 * @returns the merged user, or null if the server returned no payload
 */
export default async function refreshCurrentUser(dispatch, cachedUser) {
  const { data } = await api.get("/auth/getDetails", { withCredentials: true });
  if (!data?.payload) return null;

  const merged = { ...(cachedUser || {}), ...data.payload };
  dispatch(setUser(merged));
  return merged;
}
