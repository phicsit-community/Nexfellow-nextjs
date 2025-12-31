"use client";

import Link from "next/link";
import styles from "./Footer.module.css";

const Footerlink = () => {
  return (
    <div className={styles.listContainer}>
      <ul className={styles.list}>
        <Link href={"/terms"}>
          <li className={styles.listItem}>Terms of Services</li>
        </Link>
        <Link href={"/privacy"}>
          <li className={styles.listItem}>Privacy Policy</li>
        </Link>
        <Link href={"/blog"}>
          <li className={styles.listItem}>Blog</li>
        </Link>
        <Link
          href={"https://docs.nexfellow.com/overview"}
          rel="noopener noreferrer"
          target="_blank">
          <li className={styles.listItem}>Docs</li>
        </Link>
        <Link
          href={"mailto:community@nexfellow.com"}
          rel="noopener noreferrer"
          target="_blank"
        >
          <li className={styles.listItem}>Ads Info</li>
        </Link>
        <Link href={"/help"}>
          <li className={styles.listItem}>Help</li>
        </Link>
      </ul>
    </div>
  );
};

export default Footerlink;
