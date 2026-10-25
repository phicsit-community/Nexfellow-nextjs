// Community accounts have a community page (/explore); everyone else has a normal
// profile (/user). Missing flags mean a normal account.
export const getProfilePath = (user) =>
  user?.isCommunityAccount && user?.createdCommunity
    ? `/explore/${user.username}`
    : `/user/${user.username}`;
