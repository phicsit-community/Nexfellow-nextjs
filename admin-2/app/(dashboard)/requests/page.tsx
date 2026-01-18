import type { Metadata } from 'next';
import { RequestsClient } from './RequestsClient';

export const metadata: Metadata = {
    title: 'Verifications | NexFellow Admin',
    description: 'Manage verification requests',
};

export default function RequestsPage() {
    return <RequestsClient />;
}
