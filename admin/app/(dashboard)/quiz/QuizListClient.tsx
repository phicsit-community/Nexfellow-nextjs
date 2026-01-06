'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Quiz.module.css';

interface Quiz {
    _id: string;
    title: string;
    category?: string;
    startTime: string;
    endTime?: string;
    totalRegistered?: number;
    status?: string;
}

export function QuizListClient() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await fetch(`${apiUrl}/admin/getallquizzes`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setQuizzes(data);
                }
            } catch (error) {
                console.error('Failed to fetch quizzes:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, [apiUrl]);

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <h1 className={styles.title}>Quizzes & Contests</h1>
                <Link href="/quiz/create" className={styles.createBtn}>
                    + Create Quiz
                </Link>
            </div>

            <div className={styles.quizList}>
                {loading ? (
                    <div className={styles.loading}>Loading quizzes...</div>
                ) : quizzes.length === 0 ? (
                    <div className={styles.empty}>No quizzes found. Create your first quiz!</div>
                ) : (
                    quizzes.map((quiz) => (
                        <div
                            key={quiz._id}
                            className={styles.quizCard}
                            onClick={() => router.push(`/quiz/${quiz._id}`)}
                        >
                            <div className={styles.quizInfo}>
                                <h3 className={styles.quizTitle}>{quiz.title}</h3>
                                <span className={styles.quizCategory}>{quiz.category || 'General'}</span>
                            </div>
                            <div className={styles.quizMeta}>
                                <span>Registered: {quiz.totalRegistered || 0}</span>
                                <span>Start: {new Date(quiz.startTime).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
