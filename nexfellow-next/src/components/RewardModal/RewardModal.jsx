import React, { useState } from 'react';
import styles from './RewardModal.module.css';

const RewardModal = ({ setShowAddReward, onSubmit }) => {
  const [rewardName, setRewardName] = useState('');
  const [rewardImage, setRewardImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(rewardName, rewardImage);
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setRewardImage(e.target.files[0]);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add Reward</h2>
          <button
            className={styles.closeButton}
            onClick={() => setShowAddReward(false)}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor='rewardName' className={styles.label}>
              Reward Name
            </label>
            <input
              id='rewardName'
              className={styles.input}
              value={rewardName}
              onChange={(e) => setRewardName(e.target.value)}
              placeholder='Text'
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor='rewardImage' className={styles.label}>
              Upload Reward Image
            </label>
            <div className={styles.uploadArea}>
              <input
                id='rewardImage'
                type='file'
                onChange={handleImageUpload}
                className={styles.fileInput}
              />
              <label htmlFor='rewardImage' className={styles.uploadLabel}>
                <span className={styles.uploadText}>Click to upload</span> or
                drag and drop
                <p className={styles.uploadSubtext}>Max. File Size: 5MB</p>
              </label>
            </div>
          </div>
          <div className={styles.submit}>
            <button type='submit' className={styles.submitButton}>
              Add Rewards
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RewardModal;
