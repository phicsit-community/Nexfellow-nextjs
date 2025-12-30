import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import styles from "./ContestCompletedPage.module.css";
import quizCompletedImg from "./assets/complete.png";
import { Icon } from '@iconify/react';
import axios from "axios";

const ContestCompletedPage = () => {
    const location = useLocation();
    const { quizId } = useParams();
    const [stats, setStats] = useState({ attempted: 0, notAttempted: 0, timeTaken: 0, totalPossibleTime: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (location.state && location.state.stats) {
            setStats(location.state.stats);
            setLoading(false);
        } else if (quizId) {
            axios.get(`/community/quizzes/${quizId}`)
                .then(res => {
                    const quiz = res.data.quiz;
                    const response = res.data.response;
                    console.log("Quiz questions:", quiz.questions);
                    console.log("Response answers:", response?.answers);

                    // Calculate attempted and not attempted
                    const allQuestionIds = quiz.questions.map(q => q._id.toString());
                    const answeredQuestionIds = response?.answers
                        ?.filter(a => a.response && a.response.length > 0)
                        ?.map(a => a.questionId?.toString()) || [];
                    const attempted = answeredQuestionIds.length;
                    const notAttempted = allQuestionIds.length - attempted;

                    // Calculate time taken (from submission)
                    const timeTaken = response?.timeTaken || 0;

                    // Calculate total possible time for rapid mode
                    const totalPossibleTime = quiz.timerMode === "rapid"
                        ? quiz.questions.reduce((sum, q) => sum + (q.timeLimit || 0), 0)
                        : (quiz.duration || 0) * 60;

                    setStats({ attempted, notAttempted, timeTaken, totalPossibleTime });
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching quiz data:", err);
                    setError("Failed to load contest results. Please try again.");
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [location.state, quizId]);

    const formatTime = (seconds) => {
        if (seconds === undefined || isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <div className={styles.left}>
                    <img src={quizCompletedImg} alt="Tech Quiz" className={styles.quizImage} />
                </div>
                <div className={styles.right}>
                    <h2 className={styles.heading}>Contest Completed!</h2>
                    <div className={styles.iconWrapper}>
                        <Icon icon="mdi:badge" className={styles.badgeIcon} />
                        <Icon icon="solar:cup-bold" className={styles.trophyIcon} />
                    </div>
                    <p className={styles.result}>Result to be announced soon!</p>
                    <p className={styles.keepPracticing}>Keep practicing!</p>
                    <div className={styles.stats}>
                        <div className={styles.statBox}>
                            <div className={styles.statValue}>{stats.attempted}</div>
                            <div className={styles.statLabel}>Attempted</div>
                        </div>
                        <div className={styles.statBox}>
                            <div className={styles.statValue}>{stats.notAttempted}</div>
                            <div className={styles.statLabel}>Not Attempted</div>
                        </div>
                        <div className={styles.statBox}>
                            <div className={styles.statValue}>{formatTime(stats.timeTaken)}</div>
                            <div className={styles.statLabel}>Time Taken</div>
                        </div>
                        <div className={styles.statBox}>
                            <div className={styles.statValue}>{formatTime(stats.totalPossibleTime)}</div>
                            <div className={styles.statLabel}>Total Possible Time</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestCompletedPage;
