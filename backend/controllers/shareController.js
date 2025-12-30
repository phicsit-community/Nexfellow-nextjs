const Community = require("../models/communityModel");

exports.communityMetaProxy = async (req, res) => {
  const { username } = req.params;
  try {
    // Find community by username (adjust field as per your model)
    const community = await Community.findOne({ username }).populate(
      "owner",
      "name banner"
    );
    if (!community) return res.status(404).send("Community not found");

    const title = community.owner?.name || "Community";
    const description = community.description || "Join our community!";
    // Use your existing OG image endpoint or direct banner
    const ogImageUrl = community.owner?.banner
      ? community.owner.banner
      : `${req.protocol}://${req.get("host")}/og.png`;

    // Respond with a minimal HTML page with OG tags and redirect
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta property="og:type" content="website" />
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="${ogImageUrl}" />
          <meta property="og:url" content="${req.protocol}://${req.get(
      "host"
    )}/community/${username}" />
          <meta http-equiv="refresh" content="0;url=/community/${username}" />
        </head>
        <body>
          Redirecting to community page...
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Server error");
  }
};
