import type { Metadata } from 'next';
import { CreateQuizClient } from './CreateQuizClient';

export const metadata: Metadata = {
    title: 'Create Quiz | NexFellow Admin',
    description: 'Create a new quiz or contest',
};

export default function CreateQuizPage() {
    return <CreateQuizClient />;
}
