"use client";

import React, { useEffect, useState } from "react";
import api from "../../lib/axios";
import { useParams, useRouter } from "next/navigation";
import styles from "./StartContestPage.module.css";
import startImg from "./assets/start.png";
import { Icon } from "@iconify/react";

const StartContestPage = () => {
    const params = useParams();
    const quizId = params?.quizId;
    const router = useRouter();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const isCommunityQuiz = true;

    useEffect(() => {
        api.get(`community/quizzes/${quizId}`)
            .then(res => {
                setQuiz(res.data.quiz);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [quizId]);

    const handleStart = () => {
        router.push(
            `/contest-question/${quizId}?isCommunityQuiz=${isCommunityQuiz}`
        );
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString("en-GB");
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString("en-US", {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    function formatDuration(quiz) {
        if (!quiz) return "N/A";
        if (quiz.timerMode === "rapid" && Array.isArray(quiz.questions) && quiz.questions.length > 0) {
            const totalSeconds = quiz.questions.reduce((sum, q) => sum + (q.timeLimit || 0), 0);
            if (totalSeconds >= 60) {
                const mins = Math.floor(totalSeconds / 60);
                const secs = totalSeconds % 60;
                return secs === 0
                    ? `${mins} min`
                    : `${mins} min ${secs} sec`;
            } else {
                return `${totalSeconds} sec`;
            }
        } else {
            // Full mode: duration is minutes
            if (quiz.duration >= 60) {
                const hours = Math.floor(quiz.duration / 60);
                const mins = quiz.duration % 60;
                return mins === 0
                    ? `${hours} hr`
                    : `${hours} hr ${mins} min`;
            }
            return `${quiz.duration} min`;
        }
    }

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (!quiz) return <div className={styles.error}>Quiz not found.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.leftPanel}>
                <img src={startImg?.src || startImg} alt="Start Contest" className={styles.illustration} />
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.header}>
                    <div className={styles.category}>{quiz.category}</div>

                    <div className={styles.contestTotalRegistered}>
                        <div className={styles.contestAvatarGroup}>
                            {quiz.User_profile_Image?.slice(0, 3).map((img, index) => (
                                <div
                                    key={index}
                                    className={styles.contestAvatarWrapper}
                                    style={{ zIndex: 3 - index }}
                                >
                                    <img
                                        src={img || "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png"}
                                        alt={`User ${index + 1}`}
                                        className={styles.contestAvatar}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png";
                                        }}
                                    />
                                </div>
                            ))}

                            {quiz.User_profile_Image?.length > 3 && (
                                <div className={styles.contestAvatarWrapper} style={{ zIndex: 0 }}>
                                    <div className={styles.moreCount}>
                                        +{quiz.User_profile_Image.length - 3}
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className={styles.contestJoined}>
                            {quiz.totalRegistered || 0} Participants
                        </p>
                    </div>
                </div>

                <h2 className={styles.title}>{quiz.title}</h2>
                <p className={styles.description}>{quiz.description}</p>

                <div className={styles.infoGrid}>
                    <div className={styles.infoBlock}>
                        <Icon icon="material-symbols:avg-time-outline-rounded" className={styles.infoIcon} />
                        <div>
                            <div className={styles.infoLabel}>Duration</div>
                            <div className={styles.infoValue}>{formatDuration(quiz)}</div>
                        </div>
                    </div>

                    <div className={styles.infoBlock}>
                        <Icon icon="iconamoon:certificate-badge-light" className={styles.infoIcon} />
                        <div>
                            <div className={styles.infoLabel}>Questions</div>
                            <div className={styles.infoValue}>
                                {quiz.questions?.length != null ? `${quiz.questions.length} Questions` : "N/A"}
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoBlock}>
                        <Icon icon="material-symbols:date-range-rounded" className={styles.infoIcon} />
                        <div>
                            <div className={styles.infoLabel}>Start date</div>
                            <div className={styles.infoValue}>{formatDate(quiz.startTime)}</div>
                        </div>
                    </div>

                    <div className={styles.infoBlock}>
                        <Icon icon="mdi:clock-outline" className={styles.infoIcon} />
                        <div>
                            <div className={styles.infoLabel}>Start Time</div>
                            <div className={styles.infoValue}>{formatTime(quiz.startTime)}</div>
                        </div>
                    </div>
                </div>

                <div className={styles.beforeStart}>
                    <div className={styles.beforeStartTitle}>Before you start:</div>
                    <ul className={styles.rulesList}>
                        <li>
                            <Icon icon="solar:check-circle-linear" className={styles.ruleIcon} />
                            Answer all {quiz.questions?.length || "N/A"} questions within {formatDuration(quiz)}
                        </li>
                        <li>
                            <Icon icon="solar:check-circle-linear" className={styles.ruleIcon} />
                            You can navigate between questions freely
                        </li>
                        <li>
                            <Icon icon="solar:check-circle-linear" className={styles.ruleIcon} />
                            Your progress is saved automatically
                        </li>
                        <li>
                            <Icon icon="solar:check-circle-linear" className={styles.ruleIcon} />
                            Submit when you're confident with your answers
                        </li>
                    </ul>
                </div>

                <button className={styles.startBtn} onClick={handleStart}>
                    Start Contest
                </button>
            </div>
        </div>
    );
};

export default StartContestPage;
