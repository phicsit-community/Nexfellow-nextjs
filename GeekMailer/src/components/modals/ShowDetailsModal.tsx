"use client";

import { FiX } from "react-icons/fi";

interface ShowDetailsModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
}

export default function ShowDetailsModal({
  children,
  onClose,
  title,
}: ShowDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          {title && (
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-auto"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
