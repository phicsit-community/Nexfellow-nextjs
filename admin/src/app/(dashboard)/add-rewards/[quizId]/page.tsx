'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiAward, FiSave } from 'react-icons/fi';
import { toast } from 'sonner';
import Loader from '@/components/Loader/Loader';

interface Reward {
    _id: string;
    rewardName: string;
    rewardImage?: string;
}

export default function AddRewardsPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = params.quizId as string;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
                const res = await fetch(`${apiUrl}/reward/get-all-rewards`, {
                    credentials: 'include',
                });
                if (res.ok) {
                    const data = await res.json();
                    setRewards(Array.isArray(data.data) ? data.data : []);
                }
            } catch (error) {
                console.error('Failed to fetch rewards:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRewards();
    }, [apiUrl]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSelectedRewards((prev) => ({ ...prev, [name]: value }));
    };

    const getAvailableRewards = (currentField: keyof typeof selectedRewards) => {
        return rewards.filter(
            (reward) =>
                !Object.values(selectedRewards).includes(reward.rewardName) ||
                selectedRewards[currentField] === reward.rewardName
        );
    };

    const handleSaveRewards = async () => {
        setSaving(true);
        try {
            const rewardIds = Object.values(selectedRewards)
                .map((rewardName) => rewards.find((r) => r.rewardName === rewardName)?._id)
                .filter((id) => id);

            const res = await fetch(`${apiUrl}/quiz/add-reward-to-quiz/${quizId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ rewards: rewardIds }),
            });

            if (res.ok) {
                toast.success('Rewards saved successfully!');
                router.back();
            } else {
                toast.error('Failed to save rewards');
            }
        } catch {
            toast.error('Failed to save rewards');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="h-full p-6 flex flex-col overflow-hidden">
            <div className="max-w-2xl mx-auto flex-1 min-h-0 overflow-y-auto w-full">
                <div className="bg-slate-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <FiAward className="text-2xl text-teal-400" />
                        <h1 className="text-2xl font-bold text-white">Add Rewards</h1>
                    </div>

                    <p className="text-slate-400 mb-6">
                        Select rewards for the top 3 winners of this contest.
                    </p>

                    <div className="space-y-6">
                        {/* 1st Place */}
                        <div className="bg-linear-to-r from-yellow-500/20 to-yellow-600/10 rounded-lg p-4 border border-yellow-500/30">
                            <label className="block text-yellow-400 text-sm font-semibold mb-2">
                                🥇 1st Place Reward
                            </label>
                            <select
                                name="reward1"
                                value={selectedRewards.reward1}
                                onChange={handleSelectChange}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                            >
                                <option value="">Select Reward</option>
                                {getAvailableRewards('reward1').map((reward) => (
                                    <option key={reward._id} value={reward.rewardName}>
                                        {reward.rewardName}
                                    </option>
                                ))}
                            </select>
                            {selectedRewards.reward1 && rewards.find(r => r.rewardName === selectedRewards.reward1)?.rewardImage && (
                                <img
                                    src={rewards.find(r => r.rewardName === selectedRewards.reward1)?.rewardImage}
                                    alt=""
                                    className="w-16 h-16 object-cover rounded mt-3"
                                />
                            )}
                        </div>

                        {/* 2nd Place */}
                        <div className="bg-linear-to-r from-slate-400/20 to-slate-500/10 rounded-lg p-4 border border-slate-400/30">
                            <label className="block text-slate-300 text-sm font-semibold mb-2">
                                🥈 2nd Place Reward
                            </label>
                            <select
                                name="reward2"
                                value={selectedRewards.reward2}
                                onChange={handleSelectChange}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                            >
                                <option value="">Select Reward</option>
                                {getAvailableRewards('reward2').map((reward) => (
                                    <option key={reward._id} value={reward.rewardName}>
                                        {reward.rewardName}
                                    </option>
                                ))}
                            </select>
                            {selectedRewards.reward2 && rewards.find(r => r.rewardName === selectedRewards.reward2)?.rewardImage && (
                                <img
                                    src={rewards.find(r => r.rewardName === selectedRewards.reward2)?.rewardImage}
                                    alt=""
                                    className="w-16 h-16 object-cover rounded mt-3"
                                />
                            )}
                        </div>

                        {/* 3rd Place */}
                        <div className="bg-linear-to-r from-orange-500/20 to-orange-600/10 rounded-lg p-4 border border-orange-500/30">
                            <label className="block text-orange-400 text-sm font-semibold mb-2">
                                🥉 3rd Place Reward
                            </label>
                            <select
                                name="reward3"
                                value={selectedRewards.reward3}
                                onChange={handleSelectChange}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                            >
                                <option value="">Select Reward</option>
                                {getAvailableRewards('reward3').map((reward) => (
                                    <option key={reward._id} value={reward.rewardName}>
                                        {reward.rewardName}
                                    </option>
                                ))}
                            </select>
                            {selectedRewards.reward3 && rewards.find(r => r.rewardName === selectedRewards.reward3)?.rewardImage && (
                                <img
                                    src={rewards.find(r => r.rewardName === selectedRewards.reward3)?.rewardImage}
                                    alt=""
                                    className="w-16 h-16 object-cover rounded mt-3"
                                />
                            )}
                        </div>

                        {/* Save Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleSaveRewards}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                                <FiSave /> {saving ? 'Saving...' : 'Save Rewards'}
                            </button>
                            <button
                                onClick={() => router.back()}
                                className="flex-1 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
