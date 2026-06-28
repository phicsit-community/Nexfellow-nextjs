"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page was used by the legacy Passport.js OAuth exchange-code flow.
// Clerk now handles the OAuth redirect internally — route to sign-in.
export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/sign-in");
    }, [router]);

    return null;
}
