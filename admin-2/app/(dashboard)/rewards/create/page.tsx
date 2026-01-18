'use client';

import React, { useEffect, useState } from 'react';
import styles from './CreateReward.module.css';
import Image from 'next/image';

interface Reward {
  _id: string;
  rewardName: string;
  rewardImage: string;
}

export default function CreateRewardPage() {
  const apiUrl = process.env.NEXT_PUBLIC_LOCALHOST;
  const [rewardName, setRewardName] = useState('');
  const [rewardImage, setRewardImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [allReward, setAllRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const getRewards = async () => {
      try {
        const response = await fetch(`${apiUrl}/reward/get-all-rewards`, {
          method: 'GET',
        });
        const data = await response.json();
        setAllRewards(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    getRewards();
  }, [message, apiUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('rewardName', rewardName);
    if (rewardImage) {
      formData.append('rewardImage', rewardImage);
    }

    try {
      const response = await fetch(`${apiUrl}/reward/create-reward`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setRewardName('');
        setRewardImage(null);
        setImagePreview('');
      } else {
        setMessage('Failed to create reward');
      }
    } catch (error) {
      console.error('Failed to create reward:', error);
      setMessage('Failed to create reward');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${apiUrl}/reward/delete-reward/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setMessage('Reward deleted successfully');
        setAllRewards(allReward.filter((reward) => reward._id !== id));
      } else {
        setMessage('Failed to delete reward');
      }
    } catch (error) {
      console.error('Failed to delete reward:', error);
      setMessage('Failed to delete reward');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setRewardImage(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview('');
    }
  };

  return (
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
              <svg
                className={styles.cloud}
                width="17"
                height="12"
                viewBox="0 0 17 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.5 4.5C13.5 2.01472 11.4853 0 9 0C6.79086 0 5 1.79086 5 4C2.23858 4 0 6.23858 0 9C0 11.7614 2.23858 14 5 14H13C15.2091 14 17 12.2091 17 10C17 7.79086 15.2091 6 13 6C13.1616 5.5271 13.3512 5.0642 13.5 4.5Z"
                  fill="#666"
                />
              </svg>
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
              <Image
                src={imagePreview}
                alt="Image Preview"
                width={100}
                height={100}
                className={styles.imagePreview}
              />
            )}
          </div>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Reward'}
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
            <Image
              className={styles.rewardImage}
              src={reward.rewardImage}
              alt={reward.rewardName}
              width={180}
              height={230}
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
  );
}
