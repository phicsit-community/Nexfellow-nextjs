"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import api from "../../../lib/axios";
import { FaGithub, FaFacebook } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import styles from "./Signup.module.css";
import google from "../assets/google.png";
import navbarlogo from "./assets/NexFellowLogo.svg";
import AuthSide from "../../../components/authSide/AuthSide";

const Signup = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const ref = searchParams.get("ref");
  const [returnUrl, setReturnUrl] = useState("/login");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    referralcode: ref,
  });

  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // OTP states
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(300);
  const [resendAvailable, setResendAvailable] = useState(false);

  useEffect(() => {
    const redirectParam = searchParams.get("redirect");
    if (redirectParam) {
      setReturnUrl("/login?redirect=" + redirectParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (showOtpField && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer <= 0) {
      setResendAvailable(true);
    }
  }, [showOtpField, timer]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "otp") setOtp(value);
    else {
      setFormData({
        ...formData,
        [name]: value,
      });
      if (name === "password") evaluatePasswordStrength(value);
    }
  };

  const evaluatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/user/register", formData);

      if (response.data.otpRequired) {
        toast.info("OTP sent to your email", {
          position: "bottom-right",
          richColors: true,
        });
        setShowOtpField(true);
        setTimer(300);
        setLoading(false);
        return;
      }

      toast.success("Signup successful");
      setFormData({
        email: "",
        password: "",
        name: "",
        referralcode: "",
      });

      setTimeout(() => {
        router.push(returnUrl);
      }, 1000);
    } catch (error) {
      toast.error("Signup failed: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await api.post("/user/otp/verify-register", {
        email: formData.email,
        otp,
      });
      toast.success("Registration complete! Please log in.", {
        position: "bottom-right",
        richColors: true,
      });
      setTimeout(() => router.push("/login"), 1000);
    } catch (error) {
      toast.error("OTP verification failed: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setResendAvailable(false);
    setTimer(300);

    try {
      await api.post("/user/otp/resend-register", { email: formData.email });
      toast.info("New OTP sent to your email", {
        position: "bottom-right",
        richColors: true,
      });
    } catch (error) {
      toast.error("Failed to resend OTP: " + (error.response?.data?.message || error.message));
    } finally {
      setResending(false);
    }
  };

  const togglePasswordVisibility = () => setPasswordVisible((v) => !v);

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
    window.open(`${link}/auth/facebook/`, "_self");
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

  // Function to handle showing the email form
  const showSignupForm = () => setShowEmailForm(true);
  const goBackToSocialOptions = () => setShowEmailForm(false);

  return (
    <div className={styles.loginFormContainer}>
      <div className={styles.loginFrom}>
        <div className={styles.card}>
          <div className={styles.logo} onClick={() => router.push("/")}>
            <img src={navbarlogo.src || navbarlogo} alt="NexFellow Logo" className={styles.logoImage} />
          </div>
          <div className={styles.loginFormCard}>
            <h1 className={styles.title}>Sign Up</h1>
            <p className={styles.titleSubheading}>
              Create an account to unlock exclusive features.
            </p>

            {!showEmailForm && !showOtpField ? (
              <>
                {/* Social Login Buttons */}
                <div className={styles.socialLogin}>
                  <button className={styles.socialBtn} onClick={googleAuth} disabled={loading}>
                    <img alt="Google" src={google.src || google} />
                    <p className={styles.btnText}>Sign up with Google</p>
                  </button>
                  <button className={styles.socialBtn} onClick={linkedinAuth} disabled={loading}>
                    <img alt="LinkedIn" src="https://cdn-icons-png.flaticon.com/512/174/174857.png" />
                    <p className={styles.btnText}>Sign up with LinkedIn</p>
                  </button>
                  <button className={styles.socialBtn} onClick={githubAuth} disabled={loading}>
                    <FaGithub size={20} />
                    <p className={styles.btnText}>Sign up with GitHub</p>
                  </button>
                  <button className={styles.socialBtn} onClick={facebookAuth} disabled={loading}>
                    <FaFacebook size={20} className="text-blue-600" />
                    <p className={styles.btnText}>Sign up with Facebook</p>
                  </button>
                </div>
                <div className={styles.divider}>
                  <span className={styles.dividerText}>or</span>
                </div>
                <button className={styles.emailSignupBtn} onClick={showSignupForm}>
                  Continue with Email
                </button>
              </>
            ) : null}

            {showEmailForm && !showOtpField && (
              <>
                {/* Back button */}
                <button className={styles.backButton} onClick={goBackToSocialOptions}>
                  <ArrowLeft size={16} />
                </button>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.emailLogin}>
                    <input
                      className={styles.signupInput}
                      type="text"
                      placeholder="Enter your full name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <input
                      className={styles.signupInput}
                      type="email"
                      placeholder="Enter your email address"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                    <div className={styles.passwordInputContainer}>
                      <input
                        className={styles.signupInput}
                        type={passwordVisible ? "text" : "password"}
                        placeholder="Create a password"
                        name="password"
                        value={formData.password}
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
                    <div className={styles.passwordStrength}>
                      <p>Password Strength:</p>
                      <div className={styles.strengthMeter}>
                        <div className={`${styles.strengthBar} ${passwordStrength >= 1 ? styles.strong : ""}`}></div>
                        <div className={`${styles.strengthBar} ${passwordStrength >= 2 ? styles.strong : ""}`}></div>
                        <div className={`${styles.strengthBar} ${passwordStrength >= 3 ? styles.strong : ""}`}></div>
                        <div className={`${styles.strengthBar} ${passwordStrength >= 4 ? styles.strong : ""}`}></div>
                        <div className={`${styles.strengthBar} ${passwordStrength >= 5 ? styles.strong : ""}`}></div>
                      </div>
                    </div>
                  </div>
                  <button className={styles.ctaBtn} type="submit" disabled={loading}>
                    {loading ? <div className={styles.spinner}></div> : "Sign Up"}
                  </button>
                </form>
              </>
            )}

            {/* OTP UI copied from Login */}
            {showOtpField && (
              <div className={styles.otpContainer}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  name="otp"
                  value={otp}
                  onChange={handleChange}
                  className={styles.signupInput}
                  disabled={loading}
                />
                <div className={styles.otpActions}>
                  <button
                    className={styles.ctaBtn}
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading}
                  >
                    {loading ? <div className={styles.spinner}></div> : "Verify OTP"}
                  </button>
                  <p className={styles.otpTimer}>
                    {resendAvailable ? (
                      <button
                        type="button"
                        className={styles.resendOtpBtn}
                        onClick={handleResendOtp}
                        disabled={resending}
                      >
                        {resending ? <div className={styles.smallSpinner}></div> : "Resend OTP"}
                      </button>
                    ) : (
                      `Resend in ${formatTime(timer)}`
                    )}
                  </p>
                </div>
              </div>
            )}

            <p className={styles.subtitle}>
              Have an account? <Link href="/login">Login</Link>
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

export default Signup;
