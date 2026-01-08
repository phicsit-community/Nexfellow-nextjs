"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import CreatableSelect from "react-select/creatable";
import { MultiValue, ActionMeta } from "react-select";

interface Option {
  value: string;
  label: string;
  type?: string;
  isSelectAll?: boolean;
}

interface RecipientsSelectorProps {
  recipients: Option[];
  setRecipients: (recipients: Option[]) => void;
}

export default function RecipientsSelector({
  recipients,
  setRecipients,
}: RecipientsSelectorProps) {
  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        // Fetch users
        const usersResponse = await fetch(`${apiUrl}/users/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const usersData = await usersResponse.json();
        const userOpts: Option[] = usersData.map(
          (u: { email: string; name: string }) => ({
            value: u.email,
            label: `${u.name} (${u.email})`,
          })
        );

        // Fetch lists
        const listsResponse = await fetch(
          `${apiUrl}/contact-lists/all?adminId=${user}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const listsData = await listsResponse.json();
        const listOpts: Option[] = listsData.map(
          (list: { _id: string; listName: string }) => ({
            value: `list-${list._id}`,
            label: `List: ${list.listName}`,
            type: "list",
          })
        );

        // Combine all options and add "Select All" option
        const combinedOptions: Option[] = [
          {
            value: "select-all",
            label: "Select All",
            isSelectAll: true,
          },
          ...userOpts,
          ...listOpts,
        ];

        setUserOptions(combinedOptions);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleRecipientsChange = (
    newValue: MultiValue<Option>,
    _actionMeta: ActionMeta<Option>
  ) => {
    const selected = newValue as Option[];

    // Check if "Select All" was selected
    const selectAllOption = selected.find((opt) => opt.isSelectAll);

    if (selectAllOption) {
      // Select all non-select-all options
      const allOptions = userOptions.filter((opt) => !opt.isSelectAll);
      setRecipients(allOptions);
    } else {
      setRecipients(selected);
    }
  };

  return (
    <CreatableSelect
      isMulti
      options={userOptions}
      value={recipients}
      onChange={handleRecipientsChange}
      isLoading={loading}
      placeholder="Select or type emails"
      className="react-select-container"
      classNamePrefix="react-select"
      formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
      styles={{
        control: (base, state) => ({
          ...base,
          borderColor: state.isFocused ? "#14b8a6" : "#e5e7eb",
          borderRadius: "8px",
          padding: "4px",
          boxShadow: state.isFocused ? "0 0 0 2px rgba(20, 184, 166, 0.2)" : "none",
          "&:hover": {
            borderColor: "#14b8a6",
          },
        }),
        placeholder: (base) => ({
          ...base,
          color: "#9ca3af",
          fontSize: "14px",
        }),
        input: (base) => ({
          ...base,
          fontSize: "14px",
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: "#f0fdfa",
          borderRadius: "6px",
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: "#0d9488",
          fontSize: "13px",
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: "#0d9488",
          "&:hover": {
            backgroundColor: "#14b8a6",
            color: "white",
          },
        }),
        dropdownIndicator: (base) => ({
          ...base,
          color: "#9ca3af",
          "&:hover": {
            color: "#6b7280",
          },
        }),
        indicatorSeparator: () => ({
          display: "none",
        }),
        menu: (base) => ({
          ...base,
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "#14b8a6"
            : state.isFocused
              ? "#f0fdfa"
              : "white",
          color: state.isSelected ? "white" : "#374151",
          fontSize: "14px",
          "&:active": {
            backgroundColor: "#0d9488",
          },
        }),
      }}
    />
  );
}
