import { useState } from "react";
import { useSelector } from "react-redux";
import styles from "./FeedPage.module.css";
import Suggestions from "../../components/Suggestions/Suggestions";
import SearchCommand from "../../components/SearchBar/search-command";
import ProfileDropdown from "../../components/ProfileDropdown/ProfileDropdown";
import TrendingFeed from "./TrendingFeed";
import PostDialog from "../../components/Dashboard/PostDialog";
import api from "../../lib/axios";
import { Image, Video, Package, Smile } from "lucide-react";
import fireIcon from "../../assets/Icons/fire.png";
import trendingIcon from "../../assets/Icons/trending.png";
import followingIcon from "../../assets/Icons/following.png";
import announcementIconStatic from "../../components/Header/animated/announcement.png";
import announcementAnimated from "../../components/Header/animated/announcement.gif";
import PlayOnce from "../../components/animatedIcon/PlayOnce";
import WhatsNewModal from "../../components/WhatsNew/WhatsNewModal";

const FeedPage = () => {
  const [activeTab, setActiveTab] = useState("newest");
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [isAnnouncementHovered, setIsAnnouncementHovered] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const user = useSelector((state) => state.auth.user);

  const toggleWhatsNew = () => setIsWhatsNewOpen((prev) => !prev);

  const handleCreatePostClick = () => {
    setIsPostDialogOpen(true);
  };

  const handlePostSubmit = async (postData) => {
    try {
      const formData = new FormData();
      formData.append("title", postData.title || "");
      formData.append("content", postData.content);
      if (postData.communityId && postData.communityId !== "general") {
        formData.append("community", postData.communityId);
      }
      formData.append("private", postData.private);

      if (postData.attachments && postData.attachments.length > 0) {
        postData.attachments.forEach((file) => {
          formData.append("files", file);
        });
      }

      if (postData.removeAttachments && postData.removeAttachments.length > 0) {
        formData.append(
          "removeAttachments",
          JSON.stringify(postData.removeAttachments)
        );
      }

      const response = await api.post("/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.shortenedUrls && response.data.shortenedUrls.length > 0) {
        const { toast } = await import("sonner");
        toast.info(
          `${response.data.shortenedUrls.length} URL${response.data.shortenedUrls.length > 1 ? "s" : ""} have been shortened for tracking`
        );
      }

      setFeedRefreshKey((k) => k + 1);
    } catch (err) {
      const { toast } = await import("sonner");
      toast.error("Failed to create post: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className={styles.homepage}>
      <div className={styles.feedColumn}>
        {/* Tabs at top */}
        <div className={styles.tabsHeader}>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => window.dispatchEvent(new CustomEvent("open-mobile-sidebar"))}
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6"  x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
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
        {(user?.verificationBadge || user?.isCommunityAccount) && (
          <div className={styles.createPostBox}>
            <div className={styles.inputRow} onClick={handleCreatePostClick}>
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
              <div className={styles.inputBox}>
                <input
                  type="text"
                  placeholder="What are you working on?"
                  className={styles.postInput}
                  readOnly
                />
              </div>
            </div>
            <div className={styles.postActions}>
              <button className={styles.actionBtn} onClick={handleCreatePostClick} title="Add Photo">
                <Image size={20} strokeWidth={1.5} />
              </button>
              <button className={styles.actionBtn} onClick={handleCreatePostClick} title="Video">
                <Video size={20} strokeWidth={1.5} />
              </button>
              <button className={styles.actionBtn} onClick={handleCreatePostClick} title="3D / Model">
                <Package size={20} strokeWidth={1.5} />
              </button>
              <button className={styles.actionBtn} onClick={handleCreatePostClick} title="Emoji">
                <Smile size={20} strokeWidth={1.5} />
              </button>
              <button className={styles.postBtn} onClick={handleCreatePostClick}>Post</button>
            </div>
          </div>
        )}

        <TrendingFeed key={feedRefreshKey} type={activeTab} />
      </div>
      <div className={styles.suggestionsColumn}>
        <div className={styles.searchHeader}>
          <SearchCommand />
          <ProfileDropdown />
        </div>
        <div className={styles.suggestionsContainer}>
          <Suggestions hideSearch />
        </div>
      </div>
      <PostDialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
        onSubmit={handlePostSubmit}
      />
    </div>
  );
};

export default FeedPage;
