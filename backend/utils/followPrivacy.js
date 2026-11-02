// Follow lists as they're shown to people. Legacy self-follow rows (from before
// self-follows were blocked; scripts/removeSelfFollows.js cleans them up) are
// dropped, and Settings → Privacy lets people hide their followers and
// following lists from everyone but themselves.

const sameId = (a, b) => String(a?._id ?? a) === String(b?._id ?? b);

const isOwner = (owner, viewerId) => Boolean(viewerId) && sameId(owner._id, viewerId);

/** A follow list (ids or populated users) without the owner themselves. */
const withoutSelf = (list, ownerId) => (list || []).filter((entry) => !sameId(entry, ownerId));

/** Which of the owner's follow lists the viewer may not see. */
const hiddenFollowLists = (owner, viewerId) => {
  if (isOwner(owner, viewerId)) return { followers: false, following: false };
  const settings = owner.privacySettings || {};
  return {
    followers: settings.showFollowers === false,
    following: settings.showFollowing === false,
  };
};

/**
 * Ready a profile payload's follow lists for this viewer: self rows dropped,
 * hidden lists removed and flagged so the client leaves them out instead of
 * showing 0.
 */
const prepareFollowLists = (details, owner, viewerId) => {
  const hidden = hiddenFollowLists(owner, viewerId);
  for (const field of ["followers", "following"]) {
    if (hidden[field]) {
      delete details[field];
      details[`${field}Hidden`] = true;
    } else if (Array.isArray(details[field])) {
      details[field] = withoutSelf(details[field], owner._id);
    }
  }
  return details;
};

module.exports = { hiddenFollowLists, prepareFollowLists, withoutSelf };
