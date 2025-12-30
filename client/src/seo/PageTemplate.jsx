// src/seo/PageTemplate.jsx
import React from "react";

const PageTemplate = ({
    title,
    description,
    ogType = "website",
    ogUrl,
    ogImage,
    twitterCard = "summary_large_image",
    twitterImage,
    keywords = "NexFellow, online communities, creator platform, startup networking, business growth, build community, manage startups",
    author = "NexFellow Team",
    themeColor = "#000000",
}) => {
    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
                />

                {/* Primary Meta Tags */}
                <title>{title}</title>
                <meta name="title" content={title} />
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="author" content={author} />
                <meta name="robots" content="index, follow" />
                <meta name="theme-color" content={themeColor} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content={ogType} />
                {ogUrl ? <meta property="og:url" content={ogUrl} /> : null}
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                {ogImage ? <meta property="og:image" content={ogImage} /> : null}

                {/* Twitter */}
                <meta property="twitter:card" content={twitterCard} />
                {ogUrl ? <meta property="twitter:url" content={ogUrl} /> : null}
                <meta property="twitter:title" content={title} />
                <meta property="twitter:description" content={description} />
                {twitterImage ? <meta property="twitter:image" content={twitterImage} /> : null}

                {/* Favicons */}
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />

                {/* Fonts */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@800&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Klee+One:wght@400;600&display=swap"
                    rel="stylesheet"
                />
                <link href="https://fonts.googleapis.com/css?family=KoHo" rel="stylesheet" />
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/flag-icons@7.3.2/css/flag-icons.min.css"
                />
            </head>
            <body>
                <div id="root"></div>
                {/* Vite will inject JS and CSS assets here automatically. */}
            </body>
        </html>
    );
};

export default PageTemplate;
