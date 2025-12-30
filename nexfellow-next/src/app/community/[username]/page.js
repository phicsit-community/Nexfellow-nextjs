"use client";

import ViewCommunity from "@/Pages/Community/ViewCommunity";
import PrivateLayout from "@/layouts/PrivateLayout";

export default function CommunityPage() {
    return (
        <PrivateLayout>
            <ViewCommunity />
        </PrivateLayout>
    );
}
