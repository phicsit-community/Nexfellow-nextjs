require("dotenv").config();
const path = require("path");
const { uploadOnBunny } = require("../utils/attachments");

const getBunnyStoragePath = (cdnUrl) => {
  try {
    const url = new URL(cdnUrl);
    return url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
  } catch {
    return null;
  }
};

(async () => {
  try {
    // Define paths for both images (relative to backend, not scripts)
    const profilePath = path.join(
      __dirname,
      "..",
      "public",
      "defaults",
      "default-profile.png"
    );
    const bannerPath = path.join(
      __dirname,
      "..",
      "public",
      "defaults",
      "default-banner.png"
    );

    // Upload profile image to Bunny's defaults folder
    console.log("🔄 Uploading profile image:", profilePath);
    const profileResult = await uploadOnBunny(
      profilePath,
      "defaults/default-profile.png"
    );
    if (!profileResult || !profileResult.url) {
      console.log("❌ Failed to upload profile image.");
      return;
    }
    console.log("✅ Profile image uploaded successfully!");
    console.log("🌐 URL:", profileResult.url);
    console.log("📂 Storage Path:", getBunnyStoragePath(profileResult.url));

    // Upload banner image to Bunny's defaults folder
    console.log("🔄 Uploading banner image:", bannerPath);
    const bannerResult = await uploadOnBunny(
      bannerPath,
      "defaults/default-banner.png"
    );
    if (!bannerResult || !bannerResult.url) {
      console.log("❌ Failed to upload banner image.");
      return;
    }
    console.log("✅ Banner image uploaded successfully!");
    console.log("🌐 URL:", bannerResult.url);
    console.log("📂 Storage Path:", getBunnyStoragePath(bannerResult.url));
  } catch (error) {
    console.error("🚨 Upload Error:", error.message);
  }
})();
