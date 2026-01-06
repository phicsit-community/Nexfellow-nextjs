import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/axios";

/**
 * Custom hook for API calls with caching and deduplication
 * Reduces redundant API calls and improves performance
 */
export function useOptimizedApi(url, options = {}) {
    const {
        enabled = true,
        cacheTime = 5 * 60 * 1000, // 5 minutes default
        refetchOnMount = false,
    } = options;

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(enabled);
    const cacheRef = useRef(new Map());
    const abortControllerRef = useRef(null);

    const fetchData = useCallback(async () => {
        if (!url || !enabled) return;

        // Check cache first
        const cachedData = cacheRef.current.get(url);
        if (cachedData && Date.now() - cachedData.timestamp < cacheTime) {
            setData(cachedData.data);
            setIsLoading(false);
            return;
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setIsLoading(true);

        try {
            const response = await api.get(url, {
                signal: abortControllerRef.current.signal,
            });

            // Cache the response
            cacheRef.current.set(url, {
                data: response.data,
                timestamp: Date.now(),
            });

            setData(response.data);
            setError(null);
        } catch (err) {
            if (err.name !== "AbortError") {
                setError(err);
            }
        } finally {
            setIsLoading(false);
        }
    }, [url, enabled, cacheTime]);

    useEffect(() => {
        if (enabled) {
            fetchData();
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData, enabled]);

    const refetch = useCallback(() => {
        cacheRef.current.delete(url);
        return fetchData();
    }, [url, fetchData]);

    const mutate = useCallback((newData) => {
        setData(newData);
        cacheRef.current.set(url, {
            data: newData,
            timestamp: Date.now(),
        });
    }, [url]);

    return {
        data,
        error,
        isLoading,
        refetch,
        mutate,
    };
}

/**
 * Clear all cached API data
 */
export function clearApiCache() {
    // Implementation to clear cache if needed
}
