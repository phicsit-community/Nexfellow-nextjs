import type { Metadata } from 'next';
import { NotificationsClient } from './NotificationsClient';

export const metadata: Metadata = {
    title: 'Notifications | NexFellow Admin',
    description: 'Send notifications to users',
};

export default function NotificationsPage() {
    return <NotificationsClient />;
}
