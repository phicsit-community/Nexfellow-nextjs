'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '@/slices/userSlice';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const exchanged = useRef(false);

    useEffect(() => {
        const code = searchParams.get('code');

        if (!code) {
            toast.error('No authorization code found');
            router.replace('/login');
            return;
        }

        // Prevent double-exchange in React strict mode
        if (exchanged.current) return;
        exchanged.current = true;

        const exchangeCode = async () => {
            try {
                const response = await fetch(`${apiUrl}/auth/exchange-code`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code }),
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();

                    // Store in Redux
                    dispatch(
                        setUser({
                            user: data.payload,
                            token: data.token,
                            expiresIn: data.expiresIn,
                        })
                    );

                    // Store in localStorage
                    localStorage.setItem('token', JSON.stringify(data.token));
                    localStorage.setItem('user', JSON.stringify(data.payload));
                    localStorage.setItem('expiresIn', JSON.stringify(data.expiresIn));

                    toast.success('Login successful!');
                    router.replace('/users');
                } else {
                    console.error('Exchange failed:', response.status);
                    toast.error('Authentication failed. Please try again.');
                    router.replace('/login');
                }
            } catch (error) {
                console.error('Error exchanging code:', error);
                toast.error('Authentication error occurred.');
                router.replace('/login');
            }
        };

        exchangeCode();
    }, [searchParams, router, dispatch, apiUrl]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#24b2b4] mx-auto mb-4"></div>
                <p className="text-slate-300">Authenticating...</p>
            </div>
        </div>
    );
}
