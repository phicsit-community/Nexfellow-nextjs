import Link from 'next/link';

export default function NotFound() {
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
                padding: '60px 40px',
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                maxWidth: '500px',
            }}>
                <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🔍</div>
                <h1 style={{ fontSize: '6rem', margin: '0', color: '#24b2b4', fontWeight: '700' }}>
                    404
                </h1>
                <h2 style={{ margin: '12px 0 16px', color: '#333', fontWeight: '600' }}>
                    Page Not Found
                </h2>
                <p style={{ color: '#666', marginBottom: '32px', lineHeight: '1.6' }}>
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link
                    href="/users"
                    style={{
                        display: 'inline-block',
                        padding: '14px 32px',
                        background: 'linear-gradient(135deg, #24b2b4, #1a8a8b)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        transition: 'transform 0.2s',
                    }}
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
}
