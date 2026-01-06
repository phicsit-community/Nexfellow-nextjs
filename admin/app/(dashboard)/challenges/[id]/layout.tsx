'use client';

import { use } from 'react';
import ChallengeDetailLayout from '@/components/challenges/ChallengeDetailLayout/ChallengeDetailLayout';

interface PageProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default function ChallengeLayout({ children, params }: PageProps) {
  const resolvedParams = use(params);
  
  return (
    <ChallengeDetailLayout challengeId={resolvedParams.id}>
      {children}
    </ChallengeDetailLayout>
  );
}
