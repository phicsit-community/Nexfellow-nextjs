import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
const Footerlink = () => {
  return (
    <div className={styles.listContainer}>
      <ul className={styles.list}>
        <Link to={"/terms"}>
          <li className={styles.listItem}>Terms of Services</li>
        </Link>
        <Link to={"/privacy"}>
          <li className={styles.listItem}>Privacy Policy</li>
        </Link>
        <Link
          to={"https://docs.nexfellow.com/overview"}
          rel="noopener noreferrer"
          target="_blank">
          <li className={styles.listItem}>NexFellow Guide</li>
        </Link>
        <Link to={"/blog"}>
          <li className={styles.listItem}>Blog</li>
        </Link>
        <Link
          to={"mailto:community@nexfellow.com"}
          rel="noopener noreferrer"
          target="_blank"
        >
          <li className={styles.listItem}>Ads Info</li>
        </Link>
        <Link to={"/help"}>
          <li className={styles.listItem}>Help</li>
        </Link>
      </ul>
    </div>
  );
};

export default Footerlink;
