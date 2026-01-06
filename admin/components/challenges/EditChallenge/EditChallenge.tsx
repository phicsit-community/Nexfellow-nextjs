'use client';

import React from 'react';
import { MdOutlineClose } from 'react-icons/md';
import Image from 'next/image';
import styles from './EditChallenge.module.css';

interface EditChallengeProps {
  setIsEditChallengeOpen: (open: boolean) => void;
}

const EditChallenge: React.FC<EditChallengeProps> = ({
  setIsEditChallengeOpen,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.headerText}>Set up schedule & checkpoints</p>
        <MdOutlineClose
          fontSize={30}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setIsEditChallengeOpen(false);
          }}
        />
      </div>
      <hr className={styles.hr} />
      <div className={styles.form}>
        <p>Start</p>
        <div className={styles.inputt}>
          <input className={styles.inputDateTime} type="date" />
          <input className={styles.inputDateTime} type="time" />
        </div>
        <p>End</p>
        <div className={styles.inputt}>
          <input className={styles.inputDateTime} type="date" />
          <input className={styles.inputDateTime} type="time" />
        </div>
        <div className={styles.scheduleImage}>
          {/* Add schedule illustration here */}
        </div>
      </div>
      <hr className={styles.hr} />
      <div className={styles.foot}>
        <div className={styles.footHead}>
          <p>Step-by-Step unlocking</p>
          <label className={styles.switch}>
            <input type="checkbox" />
            <span className={styles.slider}></span>
          </label>
        </div>
        <p className={styles.footContent}>
          Participants must complete each checkpoint in order to move on to the
          next checkpoints
        </p>
        <div className={styles.checkpointImage}>
          {/* Add checkpoint illustration here */}
        </div>
        <button className={styles.updateCheckpoint}>Update Checkpoints</button>
      </div>
    </div>
  );
};

export default EditChallenge;
