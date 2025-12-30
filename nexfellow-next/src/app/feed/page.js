"use client";

import FeedPage from "@/Pages/FeedPage/FeedPage";
import PrivateLayout from "@/layouts/PrivateLayout";

export default function Feed() {
    return (
        <PrivateLayout>
            <FeedPage />
        </PrivateLayout>
    );
}
