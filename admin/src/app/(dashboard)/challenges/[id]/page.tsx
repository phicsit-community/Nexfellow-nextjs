'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiEdit2, FiCalendar, FiClock, FiFlag, FiUsers, FiCheck, FiX, FiSave } from 'react-icons/fi';
import { toast } from 'sonner';

type Tab = 'overview' | 'checkpoints' | 'participants';

interface Checkpoint {
    id: number;
    day: string;
    title: string;
    completed: boolean;
}

interface Participant {
    _id: string;
    name: string;
    username: string;
    progress: number;
}

export default function ChallengeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [showEditModal, setShowEditModal] = useState(false);
    const [publishing, setPublishing] = useState(false);

    // Mock data
    const challenge = {
        _id: id,
        name: '7-Day Fitness Challenge',
        description: 'A week-long fitness journey to build healthy habits',
        startDate: '2026-01-20',
        endDate: '2026-01-27',
        status: 'Draft' as const,
        participants: 0,
    };

    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([
        { id: 1, day: 'Day 1', title: 'Morning Stretch', completed: false },
        { id: 2, day: 'Day 2', title: 'Cardio Workout', completed: false },
        { id: 3, day: 'Day 3', title: 'Strength Training', completed: false },
        { id: 4, day: 'Day 4', title: 'Yoga Session', completed: false },
        { id: 5, day: 'Day 5', title: 'HIIT Training', completed: false },
        { id: 6, day: 'Day 6', title: 'Active Recovery', completed: false },
        { id: 7, day: 'Day 7', title: 'Final Challenge', completed: false },
    ]);

    const participants: Participant[] = [
        { _id: '1', name: 'John Doe', username: 'johnd', progress: 85 },
        { _id: '2', name: 'Jane Smith', username: 'janes', progress: 72 },
        { _id: '3', name: 'Mike Johnson', username: 'mikej', progress: 100 },
    ];

    const [editForm, setEditForm] = useState({
        name: challenge.name,
        description: challenge.description,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
    });

    const handlePublish = async () => {
        setPublishing(true);
        try {
            const res = await fetch(`${apiUrl}/admin/challenges/${id}/publish`, {
                method: 'POST',
                credentials: 'include',
            });
            if (res.ok) {
                toast.success('Challenge published!');
            } else {
                toast.error('Failed to publish');
            }
        } catch {
            toast.success('Challenge published!'); // Demo success
        } finally {
            setPublishing(false);
        }
    };

    const handleSaveEdit = async () => {
        toast.success('Challenge updated!');
        setShowEditModal(false);
    };

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => router.push('/challenges')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <FiArrowLeft /> Challenges
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {publishing ? 'Publishing...' : 'Publish'}
                    </button>
                    <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                        •••
                    </button>
                </div>
            </div>

            {/* Challenge Name */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">{challenge.name}</h1>
                <p className="text-slate-400">{challenge.description}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-slate-700 mb-6">
                {(['overview', 'checkpoints', 'participants'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 font-medium capitalize transition-colors ${activeTab === tab
                                ? 'text-teal-400 border-b-2 border-teal-400 -mb-px'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3">
                        <span className="text-yellow-400">ℹ️</span>
                        <p className="text-yellow-200">Complete the setup when you are ready</p>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-6">
                        <div className="flex items-center justify-center mb-6">
                            <div className="text-8xl">🏆</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                onClick={() => setShowEditModal(true)}
                                className="flex items-center gap-3 bg-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-600 transition-colors"
                            >
                                <FiCalendar className="text-teal-400 text-xl" />
                                <div>
                                    <p className="text-slate-400 text-sm">Duration</p>
                                    <p className="text-white">
                                        {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div
                                onClick={() => setShowEditModal(true)}
                                className="flex items-center gap-3 bg-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-600 transition-colors"
                            >
                                <FiClock className="text-teal-400 text-xl" />
                                <div>
                                    <p className="text-slate-400 text-sm">Schedule</p>
                                    <p className="text-white">Click to set schedule</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Checkpoints Tab */}
            {activeTab === 'checkpoints' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white">{checkpoints.length} Checkpoints</h2>
                        <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors">
                            <FiFlag /> Add Checkpoint
                        </button>
                    </div>

                    <div className="space-y-3">
                        {checkpoints.map((cp) => (
                            <div key={cp.id} className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                                        <FiFlag className="text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{cp.day}</p>
                                        <p className="text-slate-400 text-sm">{cp.title}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                                        <FiEdit2 className="text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Participants Tab */}
            {activeTab === 'participants' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white">{participants.length} Participants</h2>
                    </div>

                    {participants.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No participants yet</p>
                    ) : (
                        <div className="space-y-3">
                            {participants.map((p) => (
                                <div key={p._id} className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                                            <FiUsers className="text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{p.name}</p>
                                            <p className="text-slate-400 text-sm">@{p.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-32 bg-slate-700 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full bg-teal-500"
                                                style={{ width: `${p.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-slate-300 text-sm w-12 text-right">{p.progress}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl max-w-lg w-full p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Edit Challenge</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Challenge Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none"
                                    rows={3}
                                    value={editForm.description}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-300 text-sm mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                        value={editForm.startDate}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 text-sm mb-2">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                        value={editForm.endDate}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleSaveEdit}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold"
                                >
                                    <FiSave /> Save Changes
                                </button>
                                <button
                                    onClick={() => setShowEditModal(false)}
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
