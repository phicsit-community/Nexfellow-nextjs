import type { Metadata } from 'next';
import { AdvertisementsClient } from './AdvertisementsClient';

export const metadata: Metadata = {
    title: 'Advertisements | NexFellow Admin',
    description: 'Manage advertisements',
};

export default function AdvertisementsPage() {
    return <AdvertisementsClient />;
}
