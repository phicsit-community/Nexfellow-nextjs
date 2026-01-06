import type { Metadata } from 'next';
import { BlogsClient } from './BlogsClient';

export const metadata: Metadata = {
    title: 'Blogs | NexFellow Admin',
    description: 'Manage blog posts',
};

export default function BlogsPage() {
    return <BlogsClient />;
}
