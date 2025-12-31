"use client";

import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

//styles
import styles from "./ForgotPassword.module.css";

//components
import AuthSide from "../../../components/authSide/AuthSide";
import navbarlogo from "./assets/NexFellowLogo.svg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/user/forgotpassword", {
        email: email.toLowerCase(),
      });

      if (response.status === 201) {
        toast.success("Reset instructions sent! Please check your email.", {
          duration: 5000,
        });
        setEmailSent(true);
      }
    } catch (error) {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authForm}>
        <div className={styles.logo}
          onClick={() => router.push("/")}
        >
          <img src={navbarlogo.src || navbarlogo} alt="NexFellow Logo"
            className={styles.logoImage}
          />
        </div>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h2>{emailSent ? "Email Sent" : "Forgot Password?"}</h2>
            <p>
              {emailSent
                ? "Please check your inbox for reset instructions."
                : "We'll email you a link to reset your password securely."}
            </p>
          </div>

          <div className={styles.form}>
            {!emailSent ? (
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                  disabled={loading}
                  className={styles.inputField}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.submitButton}
                >
                  {loading ? "Sending..." : "Send Reset Instructions"}
                </button>
              </form>
            ) : (
              <div className={styles.successContainer}>
                <div className={styles.successMessage}>
                  <p>
                    If your email address exists in our database, you will receive
                    a password recovery link at your email address in a few
                    minutes.
                  </p>
                  <p>
                    Please also check your spam folder if you don&apos;t see the email.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className={styles.submitButton}
                >
                  Try Another Email
                </button>
              </div>
            )}

            <div className={styles.redirect}>
              <Link href="/login" className={styles.backButton}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.authSide}>
        <AuthSide />
      </div>
    </div>
  );
};

export default ForgotPassword;
