'use client';

import React from 'react';
import styles from './ChallengeForm.module.css';
import { MdOutlineClose } from 'react-icons/md';
import ImageUploader from '@/components/ui/ImageUploader/ImageUploader';

interface ChallengeFormProps {
  setIsCreateModalOpen: (open: boolean) => void;
}

const ChallengeForm: React.FC<ChallengeFormProps> = ({
  setIsCreateModalOpen,
}) => {
  return (
    <div>
      <div className={styles.mainContainer}>
        {/* main container */}
        <div className={styles.container}>
          <div className={styles.headersection}>
            <div className={styles.newChallenge}>New Challenge</div>

            <MdOutlineClose
              fontSize={30}
              className={styles.closeIcon}
              onClick={() => {
                setIsCreateModalOpen(false);
              }}
            />
          </div>

          <div>
            <form>
              <div className={styles.imageuploader}>
                <ImageUploader />
              </div>

              <div className={styles.challengeName}>
                <input
                  type="text"
                  placeholder="Name your challenge"
                  className={styles.input}
                />
              </div>
              <div className={styles.challengeDescripton}>
                <textarea
                  placeholder="Description of your challenge"
                  className={styles.textarea}
                  rows={5}
                />
              </div>

              <div className={styles.createbtn}>Create Challenge</div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeForm;
