/* eslint-disable react/prop-types */
import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import styles from "./UserPerformance.module.css";

const UserPerformance = ({ contestMessage, performanceData, contestGiven }) => {
    const calculatePercentage = (value, total) => {
        return total > 0 ? ((value / total) * 100).toFixed(0) : 0;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const totalQuestions = performanceData.totalQuestions || 0;
    const correctAnswers = performanceData.correctAnswers || 0;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const rawScore = performanceData.score || 0;
    const totalMarks = performanceData.maxScore || performanceData.totalMarks || 0;
    const scorePercent = totalMarks > 0 ? ((rawScore / totalMarks) * 100).toFixed(0) : 0;
    const rank = performanceData.rank || "N/A";

    return (
        <div className={styles.mainWrapper}>
            {contestGiven && performanceData ? (
                <div className={styles.card}>
                    <h2 className={styles.title}>Your Challenge Performance Overview</h2>
                    <p className={styles.subtitle}>{contestMessage}</p>

                    <div className={styles.chartSection}>
                        <div className={styles.chartBlock}>
                            <div className={styles.progressWrapper}>
                                <CircularProgressbar
                                    value={calculatePercentage(correctAnswers, totalQuestions)}
                                    text={
                                        <>
                                            <tspan x="50%" dy="-0.3em">Total: {totalQuestions}</tspan>
                                            <tspan x="50%" dy="1.2em">Questions</tspan>
                                        </>
                                    }
                                    styles={buildStyles({
                                        textSize: "10px",
                                        pathColor: "#9DEBC5",
                                        trailColor: "#F29D9B",
                                        textColor: "#000",
                                    })}
                                />
                            </div>
                            <div className={styles.legend}>
                                <div>
                                    <div className={styles.legendLabel}>Total Marks</div>
                                    <div className={styles.legendValue}>{totalMarks}</div>
                                </div>
                                <div>
                                    <div className={styles.legendLabel}>Wrong Attempts</div>
                                    <div className={styles.legendValue}>{incorrectAnswers}</div>
                                </div>
                                <div>
                                    <div className={styles.legendLabel}>Right Attempts</div>
                                    <div className={styles.legendValue}>{correctAnswers}</div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.chartBlock}>
                            <div className={styles.progressWrapper}>

                                <CircularProgressbar
                                    value={scorePercent}
                                    text={
                                        <>
                                            <tspan x="50%" dy="-0.3em">Your Score</tspan>
                                            <tspan x="50%" dy="1.2em">{scorePercent}%</tspan>
                                        </>
                                    }
                                    styles={buildStyles({
                                        textSize: "10px",
                                        pathColor: "#F29D9B",
                                        trailColor: "#eee",
                                        textColor: "#000"
                                    })}
                                />
                            </div>
                            <div className={styles.rankText}>
                                You’re on <strong>{rank}</strong> rank
                            </div>
                        </div>
                    </div>

                    <div className={styles.submissionBox}>
                        Submission Time: {formatDate(performanceData.submittedAt)}
                    </div>
                </div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};

export default UserPerformance;