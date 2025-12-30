"use client";

import ViewUser from "@/Pages/User/ViewUser";
import PrivateLayout from "@/layouts/PrivateLayout";

export default function UserProfilePage() {
    return (
        <PrivateLayout>
            <ViewUser />
        </PrivateLayout>
    );
}
