'use client';

import { useState, useEffect, useRef } from 'react';
import { FiGift, FiUpload, FiX, FiPlus } from 'react-icons/fi';
import { toast } from 'sonner';

interface Reward {
    _id: string;
    rewardName: string;
    rewardImage: string;
}

export default function CreateRewardPage() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [rewardName, setRewardName] = useState('');
    const [rewardImage, setRewardImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [allRewards, setAllRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchRewards = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/reward/get-all-rewards`);
            if (res.ok) {
                const data = await res.json();
                setAllRewards(Array.isArray(data.data) ? data.data : []);
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
        if (!rewardName.trim() || !rewardImage) {
            toast.error('Reward name and image are required');
            return;
        }

        setCreating(true);
        const formData = new FormData();
        formData.append('rewardName', rewardName);
        formData.append('rewardImage', rewardImage);

        try {
            const res = await fetch(`${apiUrl}/reward/create-reward`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (res.ok) {
                toast.success('Reward created successfully!');
                setRewardName('');
                setRewardImage(null);
                setImagePreview('');
                fetchRewards();
            } else {
                toast.error('Failed to create reward');
            }
        } catch {
            toast.error('Failed to create reward');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this reward?')) return;

        try {
            const res = await fetch(`${apiUrl}/reward/delete-reward/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                toast.success('Reward deleted');
                setAllRewards((prev) => prev.filter((r) => r._id !== id));
            } else {
                toast.error('Failed to delete reward');
            }
        } catch {
            toast.error('Failed to delete reward');
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="flex items-center gap-3 mb-8">
                <FiGift className="text-2xl text-teal-400" />
                <div>
                    <h1 className="text-2xl font-semibold text-white">Create Rewards</h1>
                    <p className="text-slate-400">Manage rewards for contests</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create Form */}
                <div className="bg-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">New Reward</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-slate-300 text-sm mb-2">Reward Name *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                                placeholder="Enter reward name"
                                value={rewardName}
                                onChange={(e) => setRewardName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 text-sm mb-2">Reward Image *</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-3 bg-slate-700 border border-slate-600 border-dashed rounded-lg text-slate-300 hover:bg-slate-600 transition-colors w-full justify-center"
                            >
                                <FiUpload /> Upload Image
                            </button>
                            {imagePreview && (
                                <div className="mt-3 relative inline-block">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRewardImage(null);
                                            setImagePreview('');
                                        }}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={creating}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                            <FiPlus /> {creating ? 'Creating...' : 'Create Reward'}
                        </button>
                    </form>
                </div>

                {/* Rewards List */}
                <div className="bg-slate-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">All Rewards ({allRewards.length})</h2>
                    {loading ? (
                        <p className="text-slate-400 text-center py-8">Loading...</p>
                    ) : allRewards.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No rewards created yet</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {allRewards.map((reward) => (
                                <div key={reward._id} className="relative group">
                                    <div className="bg-slate-700 rounded-lg overflow-hidden">
                                        <img
                                            src={reward.rewardImage}
                                            alt={reward.rewardName}
                                            className="w-full h-24 object-cover"
                                        />
                                        <div className="p-2">
                                            <p className="text-white text-sm truncate">{reward.rewardName}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(reward._id)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
