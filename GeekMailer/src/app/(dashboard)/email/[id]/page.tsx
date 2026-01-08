"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiEdit2, FiTrash2, FiPause } from "react-icons/fi";
import { toast } from "sonner";
import translateCronToReadable from "@/lib/utils/translateCronToReadable";

interface EmailDetails {
  _id: string;
  subject: string;
  to: string[];
  text: string;
  schedule: string;
  status: string;
  active: string;
  createdAt: string;
  sentAt?: string;
}

export default function EmailDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [emailDetails, setEmailDetails] = useState<EmailDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScheduled, setIsScheduled] = useState(false);

  useEffect(() => {
    const fetchEmailDetails = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const response = await fetch(`${apiUrl}/emails/email/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setEmailDetails(data.details);
          if (data.details.schedule && data.details.schedule !== "immediate") {
            setIsScheduled(true);
          }
        } else {
          console.error("Failed to fetch email details. Status:", response.status);
          toast.error("Failed to load email details");
        }
      } catch (error) {
        console.error("Failed to fetch email details:", error);
        toast.error("Error loading email details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmailDetails();
    }
  }, [id]);

  const handleMarkInactive = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const response = await fetch(`${apiUrl}/emails/email/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Email marked as inactive");
        setEmailDetails((prev) =>
          prev ? { ...prev, active: "false" } : null
        );
      } else {
        toast.error("Failed to mark email as inactive");
      }
    } catch (error) {
      console.error("Error marking email as inactive:", error);
      toast.error("Error updating email");
    }
  };

  const handleRescheduleClick = () => {
    if (emailDetails) {
      const params = new URLSearchParams({
        subject: emailDetails.subject,
        recipients: JSON.stringify(
          emailDetails.to.map((email) => ({ value: email, label: email }))
        ),
      });
      router.push(`/send-email?${params.toString()}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this email?")) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const response = await fetch(`${apiUrl}/emails/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Email deleted successfully");
        router.push("/view-emails");
      } else {
        toast.error("Failed to delete email");
      }
    } catch (error) {
      console.error("Error deleting email:", error);
      toast.error("Error deleting email");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-gray-500">Loading email details...</div>
      </div>
    );
  }

  if (!emailDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <p className="text-gray-500 mb-4">Email not found</p>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-hidden w-full max-w-275 min-h-150 px-6 py-4">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-5 cursor-pointer"
      >
        <FiArrowLeft size={18} />
        <span className="font-medium">Back</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Email Details</h1>
      </div>

      {/* Email Card */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {emailDetails.subject}
            </h2>
            <p className="text-gray-500 text-sm">
              To: {emailDetails.to.join(", ")}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                emailDetails.active === "true"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {emailDetails.active === "true" ? "Active" : "Inactive"}
            </span>
            <p className="text-sm text-gray-500 mt-2">
              <strong>Status:</strong> {emailDetails.status}
            </p>
            {isScheduled && (
              <p className="text-sm text-gray-500 mt-1">
                <strong>Schedule:</strong>{" "}
                {emailDetails.schedule === "immediate"
                  ? "Not scheduled"
                  : translateCronToReadable(emailDetails.schedule)}
              </p>
            )}
          </div>
        </div>

        {/* Email Body */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Email Content
          </h3>
          <div
            className="prose max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg"
            dangerouslySetInnerHTML={{ __html: emailDetails.text }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 p-6 border-t bg-gray-50">
          {emailDetails.active === "true" && (
            <button
              onClick={handleMarkInactive}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <FiPause size={16} />
              Mark as Inactive
            </button>
          )}

          <button
            onClick={handleRescheduleClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FiEdit2 size={16} />
            Reschedule / Edit
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FiTrash2 size={16} />
            Delete
          </button>
        </div>

        {/* Metadata */}
        <div className="px-6 py-4 border-t text-sm text-gray-500">
          <p>
            Created:{" "}
            {new Date(emailDetails.createdAt).toLocaleString()}
          </p>
          {emailDetails.sentAt && (
            <p>
              Sent: {new Date(emailDetails.sentAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
