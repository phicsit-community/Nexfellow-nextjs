'use client';

import styles from './CreateChallenge.module.css';

// components
import TemplateCard from '@/components/challenges/TemplateCard/TemplateCard';
import ChallengeForm from '@/components/challenges/ChallengeForm/ChallengeForm';

// icons
import { FiUsers } from 'react-icons/fi';
import { BsThreeDotsVertical } from 'react-icons/bs';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Challenge {
  id: number;
  challengeName: string;
  imgURL: string;
  participants: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Ended';
}

export default function CreateChallengePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();

  const handleClickOnChallenge = () => {
    router.push('/challenges/overview');
  };

  useEffect(() => {
    if (isCreateModalOpen) {
      document.body.style.overflow = 'hidden';
      scrollTo(0, 0);
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isCreateModalOpen]);

  const challenges: Challenge[] = [
    {
      id: 1,
      challengeName: 'Testing 1',
      imgURL: '/images/trophy.png',
      participants: 10,
      startDate: '31 Jul 2024',
      endDate: '09 Sep 2024',
      status: 'Active',
    },
    {
      id: 2,
      challengeName: 'Testing 2',
      imgURL: '/images/challenge-placeholder.jpg',
      participants: 20,
      startDate: '31 Jul 2024',
      endDate: '09 Sep 2024',
      status: 'Ended',
    },
    {
      id: 3,
      challengeName: 'Testing 3',
      imgURL: '/images/challenge-placeholder.jpg',
      participants: 9,
      startDate: '31 Jul 2024',
      endDate: '09 Sep 2024',
      status: 'Ended',
    },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Challenges</h1>
          <div
            className={styles.button}
            onClick={() => {
              setIsCreateModalOpen(true);
            }}
          >
            + Create Challenge
          </div>
        </div>

        <div className={styles.templateContainer}>
          <div className={styles.text}>Pick a template</div>

          <div className={styles.templates}>
            <TemplateCard
              heading="7-day Challenge"
              desc="Ignite a week of excitement"
              logo="/images/Week.svg"
              onClick={() => setIsCreateModalOpen(true)}
            />

            <TemplateCard
              heading="30-day Challenge"
              desc="Set a month-long quest"
              logo="/images/Month.svg"
              onClick={() => setIsCreateModalOpen(true)}
            />

            <TemplateCard
              heading="100-day Challenge"
              desc="Build an epic campaign"
              logo="/images/100Days.svg"
              onClick={() => setIsCreateModalOpen(true)}
            />
          </div>
        </div>

        {/* Challenges */}
        <div className={styles.challengeListContainer}>
          {/* HEADER */}
          <div className={styles.challengeListHeader}>
            <div className={styles.headerName}>Name</div>
            <div className={styles.partStatus}>
              <div>Participants</div>
              <div>Status</div>
            </div>
          </div>
          {/* Challenge List */}

          <div className={styles.challengesList}>
            {challenges.map((challenge) => {
              return (
                <div
                  key={challenge.id}
                  className={styles.challengeItem}
                  onClick={handleClickOnChallenge}
                >
                  <div className={styles.challengeNameAndImage}>
                    <Image
                      src={challenge.imgURL}
                      alt="challenge"
                      width={240}
                      height={134}
                      className={styles.challengeImage}
                    />
                    <div className={styles.nameAndDate}>
                      <div className={styles.challengeName}>
                        {challenge.challengeName}
                      </div>
                      <div className={styles.date}>
                        {challenge.startDate} - {challenge.endDate}
                      </div>
                    </div>
                  </div>

                  <div className={styles.participantsStyle}>
                    <div className={styles.participantsUsers}>
                      <FiUsers className={styles.participateIcons} />
                      {challenge.participants}
                    </div>
                    <div>
                      <div
                        className={
                          challenge.status === 'Active'
                            ? styles.active
                            : styles.ended
                        }
                      >
                        {challenge.status}
                      </div>
                    </div>
                    <div>
                      <BsThreeDotsVertical
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCreateModalOpen(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className={styles.overlay} />
      )}

      <div className={styles.modalContainer}>
        {isCreateModalOpen && (
          <ChallengeForm setIsCreateModalOpen={setIsCreateModalOpen} />
        )}
      </div>
    </div>
  );
}
