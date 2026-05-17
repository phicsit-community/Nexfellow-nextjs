"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Comingsoon.module.css';

const Comingsoon = () => {
    const router = useRouter();
    const [userInitial, setUserInitial] = useState('');

    useEffect(() => {
        const userData = typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('user'))
            : null;
        if (userData?.username) {
            setUserInitial(userData.username.charAt(0).toUpperCase());
        } else if (userData?.name) {
            setUserInitial(userData.name.charAt(0).toUpperCase());
        }
    }, []);

    return (
        <div className={styles.comingsoon}>
            <div className={styles.content}>
                <h1>
                    We&apos;re <span className={styles.highlight}>Coming Soon!</span>
                </h1>
                <p>
                    We&apos;re working hard to launch this page. This page is currently
                    under construction.
                </p>
                <div className={styles.actions}>
                    <button className={styles.notifyButton} onClick={() => router.push('/')}>Go Home</button>
                </div>
            </div>
        </div>
    );
};

export default Comingsoon;
