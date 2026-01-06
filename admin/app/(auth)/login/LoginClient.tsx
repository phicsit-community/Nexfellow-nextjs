'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/lib/store/slices/userSlice';
import { toast } from 'sonner';
import Image from 'next/image';
import styles from './Login.module.css';
import type { RootState } from '@/lib/store/store';

export function LoginClient() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const dispatch = useDispatch();
    const router = useRouter();

    const user = useSelector((state: RootState) => state.user.user);

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async () => {
        if (!formData.email || !formData.password) {
            toast.info('Please enter both email and password.');
            return;
        }
        try {
            const response = await fetch(`${apiUrl}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Login successful. Received data:', data);

                dispatch(
                    setUser({
                        user: data.user,
                        token: data.token,
                        expiresIn: data.expiresIn,
                    })
                );

                localStorage.setItem('token', JSON.stringify(data.token));
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('expiresIn', JSON.stringify(data.expiresIn));

                toast.success('Login successful!');
                router.push('/');
            } else {
                console.error('Login failed. Status:', response.status);
                toast.error('Invalid credentials. Please try again.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            toast.error('Login failed. Please try again later.');
        }
    };

    const handleGoogleSignIn = () => {
        window.location.href = `${apiUrl}/auth/google`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginContainer}>
                <div className={styles.logo}>
                    <Image
                        src="/assets/SideBar/GeekClashLogo.svg"
                        alt="Geek Clash Logo"
                        width={200}
                        height={50}
                        priority
                    />
                </div>
                <div className={styles.loginFormContainer}>
                    <div className={styles.loginInfo}>
                        <h3>Login</h3>
                        <p>Welcome to Geek Clash</p>
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
                            />
                        </div>
                    </div>

                    <div className={styles.loginButtonContainer}>
                        <button onClick={handleSubmit}>Sign Up</button>
                    </div>

                    <div className={styles.divider}>
                        <span>or</span>
                    </div>

                    <button className={styles.googleButton} onClick={handleGoogleSignIn}>
                        <Image
                            src="/assets/Login/google-icon.svg"
                            alt="Google"
                            width={20}
                            height={20}
                        />
                        Sign Up with Google
                    </button>

                    <p className={styles.loginLink}>
                        Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); handleGoogleSignIn(); }}>Login</a> ↗
                    </p>
                </div>
            </div>
            <div className={styles.infoContainer}>
                <div className={styles.info}>
                    <Image
                        src="/assets/Login/login.svg"
                        alt="Login Illustration"
                        width={500}
                        height={450}
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
