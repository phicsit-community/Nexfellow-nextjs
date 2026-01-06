import type { Metadata } from 'next';
import { PostsClient } from './PostsClient';

export const metadata: Metadata = {
    title: 'Posts | NexFellow Admin',
    description: 'Manage and moderate posts',
};

export default function PostsPage() {
    return <PostsClient />;
}
