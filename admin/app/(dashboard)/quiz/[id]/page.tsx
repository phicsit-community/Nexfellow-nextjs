import type { Metadata } from 'next';
import { QuizDetailClient } from './QuizDetailClient';

export const metadata: Metadata = {
    title: 'Quiz Details | NexFellow Admin',
    description: 'View quiz details and questions',
};

export default function QuizDetailPage() {
    return <QuizDetailClient />;
}
