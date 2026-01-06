import React from 'react';
import styles from './Event.module.css';
import eventImage from './assets/EventImage.png';

const EmptyState = ({ onCreateEvent }) => {
  return (
    <div className={styles.emptyState}>
      <img src={eventImage?.src || eventImage} alt="No Events" />
      <h3 className={styles.emptyTitle}>Create unforgettable experiences with live events!</h3>
      <p className={styles.emptyDescription}>
        Connect and expand your audience through weekly meetups or webinars featuring guest speakers.
      </p>
      <button className={styles.createButton} onClick={onCreateEvent}>
        Create
      </button>
    </div>
  );
};

export default EmptyState;