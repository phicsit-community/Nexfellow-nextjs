'use client';

import { useRouter } from 'next/navigation';
import ShareChallenge from '@/components/challenges/ShareChallenge/ShareChallenge';

export default function ShareChallengePage() {
    const router = useRouter();

    const handleClose = () => {
        router.back();
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
            <ShareChallenge onClose={handleClose} />
        </div>
    );
}
