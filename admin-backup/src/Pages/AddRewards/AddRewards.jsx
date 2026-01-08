import React, { useState, useEffect } from "react";
import styles from "./AddRewards.module.css";
import { useNavigate, useParams } from "react-router-dom";

const AddReward = () => {
  const { quizId } = useParams();

  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [rewards, setRewards] = useState([]);
  const [selectedRewards, setSelectedRewards] = useState({
    reward1: "",
    reward2: "",
    reward3: "",
  });

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await fetch(`${apiUrl}/reward/get-all-rewards`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        // console.log("get-all-rewards response->", response.body);
        if (response.ok) {
          const data = await response.json();
          console.log("Data->", data.data);
          setRewards(data.data);
        } else {
          console.error("Failed to fetch rewards. Status:", response.status);
          const errorText = await response.text();
          console.error("Error response text:", errorText);
        }
      } catch (error) {
        console.error("Failed to fetch rewards:", error);
      }
    };

    fetchRewards();
  }, [quizId]);

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setSelectedRewards((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getAvailableRewards = (currentField) => {
    return rewards.filter(
      (reward) =>
        !Object.values(selectedRewards).includes(reward.rewardName) ||
        selectedRewards[currentField] === reward.rewardName
    );
  };

  // const handleSaveRewards = async () => {
  //   try {
  //     const response = await fetch(
  //       `${apiUrl}/quiz/add-reward-to-quiz/${quizId}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         credentials: "include",
  //         body: JSON.stringify(selectedRewards),
  //       }
  //     );
  //     if (response.ok) {
  //       console.log("Rewards saved successfully");
  //       navigate(-1);
  //     } else {
  //       console.error("Failed to save rewards. Status:", response.status);
  //       const errorText = await response.text();
  //       console.error("Error response text:", errorText);
  //     }
  //   } catch (error) {
  //     console.error("Failed to save rewards:", error);
  //   }
  // };

  const handleSaveRewards = async () => {
    try {
        let rewardIds = Object.values(selectedRewards).map((rewardName) =>
            rewards.find((reward) => reward.rewardName === rewardName)?._id
        );

        rewardIds = rewardIds.filter((rewardId) => rewardId !== undefined);

        console.log("Reward Ids:", rewardIds);
        const response = await fetch(
          `${apiUrl}/quiz/add-reward-to-quiz/${quizId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({rewards: rewardIds}), 
          }
        );
        if (!response.ok) {
          console.error("Failed to save reward. Status:", response.status);
          const errorText = await response.text();
          console.error("Error response text:", errorText);
          alert("Failed to save reward. Please try again.");
          return;
        }
      
      console.log("Rewards saved successfully");
      alert("Rewards saved successfully");
      navigate(-1);
    } catch (error) {
      console.error("Failed to save rewards:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Add Reward</h2>
      <form>
        <div>
          <label htmlFor="reward1">Reward 1:</label>
          <select
            name="reward1"
            value={selectedRewards.reward1}
            onChange={handleSelectChange}
            className={styles.select}
          >
            <option value="">Select Reward</option>
            {getAvailableRewards("reward1").map((reward) => (
              <option key={reward._id} value={reward.rewardName}>
                {reward.rewardName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="reward2">Reward 2:</label>
          <select
            name="reward2"
            value={selectedRewards.reward2}
            onChange={handleSelectChange}
            className={styles.select}
          >
            <option value="">Select Reward</option>
            {getAvailableRewards("reward2").map((reward) => (
              <option key={reward._id} value={reward.rewardName}>
                {reward.rewardName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="reward3">Reward 3:</label>
          <select
            name="reward3"
            value={selectedRewards.reward3}
            onChange={handleSelectChange}
            className={styles.select}
          >
            <option value="">Select Reward</option>
            {getAvailableRewards("reward3").map((reward) => (
              <option key={reward._id} value={reward.rewardName}>
                {reward.rewardName}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleSaveRewards}
          className={styles.saveButton}
        >
          Save Rewards
        </button>
      </form>
    </div>
  );
};

export default AddReward;
