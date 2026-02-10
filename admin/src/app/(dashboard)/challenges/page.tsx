'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiUsers } from 'react-icons/fi';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { toast } from 'sonner';
import Image from 'next/image';
import { safeFetch } from '@/lib/safeFetch';

interface Challenge {
    _id: string;
    challengeName: string;
    imgURL?: string;
    participants: number;
    startDate: string;
    endDate: string;
    status: 'Active' | 'Ended' | 'Draft';
}

interface TemplateCardProps {
    heading: string;
    desc: string;
    icon: string;
    onClick: () => void;
}

function TemplateCard({ heading, desc, icon, onClick }: TemplateCardProps) {
    return (
        <div
            onClick={onClick}
            className="bg-slate-700 rounded-xl p-6 cursor-pointer hover:bg-slate-600 transition-colors border border-slate-600 hover:border-teal-500"
        >
            <div className="text-4xl mb-3">{icon}</div>
            <h3 className="text-white font-semibold mb-1">{heading}</h3>
            <p className="text-slate-400 text-sm">{desc}</p>
        </div>
    );
}

export default function ChallengesPage() {
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        challengeName: '',
        description: '',
        startDate: '',
        endDate: '',
        duration: 7, // default 7 days
    });

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const res = await safeFetch(`${apiUrl}/admin/challenges`);
                if (res.ok) {
                    const data = await res.json();
                    setChallenges(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Failed to fetch challenges:', error);
                // Demo data for display
                setChallenges([
                    { _id: '1', challengeName: '7-Day Fitness Challenge', participants: 156, startDate: '2026-01-20', endDate: '2026-01-27', status: 'Active' },
                    { _id: '2', challengeName: '30-Day Coding Bootcamp', participants: 89, startDate: '2026-01-01', endDate: '2026-01-31', status: 'Active' },
                    { _id: '3', challengeName: '100-Day Learning Journey', participants: 234, startDate: '2025-10-01', endDate: '2026-01-08', status: 'Ended' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenges();
    }, [apiUrl]);

    const handleTemplateClick = (days: number) => {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + days);
        setFormData({
            challengeName: `${days}-Day Challenge`,
            description: '',
            startDate: start.toISOString().slice(0, 10),
            endDate: end.toISOString().slice(0, 10),
            duration: days,
        });
        setShowCreateModal(true);
    };

    const handleCreateChallenge = async () => {
        if (!formData.challengeName.trim()) {
            toast.error('Challenge name is required');
            return;
        }
        setCreating(true);
        try {
            const res = await safeFetch(`${apiUrl}/admin/challenges`, {
                method: 'POST',
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success('Challenge created!');
                setShowCreateModal(false);
                setFormData({ challengeName: '', description: '', startDate: '', endDate: '', duration: 7 });
                // Refresh
                const data = await res.json();
                setChallenges(prev => [...prev, data]);
            } else {
                toast.error('Failed to create challenge');
            }
        } catch {
            toast.error('Failed to create challenge');
        } finally {
            setCreating(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="h-full p-6 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h1 className="text-2xl font-semibold text-white">Challenges</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                >
                    <FiPlus /> Create Challenge
                </button>
            </div>

            {/* Templates */}
            <div className="mb-4 shrink-0">
                <h2 className="text-slate-400 text-sm mb-4">Pick a template</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TemplateCard
                        heading="7-Day Challenge"
                        desc="Ignite a week of excitement"
                        icon="📅"
                        onClick={() => handleTemplateClick(7)}
                    />
                    <TemplateCard
                        heading="30-Day Challenge"
                        desc="Set a month-long quest"
                        icon="🗓️"
                        onClick={() => handleTemplateClick(30)}
                    />
                    <TemplateCard
                        heading="100-Day Challenge"
                        desc="Build an epic campaign"
                        icon="🏆"
                        onClick={() => handleTemplateClick(100)}
                    />
                </div>
            </div>

            {/* Challenges List */}
            <div className="bg-slate-800 rounded-xl overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-700 text-slate-300 font-semibold">
                    <div>Name</div>
                    <div className="text-center">Participants</div>
                    <div className="text-right">Status</div>
                </div>

                <div className="divide-y divide-slate-700 flex-1 min-h-0 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Loading...</div>
                    ) : challenges.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">No challenges yet. Create one!</div>
                    ) : (
                        challenges.map((challenge) => (
                            <div
                                key={challenge._id}
                                className="grid grid-cols-3 gap-4 p-4 items-center hover:bg-slate-700/50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/challenges/${challenge._id}`)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-linear-to-br from-teal-500/20 to-purple-500/20 rounded-lg flex items-center justify-center text-2xl">
                                        🎯
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{challenge.challengeName}</p>
                                        <p className="text-slate-400 text-sm">
                                            {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-slate-300">
                                    <FiUsers className="text-teal-400" />
                                    {challenge.participants}
                                </div>
                                <div className="flex items-center justify-end gap-3">
                                    <span
                                        className={`px-3 py-1 rounded-lg text-sm ${challenge.status === 'Active'
                                            ? 'bg-green-500/20 text-green-400'
                                            : challenge.status === 'Ended'
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                            }`}
                                    >
                                        {challenge.status}
                                    </span>
                                    <BsThreeDotsVertical className="text-slate-400 cursor-pointer" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl max-w-lg w-full p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Create Challenge</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Challenge Name *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    value={formData.challengeName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, challengeName: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-300 text-sm mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 text-sm mb-2">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleCreateChallenge}
                                    disabled={creating}
                                    className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Create Challenge'}
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
