"use client";

import Leaderboard from "@/Pages/Leaderboard/Leaderboard";
import PrivateLayout from "@/layouts/PrivateLayout";

export default function LeaderboardPage() {
    return (
        <PrivateLayout>
            <Leaderboard />
        </PrivateLayout>
    );
}
