'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../Quiz.module.css';

export function CreateQuizClient() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        startTime: '',
        endTime: '',
        duration: '',
        rules: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const rules = formData.rules.split('\n').filter(r => r.trim());
            const response = await fetch(`${apiUrl}/admin/createquiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    rules,
                    duration: parseInt(formData.duration) || 60,
                }),
            });

            if (response.ok) {
                alert('Quiz created successfully!');
                router.push('/quiz');
            } else {
                throw new Error('Failed to create quiz');
            }
        } catch (error) {
            alert('Failed to create quiz. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <h1 className={styles.heading}>Create New Quiz</h1>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Quiz Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter quiz title"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="">Select category</option>
                            <option value="Technology">Technology</option>
                            <option value="Science">Science</option>
                            <option value="General Knowledge">General Knowledge</option>
                            <option value="Programming">Programming</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter quiz description"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="startTime">Start Time *</label>
                        <input
                            type="datetime-local"
                            id="startTime"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="endTime">End Time</label>
                        <input
                            type="datetime-local"
                            id="endTime"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="duration">Duration (minutes)</label>
                        <input
                            type="number"
                            id="duration"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder="60"
                            min="1"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="rules">Rules (one per line)</label>
                        <textarea
                            id="rules"
                            name="rules"
                            value={formData.rules}
                            onChange={handleChange}
                            placeholder="Enter rules, one per line"
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={() => router.back()}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Quiz'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
