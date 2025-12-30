"use client";

import Inbox from "@/Pages/Inbox/Inbox";
import PrivateLayout from "@/layouts/PrivateLayout";

export default function InboxUserPage() {
    return (
        <PrivateLayout>
            <Inbox />
        </PrivateLayout>
    );
}
