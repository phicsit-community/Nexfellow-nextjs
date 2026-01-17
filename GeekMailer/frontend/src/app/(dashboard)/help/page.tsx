"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiMail, FiMessageCircle, FiChevronDown, FiChevronUp } from "react-icons/fi";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I send a scheduled email?",
    answer:
      "Navigate to 'Send Email' from the sidebar, compose your email, then check 'Schedule this email' to set a specific date and time. You can also set up recurring emails by selecting a repeat option.",
  },
  {
    question: "How do I create a contact list?",
    answer:
      "Go to the 'Lists' page and click 'Create List'. Give your list a name and description, then you can add contacts to it. Lists help you organize recipients for bulk emails.",
  },
  {
    question: "Can I edit a scheduled email?",
    answer:
      "Yes! Go to 'View Emails', click on the scheduled email you want to modify, and use the 'Reschedule / Edit' button. This will take you to the email composer with the content pre-filled.",
  },
  {
    question: "How do I stop a recurring email?",
    answer:
      "Navigate to 'View Emails', find the recurring email, click on it to view details, and then click 'Mark as Inactive'. This will stop all future sends of that email.",
  },
  {
    question: "What email formats are supported?",
    answer:
      "GeekMailer supports HTML emails with rich formatting including bold, italic, underline, lists, links, and basic styling. You can compose your emails using the built-in editor.",
  },
  {
    question: "How do I import contacts?",
    answer:
      "Currently, contacts can be added individually through the Contacts page. Bulk import functionality via CSV is planned for a future update.",
  },
];

export default function HelpPage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative overflow-x-hidden w-full max-w-275 min-h-150 px-6 py-4">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm cursor-pointer"
      >
        <FiArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Help & Support</h1>
        <p className="text-gray-500 mt-1">
          Find answers to common questions or contact support
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="divide-y">
              {faqs.map((faq, index) => (
                <div key={index} className="p-4">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex justify-between items-center text-left"
                  >
                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                    {openIndex === index ? (
                      <FiChevronUp className="text-gray-500 shrink-0" />
                    ) : (
                      <FiChevronDown className="text-gray-500 shrink-0" />
                    )}
                  </button>
                  {openIndex === index && (
                    <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Contact Support
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-gray-600 text-sm">
                Can&apos;t find what you&apos;re looking for? Reach out to our support
                team.
              </p>

              <a
                href="mailto:support@geekmailer.com"
                className="flex items-center gap-3 p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <FiMail className="text-teal-600" size={24} />
                <div>
                  <p className="font-medium text-gray-900">Email Support</p>
                  <p className="text-sm text-gray-500">
                    support@geekmailer.com
                  </p>
                </div>
              </a>

              <a
                href="#"
                className="flex items-center gap-3 p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <FiMessageCircle className="text-teal-600" size={24} />
                <div>
                  <p className="font-medium text-gray-900">Live Chat</p>
                  <p className="text-sm text-gray-500">Available 9am - 5pm</p>
                </div>
              </a>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 shadow-sm rounded-lg overflow-hidden mt-4 p-4 text-white">
            <h3 className="font-semibold mb-2">💡 Quick Tip</h3>
            <p className="text-sm text-white/90">
              Use contact lists to organize your recipients. This makes it
              easier to send targeted emails to specific groups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
