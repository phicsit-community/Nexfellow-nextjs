// In-memory store as a Redis replacement for single-instance deployments (e.g., Render)
// This works identically to Redis for short-lived data like OTPs

const store = new Map();

const memoryStore = {
    async set(key, value, expiryType, expiryMs) {
        store.set(key, value);
        // Auto-expire like Redis "PX" option
        if (expiryType === "PX" && expiryMs) {
            setTimeout(() => store.delete(key), expiryMs);
        }
    },

    async get(key) {
        return store.get(key) || null;
    },

    async del(key) {
        store.delete(key);
    },
};

module.exports = memoryStore;
