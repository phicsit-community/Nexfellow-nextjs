// Post draft attachments are Files, which localStorage can't hold (JSON turns a File
// into {} and blob: URLs die with the page), so they live in IndexedDB keyed by draft
// id. The draft list itself (text, channel, attachment types) stays in localStorage.

const DB_NAME = "nexfellow-post-drafts";
const STORE = "attachments";

const isSupported = () => typeof indexedDB !== "undefined";

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Runs `operation` in one transaction and resolves with its request's result once committed
async function withStore(mode, operation) {
    const db = await openDb();
    try {
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, mode);
            const request = operation(tx.objectStore(STORE));
            tx.oncomplete = () => resolve(request?.result);
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
        });
    } finally {
        db.close();
    }
}

/** files: [{ file: File, type: "image" | "video" }] */
export async function saveDraftFiles(draftId, files) {
    if (!isSupported()) throw new Error("IndexedDB is not available");
    await withStore("readwrite", (store) => store.put(files, draftId));
}

export async function loadDraftFiles(draftId) {
    if (!isSupported()) return [];
    return (await withStore("readonly", (store) => store.get(draftId))) || [];
}

export async function deleteDraftFiles(draftId) {
    if (!isSupported()) return;
    await withStore("readwrite", (store) => store.delete(draftId));
}

/** Deletes stored files for any draft not in keepIds (deleted, trimmed, or wiped drafts). */
export async function pruneDraftFiles(keepIds) {
    if (!isSupported()) return;
    const keep = new Set(keepIds);
    await withStore("readwrite", (store) => {
        const keysRequest = store.getAllKeys();
        keysRequest.onsuccess = () => {
            keysRequest.result.filter((key) => !keep.has(key)).forEach((key) => store.delete(key));
        };
    });
}

export function clearAllDraftFiles() {
    if (isSupported()) indexedDB.deleteDatabase(DB_NAME);
}
