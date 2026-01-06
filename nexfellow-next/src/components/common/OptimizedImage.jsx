"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Optimized Image component that uses Next.js Image optimization
 * with fallback and loading states
 */
export default function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    quality = 75,
    fallbackSrc = "/assets/default-avatar.png",
    ...props
}) {
    const [imgSrc, setImgSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);

    const handleError = () => {
        setImgSrc(fallbackSrc);
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    return (
        <div className={`relative ${className}`}>
            <Image
                src={imgSrc || fallbackSrc}
                alt={alt}
                width={width}
                height={height}
                priority={priority}
                quality={quality}
                onError={handleError}
                onLoad={handleLoad}
                className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"
                    }`}
                {...props}
            />
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            )}
        </div>
    );
}
