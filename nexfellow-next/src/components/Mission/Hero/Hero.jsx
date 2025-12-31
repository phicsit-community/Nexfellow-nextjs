"use client";

import React, { useState, useEffect } from 'react';
import styles from './Hero.module.css';
import groupPhoto from './assets/group-photo.png';

const HeroSection = () => {
    return (
        <section className={styles.heroSection}>
            <div className={styles.content}>
                <p className={styles.subText}>We have one mission</p>
                <h1 className={styles.title}>
                    Bringing Geeks Together
                </h1>
                <div className={styles.imageContainer}>
                    <img
                        src={groupPhoto.src || groupPhoto}
                        alt="Diverse group of tech enthusiasts"
                        className={styles.heroImage}
                    />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
