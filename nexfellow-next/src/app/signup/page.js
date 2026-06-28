"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirects legacy /signup route to Clerk's /sign-up page.
export default function SignupPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/sign-up");
    }, [router]);

    return null;
}
