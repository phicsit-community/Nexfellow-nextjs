'use client';

import { FaFlag, FaTimes } from 'react-icons/fa';
import styles from './CheckoutDetails.module.css';

export function CheckoutDetailsClient() {
    const handleClose = () => {
        console.log('Close the page');
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.upper}>
                    <h2>Checkpoint Details</h2>
                    <div className={styles.closeIcon} onClick={handleClose}>
                        <FaTimes />
                    </div>
                </div>

                <div className={styles.lower}>
                    <div className={styles.leftSection}>
                        <form className={styles.form}>
                            <label htmlFor="title">Title</label>
                            <input type="text" id="title" placeholder="Enter title" />

                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                placeholder="Enter description"
                            ></textarea>

                            <div className={styles.buttonContainer}>
                                <button type="button" className={styles.cancelButton}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.saveButton}>
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className={styles.rightSection}>
                        <h3>10 Checkpoints</h3>
                        <div className={styles.checkpointList}>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className={styles.checkpoint}>
                                    <div className={styles.flagIcon}>
                                        <FaFlag />
                                    </div>
                                    <div className={styles.checkpointText}>
                                        <strong>DAY {index + 1}</strong>
                                        <br />
                                        DATE MONTH, TIME - TIME
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
