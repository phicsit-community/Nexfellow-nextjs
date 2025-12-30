import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Community.module.css"; // Import CSS module for styling

// Components
import JoinedCommunity from "../../components/Community/JoinedCommunity";
import NoJoinedCommunity from "../../components/Community/NoJoinedCommunity";

const Community = () => {
  const [userCommunities, setUserCommunities] = useState([]);
  const [isUserJoined, setIsUserJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCommunities = async () => {
      try {
        setLoading(true);
        console.log("Fetching user profile...");
        const response = await axios.get("/user/profile");
        console.log("User profile:", response.data);
        const followedCommunityIds = response.data.followedCommunities;

        if (
          !Array.isArray(followedCommunityIds) ||
          followedCommunityIds.length === 0
        ) {
          console.log("No followed communities found.");
          setIsUserJoined(false);
          setLoading(false);
          return;
        }

        console.log("Followed Community IDs:", followedCommunityIds);

        const communityDataPromises = followedCommunityIds.map((communityId) =>
          axios.get(`/community/id/${communityId}`)
        );

        const communities = await Promise.all(
          communityDataPromises.map((promise) =>
            promise
              .then((res) => res.data)
              .catch((err) => {
                console.error("Error fetching community:", err);
                return null; // Return null for failed requests
              })
          )
        );

        const validCommunities = communities.filter(
          (community) => community !== null
        );
        setUserCommunities(validCommunities);
        setIsUserJoined(validCommunities.length > 0);
      } catch (error) {
        console.error("Error fetching communities:", error);
        setIsUserJoined(false);
      } finally {
        setLoading(false);
        console.log("Loading complete.");
      }
    };

    fetchUserCommunities();
  }, []);

  if (loading) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div>
      {isUserJoined ? (
        <JoinedCommunity communityData={userCommunities} />
      ) : (
        <NoJoinedCommunity />
      )}
    </div>
  );
};

export default Community;
