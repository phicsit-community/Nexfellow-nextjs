import type { Metadata } from 'next';
import { AddRewardsClient } from './AddRewardsClient';

export const metadata: Metadata = {
    title: 'Add Rewards | NexFellow Admin',
    description: 'Add rewards to quiz',
};

export default function AddRewardsPage() {
    return <AddRewardsClient />;
}
