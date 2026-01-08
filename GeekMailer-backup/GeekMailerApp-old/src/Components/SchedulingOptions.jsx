/* eslint-disable react/prop-types */
import { useEffect } from "react";

const SchedulingOptions = ({
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
}) => {
  // Set default values
  useEffect(() => {
    const now = new Date();
    const defaultDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const defaultTime = new Date(now.getTime() + 60000)
      .toTimeString()
      .slice(0, 5); // HH:MM (1 minute from now)

    if (!date) setDate(defaultDate);
    if (!time) setTime(defaultTime);
  }, [date, time, setDate, setTime]);

  useEffect(() => {
    if (repeat === "daily") {
      setCustomDaysOfWeek([0, 1, 2, 3, 4, 5, 6]); // All days of the week
    } else if (repeat === "weekly") {
      const todayIndex = new Date().getDay();
      setCustomDaysOfWeek([todayIndex]); // Only the current day
    } else {
      setCustomDaysOfWeek([]); // Clear selection for other repeat options
    }
  }, [repeat, setCustomDaysOfWeek]);

  const handleRepeatChange = (e) => {
    const selectedRepeat = e.target.value;
    setRepeat(selectedRepeat);

    if (selectedRepeat === "daily") {
      setCustomDaysOfWeek([0, 1, 2, 3, 4, 5, 6]); // Mark all days of the week
    } else if (selectedRepeat === "weekly") {
      const todayIndex = new Date().getDay();
      setCustomDaysOfWeek([todayIndex]); // Only the current day
    } else {
      setCustomDaysOfWeek([]); // Clear selection for monthly or yearly
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isScheduled}
          onChange={() => setIsScheduled(!isScheduled)}
          className="form-checkbox h-4 w-4"
          style={{ color: "#24B2B4" }}
        />
        <label className="text-gray-700 font-medium">Schedule this email</label>
      </div>

      {isScheduled && (
        <div className="space-y-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex flex-col space-y-2 w-full md:w-1/3">
              <label className="text-gray-700 font-medium">Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input mt-1 block w-full border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>

            <div className="flex flex-col space-y-2 w-full md:w-1/3">
              <label className="text-gray-700 font-medium">Time:</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="form-input mt-1 block w-full border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>

            <div className="flex flex-col space-y-2 w-full md:w-1/3">
              <label className="text-gray-700 font-medium">Repeat:</label>
              <select
                value={repeat}
                onChange={handleRepeatChange}
                className="form-select mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
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
              <label className="text-gray-700 font-medium">
                Day of the Week:
              </label>
              <div className="flex flex-wrap gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={index}
                        checked={customDaysOfWeek.includes(index)}
                        onChange={() => {
                          const updatedDays = [...customDaysOfWeek];
                          if (updatedDays.includes(index)) {
                            setCustomDaysOfWeek(
                              updatedDays.filter((day) => day !== index)
                            );
                          } else {
                            setCustomDaysOfWeek([...updatedDays, index]);
                          }
                        }}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                      <span className="text-gray-700">{day}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchedulingOptions;
