"use client";

import { useEffect } from "react";

interface SchedulingOptionsProps {
  isScheduled: boolean;
  setIsScheduled: (value: boolean) => void;
  time: string;
  setTime: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  repeat: string;
  setRepeat: (value: string) => void;
  repeatOption: string;
  setRepeatOption: (value: string) => void;
  customFrequency: number;
  setCustomFrequency: (value: number) => void;
  customUnit: string;
  setCustomUnit: (value: string) => void;
  customDaysOfWeek: string[];
  setCustomDaysOfWeek: (value: string[]) => void;
  customDayOfMonth: number;
  setCustomDayOfMonth: (value: number) => void;
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SchedulingOptions({
  isScheduled,
  setIsScheduled,
  time,
  setTime,
  date,
  setDate,
  repeat,
  setRepeat,
  customDaysOfWeek,
  setCustomDaysOfWeek,
}: SchedulingOptionsProps) {
  // Set default values
  useEffect(() => {
    const now = new Date();
    const defaultDate = now.toISOString().split("T")[0];
    const defaultTime = new Date(now.getTime() + 60000)
      .toTimeString()
      .slice(0, 5);

    if (!date) setDate(defaultDate);
    if (!time) setTime(defaultTime);
  }, [date, time, setDate, setTime]);

  useEffect(() => {
    if (repeat === "daily") {
      setCustomDaysOfWeek(["0", "1", "2", "3", "4", "5", "6"]);
    } else if (repeat === "weekly") {
      const todayIndex = new Date().getDay();
      setCustomDaysOfWeek([todayIndex.toString()]);
    } else {
      setCustomDaysOfWeek([]);
    }
  }, [repeat, setCustomDaysOfWeek]);

  const handleRepeatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRepeat = e.target.value;
    setRepeat(selectedRepeat);

    if (selectedRepeat === "daily") {
      setCustomDaysOfWeek(["0", "1", "2", "3", "4", "5", "6"]);
    } else if (selectedRepeat === "weekly") {
      const todayIndex = new Date().getDay();
      setCustomDaysOfWeek([todayIndex.toString()]);
    } else {
      setCustomDaysOfWeek([]);
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    const dayStr = dayIndex.toString();
    const updatedDays = [...customDaysOfWeek];

    if (updatedDays.includes(dayStr)) {
      setCustomDaysOfWeek(updatedDays.filter((day) => day !== dayStr));
    } else {
      setCustomDaysOfWeek([...updatedDays, dayStr]);
    }
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="schedule-checkbox"
          checked={isScheduled}
          onChange={() => setIsScheduled(!isScheduled)}
          className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
        />
        <label
          htmlFor="schedule-checkbox"
          className="text-gray-700 font-medium cursor-pointer"
        >
          Schedule this email
        </label>
      </div>

      {isScheduled && (
        <div className="space-y-4 pl-6 border-l-2 border-teal-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Time:</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Repeat:
              </label>
              <select
                value={repeat}
                onChange={handleRepeatChange}
                className="block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:border-teal-500 focus:ring focus:ring-teal-500 focus:ring-opacity-50"
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {repeat === "weekly" && (
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Day of the Week:
              </label>
              <div className="flex flex-wrap gap-3">
                {daysOfWeek.map((day, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={customDaysOfWeek.includes(index.toString())}
                      onChange={() => handleDayToggle(index)}
                      className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                    />
                    <span className="text-gray-700 text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
