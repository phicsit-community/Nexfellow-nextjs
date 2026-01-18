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
                    <Image
                        src="/images/NexFellowLogo.svg"
                        alt="NexFellow Logo"
                        width={275}
                        height={80}
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
                            <input
                                type="password"
                                placeholder="Enter your password"
                                name="password"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            />
                        </div>
                    </div>

                    <div className={styles.loginButtonContainer}>
                        <button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "Logging in..." : "Log In"}
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
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
