"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";

interface Field {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea";
  required?: boolean;
}

interface CreateModalProps {
  title: string;
  onClose: () => void;
  onCreate: (formData: Record<string, string>) => void;
  fields: Field[];
}

export default function CreateModal({
  title,
  onClose,
  onCreate,
  fields,
}: CreateModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-25"
                  required={field.required}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required={field.required}
                />
              )}
            </div>
          ))}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
