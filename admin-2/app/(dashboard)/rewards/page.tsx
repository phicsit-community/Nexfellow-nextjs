import type { Metadata } from 'next';
import { RewardsClient } from './RewardsClient';

export const metadata: Metadata = {
    title: 'Rewards | NexFellow Admin',
    description: 'Manage rewards',
};

export default function RewardsPage() {
    return <RewardsClient />;
}
