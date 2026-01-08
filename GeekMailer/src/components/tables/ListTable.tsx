"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { FiMoreVertical } from "react-icons/fi";

interface List {
  _id: string;
  name: string;
  description?: string;
  contactCount: number;
  createdAt: string;
}

export default function ListTable() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/lists/admin/${user}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setLists(data.lists || []);
        }
      } catch (error) {
        console.error("Failed to fetch lists:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLists();
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading lists...</div>
    );
  }

  if (lists.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No lists found. Create your first list!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
              Lists
            </th>
            <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
              Contacts
            </th>
            <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
              Creation Date
            </th>
            <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {lists.map((list, index) => (
            <tr
              key={list._id}
              className={`hover:bg-gray-50 transition-colors ${index !== lists.length - 1 ? "border-b border-gray-100" : ""
                }`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                {list.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                {list.description || "Username"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                {formatDate(list.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <FiMoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
