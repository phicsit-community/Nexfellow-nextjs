import type { Metadata } from 'next';
import { FeaturedCommunitiesClient } from './FeaturedCommunitiesClient';

export const metadata: Metadata = {
    title: 'Featured Communities | NexFellow Admin',
    description: 'Manage featured communities',
};

export default function FeaturedCommunitiesPage() {
    return <FeaturedCommunitiesClient />;
}
