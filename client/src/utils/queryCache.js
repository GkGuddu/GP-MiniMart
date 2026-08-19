const cacheStore = new Map();
const inflightRequests = new Map();
const DEFAULT_TTL_MS = 5 * 60 * 1000;

export const getCachedData = (key) => {
    const entry = cacheStore.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
        cacheStore.delete(key);
        return null;
    }

    return entry.data;
};

export const setCachedData = (key, data, ttlMs = DEFAULT_TTL_MS) => {
    cacheStore.set(key, {
        data,
        expiry: Date.now() + ttlMs,
    });
};

export const fetchWithCache = async (key, fetcher, ttlMs = DEFAULT_TTL_MS) => {
    const cached = getCachedData(key);
    if (cached) {
        return cached;
    }

    if (inflightRequests.has(key)) {
        return inflightRequests.get(key);
    }

    const promise = (async () => {
        try {
            const result = await fetcher();
            setCachedData(key, result, ttlMs);
            return result;
        } finally {
            inflightRequests.delete(key);
        }
    })();

    inflightRequests.set(key, promise);
    return promise;
};

export const clearCache = (keyPattern) => {
    if (!keyPattern) {
        cacheStore.clear();
        return;
    }

    for (const key of cacheStore.keys()) {
        if (key.includes(keyPattern)) {
            cacheStore.delete(key);
        }
    }
};
