import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import translateCronToReadable from "../utils/translateCronToReadable";

const EmailDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [emailDetails, setEmailDetails] = useState(null);
  const [isScheduled, setIsScheduled] = useState(false);

  useEffect(() => {
    const fetchEmailDetails = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
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
          if (data.details.schedule) {
            setIsScheduled(true);
          }
        } else {
          console.error(
            "Failed to fetch email details. Status:",
            response.status
          );
        }
      } catch (error) {
        console.error("Failed to fetch email details:", error);
      }
    };

    fetchEmailDetails();
  }, [id]);

  const handleMarkInactive = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/emails/email/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        alert("Email marked as inactive");
        setEmailDetails((prev) => ({ ...prev, active: "false" }));
      } else {
        alert("Failed to mark email as inactive");
      }
    } catch (error) {
      console.error("Error marking email as inactive:", error);
    }
  };

  const handleRescheduleClick = () => {
    if (emailDetails) {
      navigate("/sendEmail", {
        state: {
          recipients: emailDetails.to.join(", "),
          subject: emailDetails.subject,
          text: emailDetails.text,
        },
      });
    }
  };

  const handleDelete = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/emails/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        alert("Email deleted successfully");
        navigate("/viewEmails"); // Navigate back to email list or another page after deletion
      } else {
        alert("Failed to delete email");
      }
    } catch (error) {
      console.error("Error deleting email:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold text-gradient mb-6">Email Details</h2>
        {emailDetails ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            {/* Header section with subject, status, and schedule */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800">
                  {emailDetails.subject}
                </h3>
                <p className="text-gray-500 text-sm">
                  To: {emailDetails.to.join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {emailDetails.active === "true" ? "Active" : "Inactive"}
                </p>
                <p className="text-sm text-gray-500">
                  Schedule:{" "}
                  {emailDetails.schedule === "immediate"
                    ? "Not scheduled"
                    : translateCronToReadable(emailDetails.schedule)}
                </p>
              </div>
            </div>

            {/* Email body section (HTML content) */}
            <div className="email-body mb-6">
              <div
                className="text-lg text-gray-700"
                dangerouslySetInnerHTML={{ __html: emailDetails.text }}
              />
            </div>

            {/* Action buttons */}
            <div className="flex space-x-4">
              {emailDetails.active === "true" && (
                <button
                  onClick={handleMarkInactive}
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                  Mark as Inactive
                </button>
              )}

              {(emailDetails.active === "false" || !emailDetails.schedule) && (
                <button
                  onClick={handleRescheduleClick}
                  className="bg-button-gradient text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Reschedule Email
                </button>
              )}

              <button
                onClick={handleDelete}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Delete Email
              </button>
            </div>
          </div>
        ) : (
          <p className="text-lg text-gray-600">Loading email details...</p>
        )}
      </div>
    </div>
  );
};

export default EmailDetails;
