"use client";

import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";

export default function Error({ error, reset }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-gray-600 mb-4">{error?.message || "An unexpected error occurred"}</p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
            >
                Try again
            </button>
        </div>
    );
}
