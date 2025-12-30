"use client";

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <svg className={styles.footerSvg} width="100%" height="100%" viewBox="0 0 1757 706" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className={styles.footerSvgPath} d="M1757 0L1436.36 13.5C1338.75 13.5 1345.22 -4.30889 1150 72C954.778 148.309 780.889 426.28 585.667 477.073C390.444 528.82 195.222 527.151 97.6111 502.589L0 477.073V706H97.6111C195.222 706 390.444 706 585.667 706C780.889 706 976.111 706 1171.33 706C1366.56 706 1561.78 706 1659.39 706H1757V0Z" />
            </svg>
            <div className={styles.container}>
                <div className={styles.tagline}>
                    <h1>
                        We love <span className={styles.highlightYellow}>Geeks</span> who{' '} <br />
                        <span className={styles.highlightPink}>dream</span> big and{' '} <br />
                        <span className={styles.highlightBlue}>build</span> bigger.
                    </h1>
                    <div className={styles.subscriptionContainer}>
                        <p>Subscribe for exclusive updates and community news!</p>
                        <div className={styles.subscription}>
                            <input type="email" placeholder="Email" className={styles.input} />
                            <button className={styles.subscribeButton}>Subscribe</button>
                        </div>
                    </div>
                </div>
                <div className={styles.links}>
                    <div>
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link href="/">Overview</Link></li>
                            <li><Link href="/features">Features</Link></li>
                            <li><Link href="/mission">Mission</Link></li>
                            <li><Link href="/blogs">Blogs</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Company</h4>
                        <ul>
                            <li><Link href="/contact">Contact Us</Link></li>
                            <li><Link href="/help">Help</Link></li>
                            <li><Link href="/terms">Terms &amp; Conditions</Link></li>
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className={styles.footerBottom}>
                <div className={styles.backgroundText}>NexFellow</div>
                <p>© {currentYear} NexFellow</p>
                <p>
                    <Link href="/terms">Terms and Conditions</Link> • <Link href="/privacy">Privacy Policy</Link>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
