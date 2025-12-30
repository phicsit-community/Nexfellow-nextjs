import React from 'react';
import styles from './Event.module.css';

const Tabs = ({ activeTab, setActiveTab }) => {
  return (
    <div role="tablist" className={styles.tabs}>
      <button
        role="tab"
        aria-selected={activeTab === 'upcoming'}
        onClick={() => setActiveTab('upcoming')}
        className={`${styles.tab} ${activeTab === 'upcoming' ? styles.activeTab : ''}`}
      >
        Upcoming
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 'past'}
        onClick={() => setActiveTab('past')}
        className={`${styles.tab} ${activeTab === 'past' ? styles.activeTab : ''}`}
      >
        Past
      </button>
    </div>
  );
};

export default Tabs;