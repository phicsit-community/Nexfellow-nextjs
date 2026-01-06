'use client';

import styles from './Loader.module.css';

interface LoaderProps {
    className?: string;
}

export function Loader({ className }: LoaderProps) {
    return <div className={`${styles.loader} ${className || ''}`}></div>;
}
