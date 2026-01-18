import type { Metadata } from 'next';
import { UsersClient } from './UsersClient';

export const metadata: Metadata = {
    title: 'Users | NexFellow Admin',
    description: 'Manage registered users',
};

export default function UsersPage() {
    return <UsersClient />;
}
