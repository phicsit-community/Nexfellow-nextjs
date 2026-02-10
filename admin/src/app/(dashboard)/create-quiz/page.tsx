'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner';

export default function CreateQuizPage() {
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const { user } = useSelector((state: RootState) => state.user);

    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        duration: '',
        adminId: user || '',
        rules: [] as string[],
        category: 'Coding',
        misc: [] as { fieldName: string; fieldValue: File[] }[],
    });

    const [newRule, setNewRule] = useState('');
    const [newField, setNewField] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (name: string, value: string) => {
        setQuizData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddRule = () => {
        if (newRule.trim()) {
            setQuizData((prev) => ({ ...prev, rules: [...prev.rules, newRule] }));
            setNewRule('');
        }
    };

    const handleDeleteRule = (index: number) => {
        setQuizData((prev) => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index),
        }));
    };

    const handleAddField = () => {
        if (newField.trim()) {
            setQuizData((prev) => ({
                ...prev,
                misc: [...prev.misc, { fieldName: newField, fieldValue: [] }],
            }));
            setNewField('');
        }
    };

    const handleMiscChange = (index: number, files: FileList) => {
        const updated = [...quizData.misc];
        updated[index].fieldValue = Array.from(files);
        setQuizData((prev) => ({ ...prev, misc: updated }));
    };

    const handleSubmit = async () => {
        if (!quizData.title.trim()) {
            toast.error('Title is required');
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append('title', quizData.title);
        formData.append('description', quizData.description);
        formData.append('startTime', quizData.startTime);
        formData.append('endTime', quizData.endTime);
        formData.append('duration', quizData.duration);
        formData.append('adminId', quizData.adminId);
        formData.append('category', quizData.category);

        quizData.rules.forEach((rule, i) => {
            formData.append(`rules[${i}]`, rule);
        });

        quizData.misc.forEach((field, i) => {
            formData.append(`misc[${i}][fieldName]`, field.fieldName);
            field.fieldValue.forEach((file) => {
                formData.append(`misc[${i}][fieldValue]`, file);
            });
        });

        try {
            const res = await fetch(`${apiUrl}/admin/createquiz`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (res.ok) {
                toast.success('Contest created successfully!');
                router.push('/users');
            } else {
                toast.error('Failed to create contest');
            }
        } catch {
            toast.error('Failed to create contest');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="h-full p-6 flex flex-col overflow-hidden">
            <div className="max-w-3xl mx-auto flex-1 min-h-0 overflow-y-auto w-full">
                <div className="bg-slate-800 rounded-xl p-6">
                    <h1 className="text-2xl font-bold text-white mb-6">Create Contest</h1>

                    <div className="space-y-6">
                        {/* Title and Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Title *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                                    placeholder="Contest title"
                                    value={quizData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Category</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    value={quizData.category}
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
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
                                rows={5}
                                placeholder="Contest description..."
                                value={quizData.description}
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
                                    value={quizData.startTime}
                                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">End Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    value={quizData.endTime}
                                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Duration (mins)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    placeholder="60"
                                    value={quizData.duration}
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
                                    placeholder="Enter a new rule"
                                    value={newRule}
                                    onChange={(e) => setNewRule(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                                />
                                <button
                                    onClick={handleAddRule}
                                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            {quizData.rules.length > 0 && (
                                <ul className="space-y-2">
                                    {quizData.rules.map((rule, i) => (
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

                        {/* Custom Fields */}
                        <div>
                            <label className="block text-slate-300 text-sm mb-2">Additional Fields (Optional)</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                                    placeholder="Field name (e.g., Reference Images)"
                                    value={newField}
                                    onChange={(e) => setNewField(e.target.value)}
                                />
                                <button
                                    onClick={handleAddField}
                                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            {quizData.misc.map((field, i) => (
                                <div key={i} className="bg-slate-700 rounded-lg p-4 mb-3">
                                    <label className="block text-slate-300 text-sm mb-2">{field.fieldName}</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="text-slate-400"
                                        onChange={(e) => e.target.files && handleMiscChange(i, e.target.files)}
                                    />
                                    {field.fieldValue.length > 0 && (
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            {field.fieldValue.map((file, j) => (
                                                <img
                                                    key={j}
                                                    src={URL.createObjectURL(file)}
                                                    alt=""
                                                    className="w-20 h-20 object-cover rounded"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : 'Create Contest'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
