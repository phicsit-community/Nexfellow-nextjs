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
            const response = await fetch(`${apiUrl}/login`, {
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


                </div>
            </div>
            <div className={styles.infoContainer}>
                <div className={styles.info}>
                    <Image
                        src="/images/login.svg"
                        alt="Login Illustration"
                        width={500}
                        height={450}
                        style={{ width: '100%', height: 'auto', maxWidth: '500px' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
