import styles from "./FeedPage.module.css";
import Suggestions from "../../components/Suggestions/Suggestions";
import TrendingFeed from "./TrendingFeed";

const FeedPage = () => {
  return (
    <div className={styles.homepage}>
      <TrendingFeed />
      <div className={styles.suggestionsContainer}>
        <Suggestions />
      </div>
    </div>
  );
};

export default FeedPage;
