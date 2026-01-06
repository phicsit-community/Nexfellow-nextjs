import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

const MetaTags = ({
  title = "NexFellow - Bringing Geeks Together",
  description = "Join NexFellow to connect with tech enthusiasts, participate in challenges, attend events, and grow your skills in a supportive community.",
  image,
  type = "website",
  url,
  contentId,
  contentType,
}) => {
  const [currentUrl, setCurrentUrl] = useState("https://nexfellow.com");

  // Update URL when component mounts or when URL prop changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(url || window.location.href);
    }
  }, [url]);

  // Generate OG image URL based on content type
  const getOgImageUrl = () => {
    if (contentId && contentType) {
      return `${process.env.NEXT_PUBLIC_SERVER_URL || "https://api.nexfellow.com"
        }/preview/og/${contentType}/${contentId}`;
    }

    // If image is provided, use it
    if (image) {
      return image;
    }

    // Default OG image with absolute URL
    return `https://nexfellow.com/og.png`;
  };

  const ogImage = getOgImageUrl();
  const siteTitle = title.includes("NexFellow")
    ? title
    : `${title} | NexFellow`;

  return (
    <Helmet
      titleTemplate="%s"
      defaultTitle="NexFellow"
      prioritizeSeoTags={true}
    >
      {/* Primary meta tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} key="description" />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={siteTitle} key="og:title" />
      <meta
        property="og:description"
        content={description}
        key="og:description"
      />
      <meta property="og:image" content={ogImage} key="og:image" />
      <meta property="og:url" content={currentUrl} key="og:url" />
      <meta property="og:type" content={type} key="og:type" />
      <meta property="og:site_name" content="NexFellow" key="og:site_name" />

      {/* Twitter */}
      <meta
        name="twitter:card"
        content="summary_large_image"
        key="twitter:card"
      />
      <meta name="twitter:title" content={siteTitle} key="twitter:title" />
      <meta
        name="twitter:description"
        content={description}
        key="twitter:description"
      />
      <meta name="twitter:image" content={ogImage} key="twitter:image" />
      <meta name="twitter:site" content="@nexfellow" key="twitter:site" />

      {/* Additional meta tags */}
      <meta name="robots" content="index, follow" key="robots" />
      <meta name="theme-color" content="#24b2b4" key="theme-color" />
      <meta
        name="apple-mobile-web-app-capable"
        content="yes"
        key="apple-mobile-web-app-capable"
      />
      <meta
        name="mobile-web-app-capable"
        content="yes"
        key="mobile-web-app-capable"
      />
      <link rel="canonical" href={currentUrl} key="canonical" />
    </Helmet>
  );
};

export default MetaTags;
