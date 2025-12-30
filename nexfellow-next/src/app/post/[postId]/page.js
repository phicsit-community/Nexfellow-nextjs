"use client";

import PostFullScreen from "@/Pages/PostPage/PostFullScreen";
import PrivateLayout from "@/layouts/PrivateLayout";

export default function PostPage() {
    return (
        <PrivateLayout>
            <PostFullScreen />
        </PrivateLayout>
    );
}
