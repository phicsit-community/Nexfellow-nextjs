'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const expiresIn = localStorage.getItem('expiresIn');

            if (!token || !expiresIn) {
                router.push('/login');
                return;
            }

            try {
                const expirationDate = new Date(JSON.parse(expiresIn));
                if (expirationDate <= new Date()) {
                    localStorage.clear();
                    router.push('/login');
                    return;
                }
                setIsAuthenticated(true);
            } catch {
                localStorage.clear();
                router.push('/login');
            }
        };

        checkAuth();
    }, [router]);

    // Show nothing while checking authentication
    if (isAuthenticated === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return <>{children}</>;
}
