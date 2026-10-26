// Id of the logged-in user as cached by the auth flow ("user" in localStorage).
export const getCurrentUserId = () => {
  if (typeof window === "undefined") return null;
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    const id = u?.id || u?._id;
    return id ? String(id) : null;
  } catch {
    return null;
  }
};

// True when `id` is the logged-in user (nobody can follow themselves).
export const isSelf = (id) => {
  const me = getCurrentUserId();
  return !!me && !!id && String(id) === me;
};
