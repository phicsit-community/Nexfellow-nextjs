import { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import styles from "./FeedPage.module.css";
import Suggestions from "../../components/Suggestions/Suggestions";
import TrendingFeed from "./TrendingFeed";
import { MdPhotoLibrary, MdInsertLink, MdOutlineDescription } from "react-icons/md";
import { BiPoll } from "react-icons/bi";
import fireIcon from "../../assets/Icons/fire.png";
import trendingIcon from "../../assets/Icons/trending.png";
import followingIcon from "../../assets/Icons/following.png";
import announcementIconStatic from "../../components/Header/animated/announcement.png";
import announcementAnimated from "../../components/Header/animated/announcement.gif";
import PlayOnce from "../../components/animatedIcon/PlayOnce";
import WhatsNewModal from "../../components/WhatsNew/WhatsNewModal";

const FeedPage = () => {
  const [activeTab, setActiveTab] = useState("trending");
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [isAnnouncementHovered, setIsAnnouncementHovered] = useState(false);
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  const toggleWhatsNew = () => setIsWhatsNewOpen((prev) => !prev);

  const handleCreatePostClick = () => {
    // Navigate to user's dashboard with query param to open post dialog
    if (user?.username) {
      router.push(`/dashboard/${user.username}?createPost=true`);
    }
  };

  return (
    <div className={styles.homepage}>
      <div className={styles.feedColumn}>
        {/* Tabs at top */}
        <div className={styles.tabsHeader}>
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tabButton} ${activeTab === "newest" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("newest")}
            >
              <img src={fireIcon.src || fireIcon} alt="Newest" width={18} height={18} className={styles.tabIcon} />
              Newest
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "trending" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("trending")}
            >
              <img src={trendingIcon.src || trendingIcon} alt="Trending" width={18} height={18} className={styles.tabIcon} />
              Trending
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "following" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("following")}
            >
              <img src={followingIcon.src || followingIcon} alt="Following" width={18} height={18} className={styles.tabIcon} />
              Following
            </button>
          </div>
          <div
            className={styles.announcementBtn}
            onClick={toggleWhatsNew}
            onMouseEnter={() => setIsAnnouncementHovered(true)}
            onMouseLeave={() => setIsAnnouncementHovered(false)}
            title="What's New"
          >
            <PlayOnce
              icon={announcementAnimated.src || announcementAnimated}
              play={isAnnouncementHovered}
              size={25}
              style={{ width: 25, height: 25 }}
              staticIcon={announcementIconStatic.src || announcementIconStatic}
            />
          </div>
          {isWhatsNewOpen && <WhatsNewModal closeModal={toggleWhatsNew} />}
        </div>

        {/* Create Post Box - Only show for verified users */}
        {user?.verified && (
          <div className={styles.createPostBox}>
            <div className={styles.inputBox} onClick={handleCreatePostClick}>
              <div className={styles.avatarWrapper}>
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt="User Avatar"
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder="What are you working on?"
                className={styles.postInput}
                readOnly
              />
            </div>
            <div className={styles.postActions}>
              <button className={styles.actionBtn} onClick={handleCreatePostClick} title="Add Photo">
                <MdPhotoLibrary />
              </button>
              <button className={`${styles.actionBtn} ${styles.disabledBtn}`} disabled title="Polls coming soon">
                <BiPoll />
              </button>
              <button className={`${styles.actionBtn} ${styles.disabledBtn}`} disabled title="Links coming soon">
                <MdInsertLink />
              </button>
              <button className={`${styles.actionBtn} ${styles.disabledBtn}`} disabled title="Documents coming soon">
                <MdOutlineDescription />
              </button>
              <button className={styles.postBtn} onClick={handleCreatePostClick}>Post</button>
            </div>
          </div>
        )}

        <TrendingFeed type={activeTab} />
      </div>
      <div className={styles.suggestionsContainer}>
        <Suggestions />
      </div>
    </div>
  );
};

export default FeedPage;
