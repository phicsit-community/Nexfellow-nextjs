"use client";

import { useEffect } from "react";
import { isChunkLoadError, reloadForChunkError } from "@/utils/chunkLoadError";

/**
 * Chunk failures during render are handled by app/error.js. This catches the ones
 * outside render (e.g. an import() in a click handler), which would otherwise fail
 * silently and leave the UI half-broken until the user reloads.
 */
export default function ChunkErrorRecovery() {
    useEffect(() => {
        const handleRejection = (event) => {
            if (isChunkLoadError(event.reason)) reloadForChunkError();
        };
        window.addEventListener("unhandledrejection", handleRejection);
        return () => window.removeEventListener("unhandledrejection", handleRejection);
    }, []);

    return null;
}
