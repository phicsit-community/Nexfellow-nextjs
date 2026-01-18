'use client';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div style={{
            padding: '60px 20px',
            textAlign: 'center',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '40px',
                maxWidth: '500px',
                margin: '0 auto',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😓</div>
                <h2 style={{ margin: '0 0 12px', color: '#333' }}>
                    Oops! Something went wrong
                </h2>
                <p style={{ color: '#666', marginBottom: '24px' }}>
                    {error.message || 'An unexpected error occurred while loading this page.'}
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
