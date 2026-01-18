'use client';

import { useState, useEffect, use } from 'react';
import EditQuiz from '@/components/quiz/EditQuiz/EditQuiz';
import styles from './Edit.module.css';

interface Quiz {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  adminId: string;
  rules: string[];
  category: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_LOCALHOST;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/admin/getquiz/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setQuiz(data);
        } else {
          console.error('Failed to fetch quiz. Status:', response.status);
          setError('Failed to fetch quiz');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        setError('Failed to fetch quiz: ' + errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuiz();
    }
  }, [id]);

  return (
    <div className={styles.container}>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : quiz ? (
        <EditQuiz quiz={quiz} />
      ) : (
        <p>Quiz not found</p>
      )}
    </div>
  );
}
