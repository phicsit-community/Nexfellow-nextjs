'use client';

import { useRouter } from 'next/navigation';
import { useEffect, use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ChallengePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    // Redirect to overview by default
    router.replace(`/challenges/${resolvedParams.id}/overview`);
  }, [router, resolvedParams.id]);

  return <div>Loading...</div>;
}
