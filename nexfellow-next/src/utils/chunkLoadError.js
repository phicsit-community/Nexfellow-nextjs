// A chunk load error means this tab is running JS from an older build whose chunks
// no longer exist on the server (usually right after a deploy). A full reload fetches
// fresh HTML that references the current chunks, which fixes it.

// If this page came from a reload this recently and still fails, reloading won't help
const RELOAD_GUARD_MS = 30_000;

const CHUNK_ERROR_PATTERN =
    /Loading (CSS )?chunk [\w-]+ failed|Failed to load chunk|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i;

export function isChunkLoadError(error) {
    if (!error) return false;
    if (error.name === "ChunkLoadError") return true;
    return CHUNK_ERROR_PATTERN.test(String(error.message ?? error));
}

// Uses the browser's navigation timing rather than storage for loop protection:
// authSlice's logout() clears all storage on every signed-out page load, which
// would wipe a stored marker right after the reload it was meant to guard.
export function canAutoReload() {
    if (typeof performance === "undefined") return false;
    const [navigation] = performance.getEntriesByType("navigation");
    return !(navigation?.type === "reload" && performance.now() < RELOAD_GUARD_MS);
}

/** Reloads the page unless it was just reloaded. Returns true if a reload was started. */
export function reloadForChunkError() {
    if (!canAutoReload()) return false;
    window.location.reload();
    return true;
}
