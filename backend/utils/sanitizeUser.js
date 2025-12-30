/**
 * Sanitizes a user object by removing all private fields.
 * Accepts a Mongoose document or plain object.
 * Returns a new object with only public fields.
 */
function sanitizeUser(userDoc) {
    if (!userDoc) return null;

    // Convert Mongoose document to plain object if needed
    const user = userDoc.toObject ? userDoc.toObject() : userDoc;

    // Select only public fields to expose
    const publicUser = {
        _id: user._id,
        name: user.name,
        username: user.username,
        picture: user.picture || null,
        banner: user.banner || null,
        subscriptionTier: user.subscriptionTier,
        registeredQuizzes: user.registeredQuizzes,
        registeredCommunityQuizzes: user.registeredCommunityQuizzes,
        country: user.country,
        profile: user.profile,
        verified: user.verified,
        verificationBadge: user.verificationBadge,
        communityBadge: user.communityBadge,
        premiumBadge: user.premiumBadge,
        joinedChallenges: user.joinedChallenges,
        followedCommunities: user.followedCommunities,
        createdCommunity: user.createdCommunity,
        isCommunityAccount: user.isCommunityAccount,
        communityRoles: user.communityRoles,
        milestones: user.milestones,
        themePreference: user.themePreference,
        privacySettings: user.privacySettings,
    };

    return publicUser;
}

module.exports = { sanitizeUser };
