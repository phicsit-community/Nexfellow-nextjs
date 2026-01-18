'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../Quiz.module.css';

interface Quiz {
    _id: string;
    title: string;
    category?: string;
    description?: string;
    rules?: string[];
    startTime: string;
    endTime?: string;
    duration?: number;
    totalRegistered?: number;
    misc?: Array<{ fieldName: string; fieldValue: string[] }>;
}

interface Question {
    _id: string;
    question: string;
    options?: string[];
    correctAnswer?: string;
}

export function QuizDetailClient() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const { id } = useParams();
    const router = useRouter();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [questionsLoading, setQuestionsLoading] = useState(true);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await fetch(`${apiUrl}/admin/getquiz/${id}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setQuiz(data);
                }
            } catch (error) {
                console.error('Failed to fetch quiz:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [apiUrl, id]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch(`${apiUrl}/admin/getquestions/${id}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setQuestions(data);
                }
            } catch (error) {
                console.error('Failed to fetch questions:', error);
            } finally {
                setQuestionsLoading(false);
            }
        };
        fetchQuestions();
    }, [apiUrl, id]);

    const calculateResult = async () => {
        try {
            const response = await fetch(`${apiUrl}/admin/compileResults/${id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (response.ok) {
                alert('Result calculated successfully');
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            alert('Failed to calculate result. Please try again.');
        } finally {
            setShowConfirmation(false);
        }
    };

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

    if (loading) {
        return <div className={styles.loading}>Loading quiz...</div>;
    }

    if (!quiz) {
        return <div className={styles.empty}>Quiz not found</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.infoContainer}>
                <h1 className={styles.heading}>{quiz.title}</h1>
                <span className={styles.category}>{quiz.category || 'General'}</span>
                {quiz.description && (
                    <p className={styles.description}>{quiz.description}</p>
                )}

                {quiz.rules && quiz.rules.length > 0 && (
                    <div className={styles.rulesContainer}>
                        <h2 className={styles.rulesHeading}>Rules</h2>
                        <ul>
                            {quiz.rules.map((rule, index) => (
                                <li key={index} className={styles.rule}>{rule}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className={styles.miscInfo}>
                    <div className={styles.part}>
                        <p className={styles.partInfo}>
                            <span>Total Registered:</span> {quiz.totalRegistered || 0}
                        </p>
                        <p className={styles.partInfo}>
                            <span>Date:</span> {new Date(quiz.startTime).toLocaleDateString()}
                        </p>
                        <p className={styles.partInfo}>
                            <span>Start Time:</span> {convertToIST(quiz.startTime, false)}
                        </p>
                        {quiz.endTime && (
                            <p className={styles.partInfo}>
                                <span>End Time:</span> {convertToIST(quiz.endTime, false)}
                            </p>
                        )}
                        {quiz.duration && (
                            <p className={styles.partInfo}>
                                <span>Duration:</span> {quiz.duration} minutes
                            </p>
                        )}
                    </div>

                    <div className={styles.part}>
                        <Link href={`/quiz/edit/${id}`} className={styles.button}>
                            Edit Contest
                        </Link>
                        <button
                            className={styles.button}
                            onClick={() => setShowConfirmation(true)}
                        >
                            Calculate Result
                        </button>
                        <Link href={`/rewards/add/${id}`} className={styles.button}>
                            Add Rewards
                        </Link>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className={styles.addQueModal}>
                    <div style={{
                        background: 'white',
                        padding: '32px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        maxWidth: '400px'
                    }}>
                        <h3>Confirm Calculation</h3>
                        <p>Are you sure you want to calculate results? This will update the leaderboard.</p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'center' }}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setShowConfirmation(false)}
                            >
                                Cancel
                            </button>
                            <button className={styles.submitBtn} onClick={calculateResult}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Questions Section */}
            <div className={styles.infoContainer}>
                <h2 className={styles.heading}>Questions</h2>
                {questionsLoading ? (
                    <div>Loading questions...</div>
                ) : questions.length === 0 ? (
                    <div className={styles.empty}>No questions added yet</div>
                ) : (
                    <div className={styles.questionsContainer}>
                        {questions.map((question, index) => (
                            <div key={question._id} className={styles.questionCard}>
                                <strong>Q{index + 1}:</strong> {question.question}
                                {question.options && (
                                    <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                        {question.options.map((opt, i) => (
                                            <li key={i}>{opt}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
