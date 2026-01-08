"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { RootState } from "@/lib/store/store";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import { toast } from "sonner";
import RecipientsSelector from "@/components/RecipientsSelector";
import SchedulingOptions from "@/components/SchedulingOptions";
import { generateCronExpression } from "@/lib/utils/cronUtils";
import dynamic from "next/dynamic";

// Dynamically import the editor to avoid SSR issues
const RichTextEditor = dynamic<{ value: string; onChange: (value: string) => void }>(
  () => import("@/components/RichTextEditor"),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-50 rounded-lg animate-pulse border border-gray-200" />,
  }
);

interface Recipient {
  value: string;
  label: string;
}

export default function SendEmailPage() {
  const { user } = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [repeat, setRepeat] = useState("no");
  const [repeatOption, setRepeatOption] = useState("none");
  const [isScheduled, setIsScheduled] = useState(false);
  const [customFrequency, setCustomFrequency] = useState(1);
  const [customUnit, setCustomUnit] = useState("days");
  const [customDaysOfWeek, setCustomDaysOfWeek] = useState<string[]>([]);
  const [customDayOfMonth, setCustomDayOfMonth] = useState(1);
  const [emailContent, setEmailContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const now = new Date();
    const defaultDate = now.toISOString().split("T")[0];
    const defaultTime = new Date(now.getTime() + 2 * 60000)
      .toTimeString()
      .slice(0, 5);

    setDate(defaultDate);
    setTime(defaultTime);

    // Check for pre-filled data from URL params
    const prefilledRecipients = searchParams.get("recipients");
    const prefilledSubject = searchParams.get("subject");

    if (prefilledRecipients) {
      try {
        setRecipients(JSON.parse(prefilledRecipients));
      } catch {
        // Ignore parse errors
      }
    }
    if (prefilledSubject) {
      setSubject(prefilledSubject);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedDate = date || new Date().toISOString().split("T")[0];
      const selectedTime =
        time || new Date(Date.now() + 2 * 60000).toTimeString().slice(0, 5);

      const cronExpression = generateCronExpression({
        customUnit,
        customFrequency,
        customDaysOfWeek,
        customDayOfMonth,
        repeatOption,
        date: selectedDate,
        time: selectedTime,
      });

      let status = "";
      if (isScheduled) {
        status = repeatOption === "repeat" ? "repeat" : "scheduled";
      }

      const emailData = {
        adminId: user,
        to: recipients.map((recipient) => recipient.value),
        subject,
        text: emailContent,
        schedule: isScheduled ? cronExpression : null,
        status,
      };

      const endpoint = isScheduled
        ? "/emails/schedule"
        : "/emails/send-immediate";

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        toast.success("Email submitted successfully");
        router.push("/view-emails");
      } else {
        toast.error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Error sending email");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-x-hidden w-full max-w-4xl min-h-screen px-8 py-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm cursor-pointer"
      >
        <FiArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipients */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            Recipients:
          </label>
          <RecipientsSelector
            recipients={recipients}
            setRecipients={setRecipients}
          />
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            Subject:
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm placeholder-gray-400"
            placeholder="Enter email subject"
            required
          />
        </div>

        {/* Email Content */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            Email Content:
          </label>
          <RichTextEditor
            value={emailContent}
            onChange={setEmailContent}
          />
        </div>

        {/* Schedule Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="schedule"
            checked={isScheduled}
            onChange={(e) => setIsScheduled(e.target.checked)}
            className="w-5 h-5 text-teal-500 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
          />
          <label htmlFor="schedule" className="text-sm text-gray-700 cursor-pointer">
            Schedule this email
          </label>
        </div>

        {/* Scheduling Options - Only show if scheduled */}
        {isScheduled && (
          <SchedulingOptions
            isScheduled={isScheduled}
            setIsScheduled={setIsScheduled}
            repeat={repeat}
            setRepeat={setRepeat}
            repeatOption={repeatOption}
            setRepeatOption={setRepeatOption}
            customFrequency={customFrequency}
            setCustomFrequency={setCustomFrequency}
            customUnit={customUnit}
            setCustomUnit={setCustomUnit}
            customDaysOfWeek={customDaysOfWeek}
            setCustomDaysOfWeek={setCustomDaysOfWeek}
            customDayOfMonth={customDayOfMonth}
            setCustomDayOfMonth={setCustomDayOfMonth}
            date={date}
            setDate={setDate}
            time={time}
            setTime={setTime}
          />
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isSubmitting ? (
              "Sending..."
            ) : (
              <>
                Send Email
                <FiSend size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
