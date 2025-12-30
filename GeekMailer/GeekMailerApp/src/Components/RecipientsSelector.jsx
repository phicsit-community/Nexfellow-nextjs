import { useEffect, useState } from "react";
import Creatable from "react-select/creatable";
import { useSelector } from "react-redux";

// eslint-disable-next-line react/prop-types
const RecipientsSelector = ({ recipients, setRecipients }) => {
  const [userOptions, setUserOptions] = useState([]);
  const user = useSelector((state) => state.user.user);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;

        // Fetch users
        const usersResponse = await fetch(`${apiUrl}/users/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const usersData = await usersResponse.json();
        const userOptions = usersData.map((user) => ({
          value: user.email,
          label: `${user.name} (${user.email})`,
        }));

        // Fetch challenges
        const challengesResponse = await fetch(`${apiUrl}/challenges`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const challengesData = await challengesResponse.json();
        const challengeOptions = challengesData.map((challenge) => ({
          value: `challenge-${challenge._id}`,
          label: `Challenge: ${challenge.challengeTitle}`,
          type: "challenge", // Add type for identification
        }));

        // Fetch quizzes
        const quizzesResponse = await fetch(`${apiUrl}/quiz`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const quizzesData = await quizzesResponse.json();
        const quizOptions = quizzesData.map((quiz) => ({
          value: `quiz-${quiz._id}`,
          label: `Quiz: ${quiz.title}`,
          type: "quiz", // Add type for identification
        }));

        //fetch lists
        const listsResponse = await fetch(`${apiUrl}/contact-lists/all?adminId=${user}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

        const listsData = await listsResponse.json();
        const listOptions = listsData.map((list)=>({
          value: `list-${list._id}`,
          label: `List: ${list.listName}`,
          type: "list",
        }));
        console.log(listOptions);
        // Combine all options and add "Select All" option
        const combinedOptions = [
          {
            value: "select-all",
            label: "Select All",
            isSelectAll: true,
          },
          ...userOptions,
          ...challengeOptions,
          ...quizOptions,
          ...listOptions
        ];

        setUserOptions(combinedOptions);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [user]);

  const handleRecipientsChange = async (selectedOptions) => {
    const isSelectAll = selectedOptions?.some(
      (option) => option.value === "select-all"
    );
    const recipientEmails = new Set(
      recipients.map((recipient) => recipient.value)
    ); // Track existing recipient emails

    let updatedRecipients = [];

    if (isSelectAll) {
      // If "Select All" is chosen, add all options except "Select All"
      updatedRecipients = [
        ...userOptions.filter((option) => option.value !== "select-all"),
      ];
    } else {
      updatedRecipients = [...selectedOptions]; // Start with currently selected options

      for (let option of selectedOptions) {
        if (option.type === "challenge") {
          // Fetch users in the selected challenge
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL}/challenges/${
                option.value.split("-")[1]
              }/users`
            );
            const data = await response.json();
            const challengeUsers = data.map((user) => ({
              value: user.email,
              label: `${user.name} (${user.email})`,
            }));
            // Add users from challenge without duplication
            challengeUsers.forEach((user) => {
              if (!recipientEmails.has(user.value)) {
                updatedRecipients.push(user);
                recipientEmails.add(user.value);
              }
            });
          } catch (error) {
            console.error(
              `Failed to fetch users for challenge: ${option.label}`,
              error
            );
          }
        } else if (option.type === "quiz") {
          // Fetch users in the selected quiz
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL}/quiz/${
                option.value.split("-")[1]
              }/users`
            );
            const data = await response.json();
            const quizUsers = data.map((user) => ({
              value: user.email,
              label: `${user.name} (${user.email})`,
            }));
            // Add users from quiz without duplication
            quizUsers.forEach((user) => {
              if (!recipientEmails.has(user.value)) {
                updatedRecipients.push(user);
                recipientEmails.add(user.value);
              }
            });
          } catch (error) {
            console.error(
              `Failed to fetch users for quiz: ${option.label}`,
              error
            );
          }
        } else if (option.type === "list") {
        // Fetch users in the selected list
        try {
          const listEmails = `${import.meta.env.VITE_API_URL}/contact-lists/view?listId=${
              option.value.split("-")[1]
            }&adminId=${user}`;
          console.log(listEmails);
          const response = await fetch(
            listEmails ,{
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
          });
          const data = await response.json();
          console.log(data);
          const listsUsers = data.contacts.map((user) => ({
            value: user.email,
            label: `${user.name} (${user.email})`,
          }));
          // Add users from list without duplication
          listsUsers.forEach((user) => {
            if (!recipientEmails.has(user.value)) {
              updatedRecipients.push(user);
              recipientEmails.add(user.value);
            }
          });
        } catch (error) {
          console.error(
            `Failed to fetch users for quiz: ${option.label}`,
            error
          );
        }
      }
      }
    }

    setRecipients(updatedRecipients || []);
  };

  const handleCreateOption = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    if (!recipients.some((recipient) => recipient.value === inputValue)) {
      setRecipients([...recipients, newOption]);
    }
  };

  return (
    <div className="mb-4 mt-10">
      <label className="text-lg font-medium text-gradient mb-1 block">
        Recipients:
      </label>
      <Creatable
        isMulti
        options={userOptions}
        value={recipients}
        onChange={handleRecipientsChange}
        onCreateOption={handleCreateOption}
        formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
        placeholder="Select or type emails"
        isClearable
        isSearchable
        noOptionsMessage={() => "No users, quizzes, or challenges found"}
        className="basic-single text-xs inline mt-10"
        classNamePrefix="select"
      />
    </div>
  );
};

export default RecipientsSelector;
