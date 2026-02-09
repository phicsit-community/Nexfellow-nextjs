'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiClock, FiUsers, FiSearch } from 'react-icons/fi';
import Loader from '@/components/Loader/Loader';
import { safeFetch } from '@/lib/safeFetch';

interface Quiz {
    _id: string;
    title: string;
    category?: string;
    startTime?: string;
    endTime?: string;
    duration?: number;
    totalRegistered?: number;
    status?: 'upcoming' | 'active' | 'ended';
}

export default function QuizListPage() {
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const res = await safeFetch(`${apiUrl}/admin/getallquizzes`);
                if (res.ok) {
                    const data = await res.json();
                    setQuizzes(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Failed to fetch quizzes:', error);
                // Demo data
                setQuizzes([
                    { _id: '1', title: 'DSA Challenge Week 1', category: 'DSA', startTime: '2026-01-25T10:00:00', duration: 60, totalRegistered: 245, status: 'upcoming' },
                    { _id: '2', title: 'AI/ML Fundamentals Quiz', category: 'AI/ML', startTime: '2026-01-20T14:00:00', duration: 45, totalRegistered: 189, status: 'active' },
                    { _id: '3', title: 'Web Development Basics', category: 'Web Dev', startTime: '2026-01-15T09:00:00', duration: 30, totalRegistered: 312, status: 'ended' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, [apiUrl]);

    const getStatusColor = (quiz: Quiz) => {
        const now = new Date();
        const start = new Date(quiz.startTime || '');
        const end = quiz.endTime ? new Date(quiz.endTime) : new Date(start.getTime() + (quiz.duration || 60) * 60000);

        if (now < start) return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Upcoming' };
        if (now >= start && now <= end) return { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' };
        return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Ended' };
    };

    const filteredQuizzes = quizzes.filter((q) =>
        q.title?.toLowerCase().includes(search.toLowerCase()) ||
        q.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contests</h1>
                    <p className="text-gray-500">Manage quizzes and coding contests</p>
                </div>
                <button
                    onClick={() => router.push('/create-quiz')}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                    <FiPlus /> Create Contest
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search contests..."
                    className="w-full max-w-md pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Contests</p>
                    <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-blue-700 text-sm">Upcoming</p>
                    <p className="text-2xl font-bold text-blue-700">
                        {quizzes.filter((q) => getStatusColor(q).label === 'Upcoming').length}
                    </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-green-700 text-sm">Active</p>
                    <p className="text-2xl font-bold text-green-700">
                        {quizzes.filter((q) => getStatusColor(q).label === 'Active').length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm">Total Participants</p>
                    <p className="text-2xl font-bold text-teal-600">
                        {quizzes.reduce((acc, q) => acc + (q.totalRegistered || 0), 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Quizzes Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader />
                </div>
            ) : filteredQuizzes.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No contests found</p>
                    <button
                        onClick={() => router.push('/create-quiz')}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                    >
                        Create your first contest
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredQuizzes.map((quiz) => {
                        const status = getStatusColor(quiz);
                        return (
                            <div
                                key={quiz._id}
                                onClick={() => router.push(`/quiz/${quiz._id}`)}
                                className="bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all border border-gray-100 shadow-sm"
                            >
                                <div className="h-32 bg-linear-to-br from-teal-100 to-purple-100 flex items-center justify-center">
                                    <span className="text-5xl">📝</span>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">{quiz.category || 'General'}</span>
                                        <span className={`text-xs px-2 py-1 rounded font-medium ${status.bg} ${status.text}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <h3 className="text-gray-900 font-semibold mb-3">{quiz.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <FiClock className="text-teal-600" />
                                            {quiz.duration || 60} mins
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FiUsers className="text-teal-600" />
                                            {quiz.totalRegistered || 0}
                                        </div>
                                    </div>
                                    {quiz.startTime && (
                                        <p className="text-gray-500 text-xs mt-2">
                                            {new Date(quiz.startTime).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
