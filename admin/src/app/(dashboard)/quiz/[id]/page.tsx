'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiPlus, FiEdit2, FiTrash2, FiAward, FiClock, FiCalendar, FiUsers } from 'react-icons/fi';
import { toast } from 'sonner';
import Loader from '@/components/Loader/Loader';

interface Question {
    _id: string;
    text: string;
    type: 'radio' | 'checkbox' | 'text';
    options?: { text: string; isCorrect?: boolean }[];
}

interface Quiz {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    startTime: string;
    endTime: string;
    duration: number;
    totalRegistered?: number;
    rules?: string[];
    misc?: { fieldName: string; fieldValue: string[] }[];
}

export default function QuizDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [questionsLoading, setQuestionsLoading] = useState(true);
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [showConfirmResult, setShowConfirmResult] = useState(false);
    const [processing, setProcessing] = useState(false);

    // New question form
    const [newQuestion, setNewQuestion] = useState({ text: '', type: 'radio' as 'radio' | 'checkbox' | 'text', options: [{ text: '', isCorrect: false }] });

    const convertToIST = (dateString: string, includeDate = true) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Kolkata',
            year: includeDate ? 'numeric' : undefined,
            month: includeDate ? 'long' : undefined,
            day: includeDate ? 'numeric' : undefined,
            hour: '2-digit',
            minute: '2-digit',
        };
        return date.toLocaleString('en-IN', options);
    };

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await fetch(`${apiUrl}/admin/getquiz/${id}`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setQuiz(data);
                }
            } catch (error) {
                console.error('Failed to fetch quiz:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id, apiUrl]);

    const fetchQuestions = async () => {
        setQuestionsLoading(true);
        try {
            const res = await fetch(`${apiUrl}/admin/getquestions/${id}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setQuestions(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        } finally {
            setQuestionsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [id, apiUrl]);

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        try {
            const res = await fetch(`${apiUrl}/admin/deletequestion/${questionId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (res.ok) {
                toast.success('Question deleted');
                fetchQuestions();
            } else {
                toast.error('Failed to delete question');
            }
        } catch {
            toast.error('Failed to delete question');
        }
    };

    const handleAddQuestion = async () => {
        if (!newQuestion.text.trim()) {
            toast.error('Question text is required');
            return;
        }
        setProcessing(true);
        try {
            const res = await fetch(`${apiUrl}/admin/addquestion/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newQuestion),
            });
            if (res.ok) {
                toast.success('Question added');
                setShowAddQuestion(false);
                setNewQuestion({ text: '', type: 'radio', options: [{ text: '', isCorrect: false }] });
                fetchQuestions();
            } else {
                toast.error('Failed to add question');
            }
        } catch {
            toast.error('Failed to add question');
        } finally {
            setProcessing(false);
        }
    };

    const calculateResult = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`${apiUrl}/admin/compileResults/${id}`, { credentials: 'include' });
            if (res.ok) {
                toast.success('Results calculated successfully!');
                setShowConfirmResult(false);
            } else {
                toast.error('Failed to calculate results');
            }
        } catch {
            toast.error('Failed to calculate results');
        } finally {
            setProcessing(false);
        }
    };

    const addOption = () => {
        setNewQuestion(prev => ({
            ...prev,
            options: [...prev.options, { text: '', isCorrect: false }]
        }));
    };

    const updateOption = (index: number, value: string) => {
        setNewQuestion(prev => ({
            ...prev,
            options: prev.options.map((opt, i) => i === index ? { ...opt, text: value } : opt)
        }));
    };

    const toggleCorrect = (index: number) => {
        setNewQuestion(prev => ({
            ...prev,
            options: prev.options.map((opt, i) => i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt)
        }));
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
            {/* Quiz Header */}
            <div className="bg-slate-800 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
                        <span className="inline-block mt-2 px-3 py-1 bg-teal-500/20 text-teal-400 rounded-lg text-sm">{quiz.category}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAddQuestion(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
                        >
                            <FiPlus /> Add Question
                        </button>
                        <button
                            onClick={() => router.push(`/quiz/edit/${id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                        >
                            <FiEdit2 /> Edit Contest
                        </button>
                    </div>
                </div>

                {quiz.description && (
                    <div className="text-slate-300 mb-4 whitespace-pre-wrap">{quiz.description}</div>
                )}

                {quiz.rules && quiz.rules.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-white font-semibold mb-2">Rules</h3>
                        <ul className="list-disc list-inside text-slate-300 space-y-1">
                            {quiz.rules.map((rule, i) => (
                                <li key={i}>{rule}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <FiUsers /> Registered
                        </div>
                        <p className="text-white font-semibold">{quiz.totalRegistered || 0}</p>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <FiCalendar /> Date
                        </div>
                        <p className="text-white font-semibold">{new Date(quiz.startTime).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <FiClock /> Start
                        </div>
                        <p className="text-white font-semibold">{convertToIST(quiz.startTime, false)}</p>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <FiClock /> Duration
                        </div>
                        <p className="text-white font-semibold">{quiz.duration} mins</p>
                    </div>
                </div>

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={() => setShowConfirmResult(true)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                    >
                        Calculate Result
                    </button>
                    <button
                        onClick={() => router.push(`/add-rewards/${id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                    >
                        <FiAward /> Add Rewards
                    </button>
                </div>
            </div>

            {/* Questions Section */}
            <div className="bg-slate-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Questions ({questions.length})</h2>
                {questionsLoading ? (
                    <div className="flex justify-center py-8"><Loader /></div>
                ) : questions.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No questions added yet</p>
                ) : (
                    <div className="space-y-4">
                        {questions.map((question, index) => (
                            <div key={question._id} className="bg-slate-700 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-white font-medium">Q{index + 1}. {question.text}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDeleteQuestion(question._id)}
                                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                                {question.options && question.options.length > 0 && (
                                    <div className="space-y-2 ml-4">
                                        {question.options.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input
                                                    type={question.type === 'checkbox' ? 'checkbox' : 'radio'}
                                                    disabled
                                                    className="w-4 h-4"
                                                />
                                                <span className={`text-slate-300 ${opt.isCorrect ? 'text-green-400 font-medium' : ''}`}>
                                                    {opt.text} {opt.isCorrect && '✓'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <span className="text-xs text-slate-500 mt-2 inline-block">Type: {question.type}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Question Modal */}
            {showAddQuestion && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Add Question</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Question Text</label>
                                <textarea
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    rows={3}
                                    value={newQuestion.text}
                                    onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm mb-2">Type</label>
                                <select
                                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    value={newQuestion.type}
                                    onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value as 'radio' | 'checkbox' | 'text' }))}
                                >
                                    <option value="radio">Single Choice (Radio)</option>
                                    <option value="checkbox">Multiple Choice (Checkbox)</option>
                                    <option value="text">Text Answer</option>
                                </select>
                            </div>
                            {newQuestion.type !== 'text' && (
                                <div>
                                    <label className="block text-slate-300 text-sm mb-2">Options</label>
                                    {newQuestion.options.map((opt, i) => (
                                        <div key={i} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                                placeholder={`Option ${i + 1}`}
                                                value={opt.text}
                                                onChange={(e) => updateOption(i, e.target.value)}
                                            />
                                            <label className="flex items-center gap-1 text-slate-300 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={opt.isCorrect}
                                                    onChange={() => toggleCorrect(i)}
                                                />
                                                Correct
                                            </label>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addOption}
                                        className="text-teal-400 text-sm hover:underline"
                                    >
                                        + Add Option
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleAddQuestion}
                                    disabled={processing}
                                    className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg disabled:opacity-50"
                                >
                                    {processing ? 'Adding...' : 'Add Question'}
                                </button>
                                <button
                                    onClick={() => setShowAddQuestion(false)}
                                    className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Result Modal */}
            {showConfirmResult && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-semibold text-white mb-4">Calculate Results?</h3>
                        <p className="text-slate-300 mb-6">This action will calculate all scores and display the leaderboard.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={calculateResult}
                                disabled={processing}
                                className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : 'Confirm'}
                            </button>
                            <button
                                onClick={() => setShowConfirmResult(false)}
                                className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
