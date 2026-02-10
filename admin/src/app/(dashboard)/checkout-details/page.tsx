'use client';

import { useState } from 'react';
import { FiX, FiFlag } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Checkpoint {
    id: number;
    day: string;
    date: string;
}

export default function CheckoutDetailsPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    // Sample checkpoints data
    const checkpoints: Checkpoint[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        day: `DAY ${i + 1}`,
        date: 'DATE MONTH, TIME - TIME',
    }));

    const handleClose = () => {
        router.back();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        setSaving(true);
        // Simulate API call
        await new Promise((r) => setTimeout(r, 1000));
        toast.success('Checkpoint saved successfully');
        setSaving(false);
        router.back();
    };

    const handleCancel = () => {
        setTitle('');
        setDescription('');
        router.back();
    };

    return (
        <div className="h-full p-6 flex flex-col overflow-hidden">
            <div className="bg-slate-800 rounded-xl max-w-5xl mx-auto flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <h1 className="text-xl font-semibold text-white">Checkpoint Details</h1>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <FiX className="text-slate-400 text-xl" />
                    </button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 flex-1 min-h-0 overflow-y-auto">
                    {/* Left Section - Form */}
                    <div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label htmlFor="title" className="block text-slate-300 text-sm mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    placeholder="Enter title"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-slate-300 text-sm mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    placeholder="Enter description"
                                    rows={6}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 resize-none"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Section - Checkpoints List */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">
                            {checkpoints.length} Checkpoints
                        </h3>
                        <div className="space-y-3 max-h-100 overflow-y-auto pr-2">
                            {checkpoints.map((checkpoint) => (
                                <div
                                    key={checkpoint.id}
                                    className="flex items-center gap-4 bg-slate-700 rounded-lg p-4 hover:bg-slate-600/50 transition-colors cursor-pointer"
                                >
                                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center shrink-0">
                                        <FiFlag className="text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{checkpoint.day}</p>
                                        <p className="text-slate-400 text-sm">{checkpoint.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
