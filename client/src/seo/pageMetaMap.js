// src/seo/pageMetaMap.js

/**
 * @typedef {Object} PageMetaData
 * @property {string} url
 * @property {string} bundleEntryPoint
 * @property {string} title
 * @property {string} description
 * @property {string} [ogType]
 * @property {string} [ogUrl]
 * @property {string} [ogImage]
 * @property {string} [twitterCard]
 * @property {string} [twitterImage]
 * @property {string} [keywords]
 * @property {string} [author]
 * @property {string} [themeColor]
 */

// Hardcoded community slugs (comma-separated mirrored as an array)
const RAW_COMMUNITY_SLUGS = "devayan,iamdevayan,Subhadip4467,Deependra5701";

// Normalize: split, trim, filter blanks, dedupe
const COMMUNITY_SLUGS = Array.from(
    new Set(
        RAW_COMMUNITY_SLUGS.split(",")
            .map((s) => s.trim())
            .filter(Boolean)
    )
);

export const SITE = {
    title: "NexFellow - Bringing Geeks Together",
    description:
        "NexFellow connects creators, startups, and companies to build communities and grow their projects. Create, manage, and scale your ideas in one place.",
    image: "https://nexfellow.com/og.png",
    url: "https://nexfellow.com/",
    keywords:
        "NexFellow, online communities, creator platform, startup networking, business growth, build community, manage startups",
    author: "NexFellow Team",
    themeColor: "#000000",
};

/** @type {PageMetaData[]} */
const basePages = [
    {
        url: "index.html",
        bundleEntryPoint: "/src/main.jsx",
        title: SITE.title,
        description: SITE.description,
        ogType: "website",
        ogUrl: SITE.url,
        ogImage: SITE.image,
        twitterCard: "summary_large_image",
        twitterImage: SITE.image,
        keywords: SITE.keywords,
        author: SITE.author,
        themeColor: SITE.themeColor,
    },
];

const communityPages = COMMUNITY_SLUGS.map((username) => {
    const pageUrl = `https://nexfellow.com/community/${username}`;
    const image = SITE.image;

    return {
        url: `community/${username}/index.html`,
        bundleEntryPoint: "/src/main.jsx",
        title: `${username} | NexFellow`,
        description: `Join ${username} on NexFellow to connect, collaborate, and grow.`,
        ogType: "website",
        ogUrl: pageUrl,
        ogImage: image,
        twitterCard: "summary_large_image",
        twitterImage: image,
        keywords: SITE.keywords,
        author: SITE.author,
        themeColor: SITE.themeColor,
    };
});

export const pages = [...basePages, ...communityPages];
