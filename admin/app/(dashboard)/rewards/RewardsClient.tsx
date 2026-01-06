'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Rewards.module.css';

interface Reward {
    _id: string;
    rewardName: string;
    rewardImage: string;
}

export function RewardsClient() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState('');
    const [rewardName, setRewardName] = useState('');
    const [rewardImage, setRewardImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchRewards = async () => {
        try {
            const response = await fetch(`${apiUrl}/reward/get-all-rewards`, {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setRewards(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch rewards:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, [apiUrl]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setRewardImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rewardImage || !rewardName) {
            setMessage('Please fill all fields');
            return;
        }

        setCreating(true);
        const formData = new FormData();
        formData.append('rewardName', rewardName);
        formData.append('rewardImage', rewardImage);

        try {
            const response = await fetch(`${apiUrl}/reward/create-reward`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (response.ok) {
                setMessage('Reward created successfully!');
                setRewardName('');
                setRewardImage(null);
                setImagePreview('');
                fetchRewards();
            } else {
                setMessage('Failed to create reward');
            }
        } catch (error) {
            setMessage('Failed to create reward');
        } finally {
            setCreating(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this reward?')) return;

        try {
            const response = await fetch(`${apiUrl}/reward/delete-reward/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setMessage('Reward deleted successfully');
                setRewards(rewards.filter((r) => r._id !== id));
            } else {
                setMessage('Failed to delete reward');
            }
        } catch (error) {
            setMessage('Failed to delete reward');
        }
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className={styles.pageWrapper}>
            <h1 className={styles.title}>Rewards Management</h1>

            {/* Create Reward Form */}
            <div className={styles.createSection}>
                <h2>Create New Reward</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="rewardName">Reward Name</label>
                        <input
                            type="text"
                            id="rewardName"
                            value={rewardName}
                            onChange={(e) => setRewardName(e.target.value)}
                            placeholder="Enter reward name"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Reward Image</label>
                        <div
                            className={styles.uploadBox}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className={styles.preview} />
                            ) : (
                                <div className={styles.uploadPlaceholder}>
                                    <span>📤 Click to upload image</span>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={creating}>
                        {creating ? 'Creating...' : 'Create Reward'}
                    </button>
                </form>
                {message && <p className={styles.message}>{message}</p>}
            </div>

            {/* All Rewards */}
            <div className={styles.rewardsSection}>
                <h2>All Rewards</h2>
                {loading ? (
                    <div className={styles.loading}>Loading rewards...</div>
                ) : rewards.length === 0 ? (
                    <div className={styles.empty}>No rewards created yet</div>
                ) : (
                    <div className={styles.rewardsGrid}>
                        {rewards.map((reward) => (
                            <div key={reward._id} className={styles.rewardCard}>
                                <img src={reward.rewardImage} alt={reward.rewardName} />
                                <span className={styles.rewardName}>{reward.rewardName}</span>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDelete(reward._id)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
