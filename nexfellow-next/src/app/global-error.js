"use client";

import { useEffect, useState } from "react";
import { canAutoReload, isChunkLoadError, reloadForChunkError } from "@/utils/chunkLoadError";

// Replaces the root layout when it fails, so it renders its own <html>/<body> and
// uses inline styles (globals.css comes from the layout and may not be loaded)
export default function GlobalError({ error }) {
    const isChunkError = isChunkLoadError(error);
    const [autoReload] = useState(() => isChunkError && canAutoReload());

    useEffect(() => {
        console.error(error);
        if (autoReload) reloadForChunkError();
    }, [error, autoReload]);

    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 16,
                    textAlign: "center",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    background: "#fff",
                    color: "#111",
                }}
            >
                {autoReload ? (
                    <p style={{ color: "#666" }}>Updating to the latest version…</p>
                ) : (
                    <>
                        <h2 style={{ fontSize: 24, margin: "0 0 8px" }}>
                            {isChunkError ? "This page needs a refresh" : "Something went wrong"}
                        </h2>
                        <p style={{ color: "#666", maxWidth: 420, margin: "0 0 24px" }}>
                            {isChunkError
                                ? "NexFellow was updated while you had this page open. Reload to get the latest version."
                                : "We couldn't load NexFellow. Please reload the page, and if the problem continues, try again in a few minutes."}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: "8px 16px",
                                background: "#24b2b4",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 15,
                            }}
                        >
                            Reload page
                        </button>
                        {error?.digest && (
                            <p style={{ color: "#999", fontSize: 12, marginTop: 24 }}>
                                Reference: {error.digest}
                            </p>
                        )}
                    </>
                )}
            </body>
        </html>
    );
}
