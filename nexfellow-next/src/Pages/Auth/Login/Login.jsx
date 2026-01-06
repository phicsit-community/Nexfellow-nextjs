"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../../lib/axios";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaGithub, FaFacebook } from "react-icons/fa";

// style
import styles from "./Login.module.css";

// redux
import { login } from "../../../store/slices/authSlice";
import { useTheme } from "../../../hooks/useTheme";

// assets
import google from "../assets/google.png";
import navbarlogo from "./assets/NexFellowLogo.svg";

// components
import AuthSide from "../../../components/authSide/AuthSide";

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpRequired, setOtpRequired] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [resending, setResending] = useState(false);
  const { setTheme } = useTheme();

  // Timer states
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [resendAvailable, setResendAvailable] = useState(false);

  // Use module-level flag to prevent duplicate auth checks across remounts
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Use sessionStorage to prevent auth check on hot reloads
    const authChecked = sessionStorage.getItem("loginAuthChecked");
    if (authChecked === "true" || isRedirecting) return;
    sessionStorage.setItem("loginAuthChecked", "true");

    // Clear the flag after 5 seconds to allow re-check if user stays on page
    const clearTimer = setTimeout(() => {
      sessionStorage.removeItem("loginAuthChecked");
    }, 5000);

    // Check for stale token data on mount
    if (typeof window !== "undefined" && localStorage.getItem("isLoggedIn") === "true") {
      const expiresIn = localStorage.getItem("expiresIn");
      if (expiresIn) {
        const expiresAt = new Date(expiresIn);
        if (isNaN(expiresAt) || expiresAt <= new Date()) {
          console.log("Login: Found expired token, will attempt refresh");
        }
      }
    }

    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/getDetails", {
          withCredentials: true,
        });

        if (response.status === 200) {
          const { payload, expiresIn, redirect } = response.data;

          dispatch(login({ user: payload, expiresIn }));
          setIsRedirecting(true);

          // Ensure redirect is a valid string
          const redirectPath = typeof redirect === "string" ? redirect : "/feed";

          setTimeout(() => {
            if (redirectPath.startsWith("http")) {
              window.location.href = redirectPath;
            } else {
              router.push(redirectPath);
            }
          }, 300);
        }
      } catch (error) {
        // Silent fail - user is not logged in, stay on login page
        console.log("Not authenticated, staying on login page");
      }
    };

    checkAuth();

    return () => {
      clearTimeout(clearTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showOtpField && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer <= 0) {
      setResendAvailable(true);
    }
  }, [showOtpField, timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
    else if (name === "otp") setOtp(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/user/login", { email, password });

      if (response.data.otpRequired) {
        toast.info("OTP sent to your email", {
          position: "bottom-right",
          richColors: true,
        });
        setOtpRequired(true);
        setShowOtpField(true);
        setTimer(Math.floor((response.data.expiresAt - Date.now()) / 1000));
        console.log("OTP required:", response.data);
        setLoading(false);
        return;
      }

      const { payload, expiresIn, redirect } = response.data;

      dispatch(login({ user: payload, expiresIn }));
      if (payload.themePreference) {
        setTheme(payload.themePreference);
      }
      toast.success("Login successful", {
        position: "bottom-right",
        richColors: true,
      });

      // Ensure redirect is a valid string
      const redirectPath = typeof redirect === "string" ? redirect : "/feed";

      setTimeout(() => {
        if (redirectPath.startsWith("http")) {
          window.location.href = redirectPath;
        } else {
          router.push(redirectPath);
        }
      }, 300);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message || "Login failed. Please try again.",
        { position: "bottom-right", richColors: true }
      );
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/user/otp/verify", { email, otp });

      const { payload, expiresIn, redirect, expiresAt } = response.data;

      dispatch(login({ user: payload, expiresIn }));

      toast.success("Login successful", {
        position: "bottom-right",
        richColors: true,
      });

      // Ensure redirect is a valid string
      const redirectPath = typeof redirect === "string" ? redirect : "/feed";

      setTimeout(() => {
        if (redirectPath.startsWith("http")) {
          window.location.href = redirectPath;
        } else {
          router.push(redirectPath);
        }
      }, 300);
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(
        error.response?.data?.message ||
        "OTP verification failed. Please try again.",
        { position: "bottom-right", richColors: true }
      );
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setResending(true);
    setResendAvailable(false);
    setTimer(300); // Reset timer to 5 minutes

    try {
      await api.post("/user/otp/resend", { email });
      toast.info("New OTP sent to your email", {
        position: "bottom-right",
        richColors: true,
      });
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to resend OTP. Please try again.",
        { position: "bottom-right", richColors: true }
      );
    } finally {
      setResending(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisible);
  };

  const googleAuth = () => {
    const link = process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_LOCALHOST
      : process.env.NEXT_PUBLIC_SERVER_URL;
    window.open(`${link}/auth/google/callback`, "_self");
  };

  const githubAuth = () => {
    const link = process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_LOCALHOST
      : process.env.NEXT_PUBLIC_SERVER_URL;
    window.open(`${link}/auth/github/callback`, "_self");
  };
  const facebookAuth = () => {
    const link = process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_LOCALHOST
      : process.env.NEXT_PUBLIC_SERVER_URL;
    window.open(`${link}/auth/facebook/callback`, "_self");
  };

  const linkedinAuth = () => {
    const link = process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_LOCALHOST
      : process.env.NEXT_PUBLIC_SERVER_URL;
    window.open(`${link}/auth/linkedin/`, "_self");
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  return (
    <div className={styles.loginFormContainer}>
      <div className={styles.loginForm}>
        <div className={styles.card}>
          <div className={styles.logo}
            onClick={() => router.push("/")}
          >
            <img src={navbarlogo.src || navbarlogo} alt="NexFellow Logo"
              className={styles.logoImage}
            />
          </div>
          <div className={styles.loginFormCard}>
            <h1 className={styles.title}>Login</h1>
            <p className={styles.titleSubheading}>
              Welcome back! Please log in to access your account.
            </p>

            {/* Social Login Buttons - Moved to top */}
            <div className={styles.socialLogin}>
              <button
                className={styles.socialBtn}
                onClick={googleAuth}
                disabled={loading}
              >
                <img alt="Google" src={google.src || google} />
                <p className={styles.btnText}>Login with Google</p>
              </button>
              <button
                className={styles.socialBtn}
                onClick={linkedinAuth}
                disabled={loading}
              >
                <img
                  alt="LinkedIn"
                  src="https://cdn-icons-png.flaticon.com/512/174/174857.png"
                  width={20}
                />
                <p className={styles.btnText}>Login with LinkedIn</p>
              </button>
              <button
                className={styles.socialBtn}
                onClick={githubAuth}
                disabled={loading}
              >
                <FaGithub size={20} />
                <p className={styles.btnText}>Login with GitHub</p>
              </button>
              <button
                className={styles.socialBtn}
                onClick={facebookAuth}
                disabled={loading}
              >
                <FaFacebook size={20} className="text-blue-600" />
                <p className={styles.btnText}>Login with Facebook</p>
              </button>
            </div>

            <div className={styles.divider}>
              <span className={styles.dividerText}>or</span>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                className={styles.loginInputs}
                type="email"
                placeholder="Enter your email address"
                name="email"
                value={email}
                onChange={handleChange}
                required
                disabled={loading}
              />

              <div className={styles.passwordInputContainer}>
                <input
                  className={styles.loginInputs}
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {passwordVisible ? (
                  <AiOutlineEye
                    className={styles.togglePasswordVisibility}
                    onClick={togglePasswordVisibility}
                  />
                ) : (
                  <AiOutlineEyeInvisible
                    className={styles.togglePasswordVisibility}
                    onClick={togglePasswordVisibility}
                  />
                )}
              </div>

              {!showOtpField && (
                <button
                  className={styles.ctaBtn}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <div className={styles.spinner}></div> : "Login"}
                </button>
              )}
            </form>

            {showOtpField && (
              <div className={styles.otpContainer}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  name="otp"
                  value={otp}
                  onChange={handleChange}
                  className={styles.loginInputs}
                />
                <div className={styles.otpActions}>
                  <button
                    className={styles.otpBtn}
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className={styles.spinner}></div>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                  <p className={styles.otpTimer}>
                    {resendAvailable ? (
                      <button
                        type="button"
                        className={styles.resendOtpBtn}
                        onClick={handleResendOtp}
                        disabled={resending}
                      >
                        {resending ? (
                          <div className={styles.smallSpinner}></div>
                        ) : (
                          "Resend OTP"
                        )}
                      </button>
                    ) : (
                      `Resend in ${formatTime(timer)}`
                    )}
                  </p>
                </div>
              </div>
            )}

            <Link href="/forgotpassword" className={styles.forgetPass}>
              Forgot password?
            </Link>
            <p className={styles.subtitle}>
              Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
            </p>
          </div>
        </div>

        <div className={styles.loginFormPhoto}>
          <AuthSide />
        </div>
      </div>
    </div>
  );
};

export default Login;
