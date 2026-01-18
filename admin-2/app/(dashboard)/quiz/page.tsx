import type { Metadata } from 'next';
import { QuizListClient } from './QuizListClient';

export const metadata: Metadata = {
    title: 'Quizzes | NexFellow Admin',
    description: 'Manage quizzes and contests',
};

export default function QuizPage() {
    return <QuizListClient />;
}
