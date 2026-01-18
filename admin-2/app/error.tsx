'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Error:', error);
    }, [error]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f7f9fc',
            padding: '20px',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                maxWidth: '500px',
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⚠️</div>
                <h2 style={{ margin: '0 0 12px', color: '#333' }}>Something went wrong!</h2>
                <p style={{ color: '#666', marginBottom: '24px' }}>
                    An unexpected error occurred. Please try again.
                </p>
                <button
                    onClick={reset}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #24b2b4, #1a8a8b)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
