"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

// styles
import styles from "./ViewOnlyQuiz.module.css";

// components
import BackButton from "../../components/BackButton/BackButton";

const ViewOnlyQuiz = () => {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/public/quiz/${id}`);
        setQuiz(response.data.quiz);
      } catch (err) {
        console.error("Failed to fetch quiz:", err);
        setError("Failed to load quiz information");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleLoginPrompt = () => {
    router.push(`/login?returnUrl=${encodeURIComponent(`/quiz/${id}`)}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading quiz information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error Loading Quiz</h3>
        <p>{error}</p>
        <button onClick={handleBack} className={styles.backButton}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <BackButton onClick={handleBack} />
        <button className={styles.loginButton} onClick={handleLoginPrompt}>
          Login to Participate
        </button>
      </div>

      <div className={styles.container}>
        <div className={styles.previewBanner}>
          <span>Quiz Preview</span>
          <p>Login to see all details and participate</p>
        </div>

        {quiz ? (
          <div className={styles.infoContainer}>
            <h1 className={styles.heading}>{quiz.title || "Quiz Preview"}</h1>

            <div className={styles.category}>{quiz.category || "General"}</div>

            <div className={styles.description}>
              <p>{quiz.description || "No description available"}</p>

              {quiz.topics && quiz.topics.length > 0 && (
                <div>
                  <p>Topics covered:</p>
                  <ul>
                    {quiz.topics.map((topic, index) => (
                      <li key={index} className={styles.descriptionList}>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {quiz.rules && quiz.rules.length > 0 && (
              <div className={styles.rulesContainer}>
                <h2 className={styles.rulesHeading}>Rules:</h2>
                <ul>
                  {quiz.rules.map((rule, index) => (
                    <li key={index} className={styles.rule}>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.part1}>
              <p className={styles.partInfo}>
                <span>Total Registered:</span> {quiz.totalParticipants || 0}
              </p>

              <p className={styles.partInfo}>
                <span>Date:</span>{" "}
                {quiz.startTime
                  ? new Date(quiz.startTime).toLocaleDateString()
                  : "TBA"}
              </p>

              <p className={styles.partInfo}>
                <span>Duration:</span> {quiz.duration || 0} minutes
              </p>

              <p className={styles.partInfo}>
                <span>Rewards:</span> {quiz.rewards || "Not specified"}
              </p>
            </div>

            <div className={styles.authPrompt}>
              <h3>Want to participate in this quiz?</h3>
              <p>Login or create an account to:</p>
              <ul>
                <li>Register for this quiz</li>
                <li>Answer questions and earn points</li>
                <li>Compete with other participants</li>
                <li>Win rewards and recognition</li>
              </ul>
              <div className={styles.authButtons}>
                <button
                  className={styles.authLoginButton}
                  onClick={() => router.push(`/login?returnUrl=${encodeURIComponent(`/quiz/${id}`)}`)}
                >
                  Login
                </button>
                <button
                  className={styles.authSignupButton}
                  onClick={() => router.push("/signup")}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.notFound}>Quiz information not available</div>
        )}
      </div>
    </div>
  );
};

export default ViewOnlyQuiz;
