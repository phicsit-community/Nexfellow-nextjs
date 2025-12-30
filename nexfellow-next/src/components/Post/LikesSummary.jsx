import React from "react";
import styles from "./LikesSummary.module.css";
import axios from "axios";
import LikesModal from "./LikesModal";

const SummaryContent = ({ likeCount, profiles, onClick }) => {
  const totalCount = likeCount;
  const visibleProfiles = profiles.slice(0, 3);
  const othersCount = totalCount > 1 ? totalCount - 1 : 0;

  return (
    <div className={styles.container} onClick={onClick}>
      <div className={styles.profileImages}>
        {visibleProfiles.map((profile, index) => (
          <div
            key={profile._id}
            className={styles.profileImageWrapper}
            style={{ zIndex: 3 - index }}
          >
            <img
              src={profile.picture}
              alt={profile.name}
              className={styles.profileImage}
            />
          </div>
        ))}
      </div>

      <div className={styles.text}>
        {totalCount === 0
          ? "No likes yet"
          : totalCount === 1
          ? `${profiles[0]?.name}`
          : `${profiles[0]?.name} and ${othersCount} ${
              othersCount === 1 ? "other" : "others"
            }`}
      </div>
    </div>
  );
};

const LikesSummary = ({ postId, isLiked }) => {
  const [likeCount, setLikeCount] = React.useState(0);
  const [likeProfiles, setLikeProfiles] = React.useState([]);
  const [showLikes, setShowLikes] = React.useState(false);

  React.useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await axios.get(`/like/posts/${postId}`);
        const resData = res.data.likes;
        const profiles = resData
          .map((like) => like.user)
          .filter((user) => user !== null && user !== undefined);

        setLikeProfiles(profiles);
        setLikeCount(resData.length);
      } catch (err) {
        console.error("Error fetching likes:", err);
      }
    };

    fetchLikes();

    // Only re-fetch when the component mounts or when postId/isLiked changes
    // Remove the polling interval to prevent continuous API calls
  }, [postId, isLiked]);

  return (
    <div>
      {showLikes && (
        <LikesModal
          profiles={likeProfiles}
          onClose={() => setShowLikes(false)}
        />
      )}
      <SummaryContent
        likeCount={likeCount}
        profiles={likeProfiles}
        onClick={() => setShowLikes(true)}
      />
    </div>
  );
};

export default LikesSummary;
