'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ChallengeDetailLayout.module.css';
import EditChallenge from '@/components/challenges/EditChallenge/EditChallenge';

interface ChallengeLayoutProps {
  children: React.ReactNode;
  challengeId: string;
}

export default function ChallengeDetailLayout({
  children,
  challengeId,
}: ChallengeLayoutProps) {
  const [isEditChallengeOpen, setIsEditChallengeOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname.includes(path);

  return (
    <div>
      {isEditChallengeOpen && <div className={styles.overlay}></div>}
      <div>
        <div className={styles.hero}>
          <button
            className={styles.allChallenges}
            onClick={() => router.push('/challenges/create')}
          >
            <Image
              src="/images/leftarrow.svg"
              alt="Back"
              width={20}
              height={20}
            />
            <p>Challenges</p>
          </button>
          <div className={styles.challengeContainer}>
            <p className={styles.challengeName}>Challenge Name</p>
            <div className={styles.publishContainer}>
              <button className={styles.publishButton}>Publish</button>
              <Image
                src="/images/threedots.svg"
                alt="Menu"
                width={24}
                height={24}
              />
            </div>
          </div>
          <div className={styles.challengeDetails}>
            <Link
              href={`/challenges/${challengeId}/overview`}
              className={isActive('overview') ? styles.activeLink : ''}
            >
              Overview
            </Link>
            <Link
              href={`/challenges/${challengeId}/checkpoints`}
              className={isActive('checkpoints') ? styles.activeLink : ''}
            >
              Checkpoints
            </Link>
            <Link
              href={`/challenges/${challengeId}/participants`}
              className={isActive('participants') ? styles.activeLink : ''}
            >
              Participants
            </Link>
          </div>
          <div>{children}</div>
        </div>
      </div>
      {isEditChallengeOpen && (
        <EditChallenge setIsEditChallengeOpen={setIsEditChallengeOpen} />
      )}
    </div>
  );
}
