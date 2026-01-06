'use client';

import React from 'react';
import Image from 'next/image';
import styles from './Overview.module.css';

export default function OverviewPage() {
  return (
    <div className={styles.overviewContainer}>
      <div className={styles.overviewTop}>
        <Image
          src="/images/info.svg"
          alt="Info"
          width={20}
          height={20}
        />
        <p>Complete the setup when you are ready</p>
      </div>
      <div className={styles.overviewBottom}>
        <div className={styles.trophyImage}>
          <Image
            src="/images/trophy.png"
            alt="Trophy"
            width={100}
            height={100}
          />
        </div>
        <div className={styles.overviewFunction}>
          <Image
            src="/images/calendar.svg"
            alt="Calendar"
            width={24}
            height={24}
          />
          <p>DATE MONTH-DATE MONTH</p>
        </div>
        <div className={styles.overviewFunction}>
          <Image
            src="/images/time.svg"
            alt="Time"
            width={24}
            height={24}
          />
          <p>Schedule</p>
        </div>
      </div>
    </div>
  );
}
