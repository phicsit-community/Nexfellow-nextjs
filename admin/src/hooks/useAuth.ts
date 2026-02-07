'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface AuthData {
    adminId: string | null;
    token: string | null;
    isReady: boolean;
}

/**
 * Custom hook to get auth data with Safari compatibility
 * Falls back to localStorage if Redux hasn't rehydrated yet
 */
export function useAuth(): AuthData {
    const { user, token } = useSelector((state: RootState) => state.user);
    const [authData, setAuthData] = useState<AuthData>({
        adminId: null,
        token: null,
        isReady: false,
    });

    useEffect(() => {
        // Try Redux first, then fall back to localStorage (Safari compatibility)
        let adminId = user;
        let authToken = token;

        if (adminId && typeof adminId === 'object') {
            // @ts-ignore
            adminId = adminId.id || adminId._id || null;
        }

        if (!adminId) {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    if (typeof parsedUser === 'object' && parsedUser !== null) {
                        adminId = parsedUser.id || parsedUser._id;
                    } else {
                        adminId = parsedUser;
                    }
                }
            } catch (e) {
                console.error('Error reading user from localStorage:', e);
            }
        }

        if (!authToken) {
            try {
                const storedToken = localStorage.getItem('token');
                if (storedToken) {
                    authToken = JSON.parse(storedToken);
                }
            } catch (e) {
                console.error('Error reading token from localStorage:', e);
            }
        }

        setAuthData({
            adminId,
            token: authToken,
            isReady: true,
        });
    }, [user, token]);

    return authData;
}

/**
 * Get headers for API requests with Safari compatibility
 * Includes Authorization header as fallback for cookies
 */
export function getAuthHeaders(token: string | null): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Make an authenticated API request
 * Works on both Chrome (cookies) and Safari (Authorization header)
 */
export async function authFetch(
    url: string,
    token: string | null,
    options: RequestInit = {}
): Promise<Response> {
    const headers: HeadersInit = {
        ...getAuthHeaders(token),
        ...(options.headers || {}),
    };

    // Don't set Content-Type for FormData (browser will set it with boundary)
    if (options.body instanceof FormData) {
        delete (headers as Record<string, string>)['Content-Type'];
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Still include for Chrome-based browsers
    });
}

/**
 * Hook version of authFetch that uses the current auth context
 */
export function useAuthFetch() {
    const { token } = useAuth();

    const fetchWithAuth = useCallback(
        async (url: string, options: RequestInit = {}): Promise<Response> => {
            return authFetch(url, token, options);
        },
        [token]
    );

    return fetchWithAuth;
}
