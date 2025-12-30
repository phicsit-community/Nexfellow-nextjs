"use client";

export default function PublicLayout({ children }) {
    return (
        <div className="min-h-screen">
            <main>
                {children}
            </main>
        </div>
    );
}
