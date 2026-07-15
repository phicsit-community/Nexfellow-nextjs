"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirects legacy /login route to Clerk's /sign-in page.
export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/sign-in");
    }, [router]);

    return null;
}
