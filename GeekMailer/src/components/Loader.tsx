"use client";

export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning loader */}
        <div className="relative w-16 h-16">
          <div className="absolute w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute w-full h-full border-4 border-transparent border-t-teal-500 rounded-full animate-spin"></div>
        </div>

        {/* Loading text */}
        <div className="flex items-center gap-1">
          <span className="text-xl font-semibold text-teal-500">
            GeekMailer
          </span>
        </div>

        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}
