'use client';

/**
 * Safari-compatible fetch wrapper for admin API calls.
 * 
 * This module provides a fetch function that works around Safari's ITP
 * by including an Authorization header alongside cookies.
 * 
 * Usage:
 *   import { safeFetch, getToken } from '@/lib/safeFetch';
 *   
 *   const response = await safeFetch(`${apiUrl}/endpoint`);
 *   // or with options
 *   const response = await safeFetch(url, { method: 'POST', body: JSON.stringify(data) });
 */

/**
 * Get the auth token from localStorage
 */
export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        const token = localStorage.getItem('token');
        return token ? JSON.parse(token) : null;
    } catch {
        return null;
    }
}

/**
 * Get the admin user ID from localStorage
 */
export function getAdminId(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
}

/**
 * Safari-compatible fetch that includes both cookie credentials AND
 * Authorization header for cross-origin requests.
 */
export async function safeFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = getToken();

    // Build headers
    const headers: Record<string, string> = {};

    // Add existing headers
    if (options.headers) {
        if (options.headers instanceof Headers) {
            options.headers.forEach((value, key) => {
                headers[key] = value;
            });
        } else if (Array.isArray(options.headers)) {
            options.headers.forEach(([key, value]) => {
                headers[key] = value;
            });
        } else {
            Object.assign(headers, options.headers);
        }
    }

    // Add Content-Type if not FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    // Add Authorization header if token exists (Safari fix)
    if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Still include for Chrome
    });
}

/**
 * Helper to make GET requests
 */
export async function safeGet(url: string): Promise<Response> {
    return safeFetch(url, { method: 'GET' });
}

/**
 * Helper to make POST requests with JSON body
 */
export async function safePost(url: string, body: unknown): Promise<Response> {
    return safeFetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

/**
 * Helper to make PUT requests with JSON body
 */
export async function safePut(url: string, body: unknown): Promise<Response> {
    return safeFetch(url, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

/**
 * Helper to make DELETE requests
 */
export async function safeDelete(url: string): Promise<Response> {
    return safeFetch(url, { method: 'DELETE' });
}

/**
 * Helper to make PATCH requests with JSON body
 */
export async function safePatch(url: string, body?: unknown): Promise<Response> {
    return safeFetch(url, {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
    });
}
