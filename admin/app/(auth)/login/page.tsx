import type { Metadata } from 'next';
import { LoginClient } from './LoginClient';

export const metadata: Metadata = {
    title: 'Login | NexFellow Admin',
    description: 'Login to NexFellow Admin Panel',
};

export default function LoginPage() {
    return <LoginClient />;
}
