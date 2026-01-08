"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/lib/store/store";

interface Email {
  _id: string;
  subject: string;
  to: string[];
  status: string;
  createdAt: string;
  sentAt?: string;
}

export default function EmailTable() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/emails/admin/${user}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setEmails(data.emails || []);
        }
      } catch (error) {
        console.error("Failed to fetch emails:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEmails();
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    const styles = {
      sent: "bg-green-100 text-green-800",
      scheduled: "bg-yellow-100 text-yellow-800",
      repeat: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
      pending: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {status}
      </span>
    );
  };

  const handleViewEmail = (id: string) => {
    router.push(`/email/${id}`);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading emails...</div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No emails found. Send your first email!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Subject
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recipients
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {emails.map((email) => (
            <tr
              key={email._id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => handleViewEmail(email._id)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {email.subject}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {email.to.length > 1
                  ? `${email.to[0]} +${email.to.length - 1} more`
                  : email.to[0]}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(email.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(email.sentAt || email.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewEmail(email._id);
                  }}
                  className="text-blue-600 hover:text-blue-800 mr-3"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
