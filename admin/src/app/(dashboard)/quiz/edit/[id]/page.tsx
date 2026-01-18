'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { toast } from 'sonner';
import Loader from '@/components/Loader/Loader';

interface Quiz {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    startTime: string;
    endTime: string;
    duration: number;
    rules?: string[];
}

export default function EditQuizPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Coding',
        startTime: '',
        endTime: '',
        duration: '',
        rules: [] as string[],
    });

    const [newRule, setNewRule] = useState('');

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await fetch(`${apiUrl}/admin/getquiz/${id}`, { credentials: 'include' });
                if (res.ok) {
                    const data: Quiz = await res.json();
                    setQuiz(data);
                    setFormData({
                        title: data.title || '',
                        description: data.description || '',
                        category: data.category || 'Coding',
                        startTime: data.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : '',
                        endTime: data.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : '',
                        duration: data.duration ? String(data.duration) : '',
                        rules: data.rules || [],
                    });
                }
            } catch (error) {
                console.error('Failed to fetch quiz:', error);
                toast.error('Failed to load quiz');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id, apiUrl]);

    const handleInputChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddRule = () => {
        if (newRule.trim()) {
            setFormData((prev) => ({ ...prev, rules: [...prev.rules, newRule] }));
            setNewRule('');
        }
    };

    const handleDeleteRule = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index),
        }));
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`${apiUrl}/admin/updatequiz/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    duration: parseInt(formData.duration) || 0,
                }),
            });

            if (res.ok) {
                toast.success('Contest updated successfully!');
                router.push(`/quiz/${id}`);
            } else {
                toast.error('Failed to update contest');
            }
        } catch {
            toast.error('Failed to update contest');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-400">Quiz not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-3xl mx-auto">
                <div className="bg-slate-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-white">Edit Contest</h1>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Title and Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Title *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Category</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                >
                                    <option value="Coding">Coding</option>
                                    <option value="AI/ML">AI/ML</option>
                                    <option value="Aptitude">Aptitude</option>
                                    <option value="DSA">DSA</option>
                                    <option value="Web Dev">Web Dev</option>
                                    <option value="Science">Science</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-slate-300 text-sm mb-2">Description</label>
                            <textarea
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none"
                                rows={5}
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                            />
                        </div>

                        {/* Time Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Start Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    value={formData.startTime}
                                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">End Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    value={formData.endTime}
                                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Duration (mins)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    value={formData.duration}
                                    onChange={(e) => handleInputChange('duration', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Rules */}
                        <div>
                            <label className="block text-slate-300 text-sm mb-2">Rules and Regulations</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                                    placeholder="Add a new rule"
                                    value={newRule}
                                    onChange={(e) => setNewRule(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                                />
                                <button
                                    onClick={handleAddRule}
                                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            {formData.rules.length > 0 && (
                                <ul className="space-y-2">
                                    {formData.rules.map((rule, i) => (
                                        <li key={i} className="flex items-center justify-between bg-slate-700 rounded-lg px-4 py-2">
                                            <span className="text-slate-300">{rule}</span>
                                            <button onClick={() => handleDeleteRule(i)} className="text-red-400 hover:text-red-300">
                                                <FiTrash2 />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
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
