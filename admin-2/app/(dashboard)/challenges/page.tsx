import type { Metadata } from 'next';
import { ChallengesClient } from './ChallengesClient';

export const metadata: Metadata = {
    title: 'Challenges | NexFellow Admin',
    description: 'Manage challenges',
};

export default function ChallengesPage() {
    return <ChallengesClient />;
}
