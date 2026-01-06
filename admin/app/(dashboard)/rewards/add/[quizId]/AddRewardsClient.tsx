'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from '../../Rewards.module.css';

interface Reward {
    _id: string;
    rewardName: string;
    rewardImage: string;
}

export function AddRewardsClient() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const { quizId } = useParams();
    const router = useRouter();
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedRewards, setSelectedRewards] = useState({
        reward1: '',
        reward2: '',
        reward3: '',
    });

    useEffect(() => {
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
        fetchRewards();
    }, [apiUrl]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRewards({
            ...selectedRewards,
            [e.target.name]: e.target.value,
        });
    };

    const getAvailableRewards = (currentField: string) => {
        return rewards.filter(
            (reward) =>
                !Object.values(selectedRewards).includes(reward.rewardName) ||
                selectedRewards[currentField as keyof typeof selectedRewards] === reward.rewardName
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const rewardIds = Object.values(selectedRewards)
                .map((name) => rewards.find((r) => r.rewardName === name)?._id)
                .filter(Boolean);

            const response = await fetch(`${apiUrl}/quiz/add-reward-to-quiz/${quizId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ rewards: rewardIds }),
            });

            if (response.ok) {
                alert('Rewards saved successfully!');
                router.back();
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            alert('Failed to save rewards. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading rewards...</div>;
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.addRewardsContainer}>
                <h2>Add Rewards to Quiz</h2>

                <div className={styles.selectGroup}>
                    <label htmlFor="reward1">🥇 1st Place Reward</label>
                    <select
                        id="reward1"
                        name="reward1"
                        value={selectedRewards.reward1}
                        onChange={handleChange}
                    >
                        <option value="">Select Reward</option>
                        {getAvailableRewards('reward1').map((reward) => (
                            <option key={reward._id} value={reward.rewardName}>
                                {reward.rewardName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.selectGroup}>
                    <label htmlFor="reward2">🥈 2nd Place Reward</label>
                    <select
                        id="reward2"
                        name="reward2"
                        value={selectedRewards.reward2}
                        onChange={handleChange}
                    >
                        <option value="">Select Reward</option>
                        {getAvailableRewards('reward2').map((reward) => (
                            <option key={reward._id} value={reward.rewardName}>
                                {reward.rewardName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.selectGroup}>
                    <label htmlFor="reward3">🥉 3rd Place Reward</label>
                    <select
                        id="reward3"
                        name="reward3"
                        value={selectedRewards.reward3}
                        onChange={handleChange}
                    >
                        <option value="">Select Reward</option>
                        {getAvailableRewards('reward3').map((reward) => (
                            <option key={reward._id} value={reward.rewardName}>
                                {reward.rewardName}
                            </option>
                        ))}
                    </select>
                </div>

                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Rewards'}
                </button>
            </div>
        </div>
    );
}
