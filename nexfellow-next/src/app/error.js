"use client";

import { useEffect, useState } from "react";
import { canAutoReload, isChunkLoadError, reloadForChunkError } from "@/utils/chunkLoadError";

export default function Error({ error, reset }) {
    const isChunkError = isChunkLoadError(error);
    // Decided once on mount so the screen can't flip while the reload is in flight
    const [autoReload] = useState(() => isChunkError && canAutoReload());

    useEffect(() => {
        console.error(error);
        if (autoReload) reloadForChunkError();
    }, [error, autoReload]);

    if (autoReload) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <div className="h-8 w-8 mb-4 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground">Updating to the latest version…</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-2xl font-bold mb-2">
                {isChunkError ? "This page needs a refresh" : "Something went wrong"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                {isChunkError
                    ? "NexFellow was updated while you had this page open. Reload to get the latest version."
                    : "We couldn't load this page. Please try again, and if the problem continues, reload the page."}
            </p>
            <div className="flex gap-3">
                <button
                    onClick={() => (isChunkError ? window.location.reload() : reset())}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
                >
                    {isChunkError ? "Reload page" : "Try again"}
                </button>
                <button
                    onClick={() => window.location.assign("/")}
                    className="px-4 py-2 border border-border rounded-md hover:bg-muted"
                >
                    Go to home
                </button>
            </div>
            {error?.digest && (
                <p className="text-xs text-muted-foreground mt-6">Reference: {error.digest}</p>
            )}
        </div>
    );
}
