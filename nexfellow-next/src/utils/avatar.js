// Accounts without a real photo carry our default picture (signup swaps out
// Google's letter monogram and Clerk's silhouette for it). Those render the
// user's own initial instead of a generic image.
export const hasCustomAvatar = (picture) =>
  Boolean(picture) && !/\/default-profile\.png(\?|$)/.test(picture);

// First letter of the registered name (i.e. the first name), else the username.
export const getAvatarInitial = (user) => {
  for (const source of [user?.name, user?.username]) {
    const letter = String(source || "").match(/[\p{L}\p{N}]/u)?.[0];
    if (letter) return letter.toUpperCase();
  }
  return "U";
};
