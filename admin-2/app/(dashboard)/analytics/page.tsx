import type { Metadata } from 'next';
import { AnalyticsClient } from './AnalyticsClient';

export const metadata: Metadata = {
    title: 'Analytics | NexFellow Admin',
    description: 'View platform analytics and statistics',
};

export default function AnalyticsPage() {
    return <AnalyticsClient />;
}
