import type { Metadata } from 'next';
import { CheckoutDetailsClient } from './CheckoutDetailsClient';

export const metadata: Metadata = {
    title: 'Checkout Details | NexFellow Admin',
    description: 'View checkpoint details',
};

export default function CheckoutDetailsPage() {
    return <CheckoutDetailsClient />;
}
