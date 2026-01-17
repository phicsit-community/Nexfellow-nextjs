"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import ContactTable from "@/components/tables/ContactTable";
import CreateModal from "@/components/modals/CreateModal";

export default function ContactsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/users/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateContact = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreate = (formData: Record<string, string>) => {
    console.log("New contact created:", formData);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

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
        <h1 className="text-2xl font-semibold text-gray-900">Contact</h1>
        <button
          onClick={handleCreateContact}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium cursor-pointer"
        >
          <FiPlus size={16} />
          <span>Create contact</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <ContactTable users={users} />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <CreateModal
          title="Create New Contact"
          onClose={handleCloseModal}
          onCreate={handleCreate}
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "username", label: "Username", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
          ]}
        />
      )}
    </div>
  );
}
