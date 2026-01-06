'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUsers } from 'react-icons/fi';
import styles from './Challenges.module.css';

interface Challenge {
    _id: string;
    challengeName: string;
    imageUrl?: string;
    participants?: number;
    startDate: string;
    endDate: string;
    status: 'Active' | 'Ended' | 'Upcoming';
}

export function ChallengesClient() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const response = await fetch(`${apiUrl}/admin/challenges`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setChallenges(data);
                }
            } catch (error) {
                console.error('Failed to fetch challenges:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenges();
    }, [apiUrl]);

    // Template cards for quick creation
    const templates = [
        { name: '7-day Challenge', description: 'Ignite a week of excitement', days: 7 },
        { name: '30-day Challenge', description: 'Set a month-long quest', days: 30 },
        { name: '100-day Challenge', description: 'Build an epic campaign', days: 100 },
    ];

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.header}>
                <h1 className={styles.title}>Challenges</h1>
                <button
                    className={styles.createBtn}
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create Challenge
                </button>
            </div>

            {/* Template Section */}
            <div className={styles.templateSection}>
                <h3 className={styles.sectionTitle}>Pick a template</h3>
                <div className={styles.templates}>
                    {templates.map((template, index) => (
                        <div
                            key={index}
                            className={styles.templateCard}
                            onClick={() => router.push(`/challenges/create?days=${template.days}`)}
                        >
                            <div className={styles.templateIcon}>📅</div>
                            <h4>{template.name}</h4>
                            <p>{template.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Challenges List */}
            <div className={styles.challengesList}>
                <div className={styles.listHeader}>
                    <span>Name</span>
                    <span>Participants</span>
                    <span>Status</span>
                </div>

                {loading ? (
                    <div className={styles.loading}>Loading challenges...</div>
                ) : challenges.length === 0 ? (
                    <div className={styles.empty}>No challenges found. Create your first challenge!</div>
                ) : (
                    challenges.map((challenge) => (
                        <div
                            key={challenge._id}
                            className={styles.challengeCard}
                            onClick={() => router.push(`/challenges/${challenge._id}`)}
                        >
                            <div className={styles.challengeInfo}>
                                <div className={styles.challengeImage}>
                                    {challenge.imageUrl ? (
                                        <img src={challenge.imageUrl} alt={challenge.challengeName} />
                                    ) : (
                                        <div className={styles.placeholderImage}>🏆</div>
                                    )}
                                </div>
                                <div>
                                    <h4>{challenge.challengeName}</h4>
                                    <span className={styles.dates}>
                                        {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.participants}>
                                <FiUsers />
                                {challenge.participants || 0}
                            </div>
                            <div className={`${styles.status} ${styles[challenge.status.toLowerCase()]}`}>
                                {challenge.status}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
