"use client";

import Dashboard from "@/Pages/Dashboard/Dashboard";
import PrivateLayout from "@/layouts/PrivateLayout";

export default function DashboardUserPage() {
    return (
        <PrivateLayout>
            <Dashboard />
        </PrivateLayout>
    );
}
