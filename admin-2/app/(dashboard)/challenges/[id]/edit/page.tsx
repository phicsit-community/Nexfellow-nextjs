'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditChallenge from '@/components/challenges/EditChallenge/EditChallenge';

export default function EditChallengePage() {
    const router = useRouter();

    const handleClose = (open: boolean) => {
        if (!open) {
            router.back();
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <EditChallenge setIsEditChallengeOpen={handleClose} />
        </div>
    );
}
