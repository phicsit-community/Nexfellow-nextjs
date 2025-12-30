import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import styles from "./Community.module.css";
import Event from "../../Pages/Community/assets/event_image.png";
import SuggestionCard from "../Suggestions/SuggestionCard";
import SidebarItemSkeleton from "./SidebarItemSkeleton";
import { Button } from "../ui/button";
import EmptyStateBox from "../EmptyStateBox/EmptyStateBox";
import Analytics from "../Moderators/ModeratorsAnalytics";

const JoinedCommunitySidebar = () => {
  const [isShowMore, setIsShowMore] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const communityId = useSelector((state) => state.auth?.user?.owner);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const userId = userData?.id || userData?._id;

        if (!userId) {
          console.error("User ID is missing from local storage.");
          setError("User ID is required.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`/suggestions/?userId=${userId}`);
        setSuggestions(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setError("Failed to load suggestions.");
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const events = [
    // {
    //   name: "Event Name",
    //   date: "May 25 - 7:30 PM",
    //   image: Event,
    // },
    // {
    //   name: "Event Name",
    //   date: "May 25 - 7:30 PM",
    //   image: Event,
    // },
    // {
    //   name: "Event Name",
    //   date: "May 25 - 7:30 PM",
    //   image: Event,
    // },
    // {
    //   name: "Event Name",
    //   date: "May 25 - 7:30 PM",
    //   image: Event,
    // },
  ];

  const activeChallenges = [
    // {
    //   name: "Challenges Name",
    //   date: "May 25 - 7:30 PM",
    //   image: Event,
    // },
    // {
    //   name: "Challenges Name",
    //   date: "May 25 - 7:30 PM",
    //   image: Event,
    // },
    // {
    //   name: "Challenges Name",
    //   date: "May 25 - 7:30 PM",
    //   image: Event,
    // },
    // {
    //   name: "Challenges Name",
    //   date: "May 25 - 7:30 PM",
    //   image: Event,
    // },
  ];

  return (
    <div className={styles.sidebar}>
      {!loading && !error && suggestions.length === 0 ? (
        <EmptyStateBox
          type="members"
          title="Featured Communities"
          description="No Featured Communities at the moment."
        />
      ) : (
        <div className={styles.topMembers}>
          <h3 className={styles.sidebarTitle}>Featured Communities</h3>

          {loading ? (
            <SidebarItemSkeleton count={3} />
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : (
            suggestions
              .slice(0, isShowMore ? suggestions.length : 3)
              .map((user) => (
                <SuggestionCard key={user._id} user={user} />
              ))
          )}

          {!loading && !error && suggestions.length > 3 && (
            <Button
              className={styles.showMore}
              onClick={() => setIsShowMore(!isShowMore)}
              variant="outline"
            >
              {isShowMore ? "Show Less" : "Show More"}
            </Button>
          )}
        </div>
      )}

      {communityId ? (
        <div className={styles.analytics} style={{ width: "80%", borderRadius: "0px", }}>
          {/* <h3 className={styles.sidebarTitle}>Analytics</h3> */}
          <Analytics communityId={communityId} />
        </div>
      ) : (
        <EmptyStateBox
          type="analytics"
          title="Analytics"
          description="No community selected. Analytics not available."
        />
      )}

      {/* Ongoing Events */}
      {/* {events.length === 0 ? (
        <EmptyStateBox
          type="events"
          title="Ongoing Events"
          description="No ongoing events at the moment. Stay tuned for upcoming updates!"
        />
      ) : (
        <div className={styles.ongoingEvents}>
          <h3 className={styles.sidebarTitle}>Ongoing Events</h3>
          <div className={styles.eventsList}>
            {events.map((event, index) => (
              <div key={index} className={styles.event}>
                <img
                  src={event.image}
                  alt={event.name}
                  className={styles.eventImage}
                />
                <div>
                  <p className={styles.eventName}>{event.name}</p>
                  <p className={styles.eventDate}>{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Active Challenges */}
      {/* {activeChallenges.length === 0 ? (
        <EmptyStateBox
          type="challenges"
          title="Active Challenges"
          description="No active challenges at the moment. Check back soon for new opportunities!"
        />
      ) : (
        <div className={styles.activeChallenges}>
          <h3 className={styles.sidebarTitle}>Active Challenges</h3>
          <div className={styles.challengesList}>
            {activeChallenges.map((challenge, index) => (
              <div key={index} className={styles.challenge}>
                <img
                  src={challenge.image}
                  alt={challenge.name}
                  className={styles.challengeImage}
                />
                <div>
                  <p className={styles.challengeName}>{challenge.name}</p>
                  <p className={styles.challengeDate}>{challenge.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default JoinedCommunitySidebar;
