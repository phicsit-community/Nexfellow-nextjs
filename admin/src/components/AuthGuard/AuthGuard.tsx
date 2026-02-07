'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
    const hasChecked = useRef(false);

    // Get user from Redux (for persistence)
    const reduxUser = useSelector((state: RootState) => state.user.user);

    useEffect(() => {
        // Only check once per mount
        if (hasChecked.current) return;
        hasChecked.current = true;

        const checkAuth = () => {
            try {
                const token = localStorage.getItem('token');
                const expiresIn = localStorage.getItem('expiresIn');

                // No token at all
                if (!token || !expiresIn) {
                    console.log('[AuthGuard] No token found, redirecting to login');
                    setAuthState('unauthenticated');
                    return;
                }

                // Check expiration
                const expirationDate = new Date(JSON.parse(expiresIn));
                if (expirationDate > new Date()) {
                    console.log('[AuthGuard] Token valid, user authenticated');
                    setAuthState('authenticated');
                } else {
                    console.log('[AuthGuard] Token expired, clearing and redirecting');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('expiresIn');
                    setAuthState('unauthenticated');
                }
            } catch (error) {
                console.error('[AuthGuard] Error checking auth:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('expiresIn');
                setAuthState('unauthenticated');
            }
        };

        // Small delay to let redux-persist rehydrate
        setTimeout(checkAuth, 100);
    }, []);

    // Handle redirect when unauthenticated
    useEffect(() => {
        if (authState === 'unauthenticated') {
            router.replace('/login');
        }
    }, [authState, router]);

    // Show loading while checking
    if (authState === 'checking') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#24b2b4]"></div>
            </div>
        );
    }

    // Show nothing while redirecting to login
    if (authState === 'unauthenticated') {
        return null;
    }

    return <>{children}</>;
}
