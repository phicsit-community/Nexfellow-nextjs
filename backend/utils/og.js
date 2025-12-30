// server/utils/og.js
const escape = (s = '') => String(s).replace(/"/g, '&quot;');

async function buildDashboardOg({ username, models, fullUrlBase }) {
    const { User, Community } = models;

    const user = await User.findOne({ username }).lean().exec();
    const community = user?.isCommunityAccount && user?.createdCommunity
        ? await Community.findById(user.createdCommunity).lean().exec()
        : null;

    const title = community?.name || user?.name || 'NexFellow Dashboard';
    const description = community?.description || user?.bio || 'Discover profiles and communities on NexFellow.';

    // Prefer PNG/JPG for og:image; ensure absolute URL
    const image =
        community?.bannerUrl ||
        user?.avatarUrl ||
        `${fullUrlBase}/assets/og-default.png`;

    return {
        title: escape(title),
        description: escape(description),
        image,
    };
}

module.exports = { buildDashboardOg };
