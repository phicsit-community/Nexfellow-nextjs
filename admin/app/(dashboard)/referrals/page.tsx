import type { Metadata } from 'next';
import { ReferralsClient } from './ReferralsClient';

export const metadata: Metadata = {
    title: 'Referrals | NexFellow Admin',
    description: 'View referral leaderboard',
};

export default function ReferralsPage() {
    return <ReferralsClient />;
}
