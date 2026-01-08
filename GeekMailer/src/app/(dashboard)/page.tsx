"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/lib/store/store";
import Card from "@/components/Card";
import CardContainer from "@/components/CardContainer";
import { FiArrowLeft, FiPlus } from "react-icons/fi";

interface Contact {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
}

interface Email {
  _id: string;
  subject: string;
  createdAt?: string;
  status?: string;
}

export default function HomePage() {
  const user = useSelector((state: RootState) => state.user.user);
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        // Fetch contacts
        const contactsResponse = await fetch(`${apiUrl}/users/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          setContacts(contactsData || []);
        }

        // Fetch emails
        if (user) {
          const emailsResponse = await fetch(`${apiUrl}/emails/admin/${user}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (emailsResponse.ok) {
            const emailsData = await emailsResponse.json();
            // The API might return an object or array, let's handle both
            // Check if data has 'emails' property or is the array itself
            const emailsList = Array.isArray(emailsData) ? emailsData : (emailsData.emails || []);
            setEmails(emailsList);
          }
        }
      } catch (error) {
        console.warn("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate stats
  const getNewItemsLast30Days = (items: { createdAt?: string }[]) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return items.filter((item) => {
      if (!item.createdAt) return false;
      const createdDate = new Date(item.createdAt);
      return createdDate >= thirtyDaysAgo;
    }).length;
  };

  const totalContacts = contacts.length;
  const newContactsLast30Days = getNewItemsLast30Days(contacts);

  const totalEmails = emails.length;
  const newEmailsLast30Days = getNewItemsLast30Days(emails);

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

      {/* Header with Title and Add Contact Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Home</h1>
        <button
          onClick={() => router.push("/contact")}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <FiPlus size={16} />
          <span>Add contact</span>
        </button>
      </div>

      {/* Cards Section */}
      <div className="flex flex-wrap gap-6">
        <CardContainer title="Contacts">
          <Card
            text="Total contacts"
            count={loading ? "..." : totalContacts}
            icon="userPlus"
          />
          <Card
            text="New contacts over the last 30 days"
            count={loading ? "..." : newContactsLast30Days}
            icon="userPlus"
          />
        </CardContainer>

        <CardContainer title="Mails">
          <Card
            text="Total mails"
            count={loading ? "..." : totalEmails}
            icon="mail"
          />
          <Card
            text="New mails over the last 30 days"
            count={loading ? "..." : newEmailsLast30Days}
            icon="mail"
          />
        </CardContainer>
      </div>
    </div>
  );
}
