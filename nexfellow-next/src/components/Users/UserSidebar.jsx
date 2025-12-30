import React, { useState } from "react";
import styles from "./User.module.css";
import CommunityBanner from "./assets/community_image.svg";
import ProfileImage from "./assets/profile_image.svg";
import Event from "../../Pages/Community/assets/event_image.png";
import EmptyStateBox from "../EmptyStateBox/EmptyStateBox";

const UserCommunitySidebar = () => {
  const [isShowMore, setIsShowMore] = useState(false);

  const topMembers = [
    // {
    //   name: "Name",
    //   username: "username",
    //   profileImage: ProfileImage,
    // },
    // {
    //   name: "Name",
    //   username: "username",
    //   profileImage: ProfileImage,
    // },
    // {
    //   name: "Name",
    //   username: "username",
    //   profileImage: ProfileImage,
    // },
    // {
    //   name: "Name",
    //   username: "username",
    //   profileImage: ProfileImage,
    // },
    // {
    //   name: "Name",
    //   username: "username",
    //   profileImage: ProfileImage,
    // },
    // {
    //   name: "Name",
    //   username: "username",
    //   profileImage: ProfileImage,
    // },
  ];

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
      {topMembers.length === 0 ? (
        <EmptyStateBox
          type="members"
          title="Top Members"
          description="No Top Members at the moment."
        />
      ) : (
        <div className={styles.topMembers}>
          <h3 className={styles.sidebarTitle}>Featured Members</h3>

          {topMembers.map((member, index) => {
            {
              if (!isShowMore && index > 2) return;
            }
            return (
              <div key={index} className={styles.member}>
                <div className={styles.memberDetails}>
                  <img
                    src={member.profileImage}
                    alt={`${member.name}`}
                    className={styles.memberImage}
                  />
                  <div>
                    <p className={styles.memberName}>{member.name}</p>
                    <p className={styles.memberUsername}>@{member.username}</p>
                  </div>
                </div>
                <button className={styles.sidebarFollowButton}>Follow</button>
              </div>
            );
          })}
          <a
            className={styles.showMore}
            onClick={() => setIsShowMore(!isShowMore)}
          >
            {isShowMore ? "Show Less" : "Show More"}
          </a>
        </div>
      )}

      {events.length === 0 ? (
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
      )}

      {activeChallenges.length === 0 ? (
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
      )}
    </div>
  );
};

export default UserCommunitySidebar;
