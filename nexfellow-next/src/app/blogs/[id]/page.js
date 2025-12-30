"use client";

import { InternalBlogPage } from "@/Pages/Blog/InternalBlogPage/InternalBlogPage";
import PublicLayout from "@/layouts/PublicLayout";

export default function BlogDetailPage() {
    return (
        <PublicLayout>
            <InternalBlogPage />
        </PublicLayout>
    );
}
