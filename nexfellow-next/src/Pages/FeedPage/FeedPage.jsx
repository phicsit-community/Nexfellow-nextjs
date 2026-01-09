import { useState } from "react";
import styles from "./FeedPage.module.css";
import Suggestions from "../../components/Suggestions/Suggestions";
import TrendingFeed from "./TrendingFeed";

const FeedPage = () => {
  const [activeTab, setActiveTab] = useState("trending");

  return (
    <div className={styles.homepage}>
      <div className={styles.feedColumn}>
        <div className={styles.tabsHeader}>
          <button
            className={`${styles.tabButton} ${activeTab === "newest" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("newest")}
          >
            Newest
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "trending" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("trending")}
          >
            Trending
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "following" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("following")}
          >
            Following
          </button>
        </div>
        <TrendingFeed type={activeTab} />
      </div>
      <div className={styles.suggestionsContainer}>
        <Suggestions />
      </div>
    </div>
  );
};

export default FeedPage;
