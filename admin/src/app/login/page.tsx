'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/slices/userSlice";
import styles from "./Login.module.css";
import { toast } from "sonner";
import Image from "next/image";

const LoginPage = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const dispatch = useDispatch();
    const router = useRouter();
    const hasChecked = useRef(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if already logged in - only once on mount
    useEffect(() => {
        if (hasChecked.current) return;
        hasChecked.current = true;

        const token = localStorage.getItem('token');
        const expiresIn = localStorage.getItem('expiresIn');

        if (token && expiresIn) {
            try {
                const expirationDate = new Date(JSON.parse(expiresIn));
                if (expirationDate > new Date()) {
                    // Already logged in, redirect to users
                    console.log('[Login] Already authenticated, redirecting...');
                    router.replace("/users");
                    return;
                }
            } catch (e) {
                // Invalid data, clear it
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('expiresIn');
            }
        }

        setIsLoading(false);
    }, [router]);

    const handleSubmit = async () => {
        if (!formData.email || !formData.password) {
            toast.info("Please enter both email and password.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${apiUrl}/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Login successful. Received data:", data);

                dispatch(
                    setUser({
                        user: data.user,
                        token: data.token,
                        expiresIn: data.expiresIn,
                    })
                );

                localStorage.setItem("token", JSON.stringify(data.token));
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("expiresIn", JSON.stringify(data.expiresIn));

                toast.success("Login successful!");
                router.replace("/users");
            } else {
                console.error("Login failed. Status:", response.status);
                toast.error("Invalid credentials. Please try again.");
            }
        } catch (error) {
            console.error("Error during login:", error);
            toast.error("Login failed. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignUp = () => {
        window.location.href = `${apiUrl}/auth/google?state=admin`;
    };

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.loginContainer}>
                <div className={styles.logo}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/Navbar/NexFellowLogo.svg"
                        alt="NexFellow Logo"
                        style={{ height: '60px', width: 'auto' }}
                    />
                </div>
                <div className={styles.loginFormContainer}>
                    <div className={styles.loginInfo}>
                        <h3>Login</h3>
                        <p>Welcome to NexFellow</p>
                    </div>

                    <div className={styles.loginInputContainer}>
                        <div className={styles.inputContainer}>
                            <label>
                                Email<span className={styles.imp}>*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                name="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <label>
                                Password<span className={styles.imp}>*</span>
                            </label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    name="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6a6a6a" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6a6a6a" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.loginButtonContainer}>
                        <button onClick={handleSubmit} disabled={isSubmitting} className={styles.signUpButton}>
                            {isSubmitting ? "Logging in..." : "Login"}
                        </button>
                    </div>

                    <div className={styles.divider}>
                        <span>or</span>
                    </div>

                    <div className={styles.googleButtonContainer}>
                        <button onClick={handleGoogleSignUp} className={styles.googleButton}>
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Login with Google</span>
                        </button>
                    </div>

                    <div className={styles.accountLink}>
                        <span>Already have an account? </span>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleGoogleSignUp(); }}>Login</a>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="7" y1="17" x2="17" y2="7" />
                            <polyline points="7 7 17 7 17 17" />
                        </svg>
                    </div>
                </div>
            </div>
            <div className={styles.infoContainer}>
                <div className={styles.info}>
                    <Image
                        src="/images/login.svg"
                        alt="Login Illustration"
                        width={500}
                        height={450}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
