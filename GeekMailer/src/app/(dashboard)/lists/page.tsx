"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import ListTable from "@/components/tables/ListTable";
import CreateModal from "@/components/modals/CreateModal";

export default function ListsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleCreateList = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreate = (formData: Record<string, string>) => {
    console.log("New list created:", formData);
    setIsModalOpen(false);
  };

  return (
    <div className="relative overflow-x-hidden w-full max-w-4xl min-h-screen px-8 py-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm cursor-pointer"
      >
        <FiArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Lists</h1>
        <button
          onClick={handleCreateList}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium cursor-pointer"
        >
          <FiPlus size={16} />
          <span>Create List</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <ListTable />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <CreateModal
          title="Create New List"
          onClose={handleCloseModal}
          onCreate={handleCreate}
          fields={[
            { name: "name", label: "List Name", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
          ]}
        />
      )}
    </div>
  );
}
