import React, { useEffect, useState } from "react";

// styles
import styles from "./CreateReward.module.css";

// components
import Navbar from "../../Components/Navbar/Navbar";
import SideBar from "../../Components/SideBar/SideBar";

// images
import cloud from "./assets/cloud.svg";

const CreateReward = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [rewardName, setRewardName] = useState("");
  const [rewardImage, setRewardImage] = useState(null);
  const [message, setMessage] = useState("");
  const [allReward, setAllRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const getRewards = async () => {
      try {
        const response = await fetch(`${apiUrl}/reward/get-all-rewards`, {
          method: "GET",
        });
        const data = await response.json();
        setAllRewards(data.data);
      } catch (err) {
        console.error(err);
      }
    };
    getRewards();
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("rewardName", rewardName);
    formData.append("rewardImage", rewardImage);

    try {
      const response = await fetch(`${apiUrl}/reward/create-reward`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setRewardName("");
        setRewardImage(null);
        setImagePreview("");
      } else {
        setMessage("Failed to create reward");
      }
    } catch (error) {
      console.error("Failed to create reward:", error);
      setMessage("Failed to create reward");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/reward/delete-reward/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setMessage("Reward deleted successfully");
        setAllRewards(allReward.filter((reward) => reward._id !== id));
      } else {
        setMessage("Failed to delete reward");
      }
    } catch (error) {
      console.error("Failed to delete reward:", error);
      setMessage("Failed to delete reward");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setRewardImage(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview("");
    }
  };

  return (
    <div>
      <Navbar />
      <SideBar />
      <div className={styles.container}>
        <div className={styles.RewardHead}>
          <p>Create Rewards</p>
        </div>
        <div className={styles.formDiv}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="rewardName">Reward Name:</label>
              <input
                className={styles.input1}
                type="text"
                id="rewardName"
                placeholder="Text"
                value={rewardName}
                onChange={(e) => setRewardName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="rewardImage">Reward Image:</label>
              <label htmlFor="rewardImage" className={styles.customFileUpload}>
                <span>Upload Image</span>
                <img className={styles.cloud} src={cloud} alt="upload icon" />
              </label>
              <input
                className={styles.input2}
                type="file"
                id="rewardImage"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Image Preview"
                  className={styles.imagePreview}
                />
              )}
            </div>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Reward"}
            </button>
            {message && <p className={styles.message}>{message}</p>}
          </form>
        </div>
        <div className={styles.RewardHead}>
          <p>All Rewards</p>
        </div>

        <div className={styles.imagesDiv}>
          {allReward.map((reward) => (
            <div key={reward._id} className={styles.rewardCard}>
              <img
                className={styles.rewardImage}
                src={reward.rewardImage}
                alt={reward.rewardName}
              />
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(reward._id)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateReward;
