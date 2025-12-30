import React from "react";
import styles from "./Community.module.css";
import Skeleton from "../ui/Skeleton/Skeleton";

const CommunitySidebarSkeleton = () => {
  return (
    <div className={styles.sidebar} style={{ marginLeft: "20px" }}>
      {/* Featured Members Section Skeleton */}
      <div className={styles.topMembers}>
        <h3 className={styles.sidebarTitle}>Featured Members</h3>
        {[1, 2, 3].map((item) => (
          <div key={item} className={styles.member}>
            <div className={styles.memberDetails}>
              <Skeleton
                type="memberAvatar"
                style={{ width: "36px", height: "36px", borderRadius: "50%" }}
              />
              <div>
                <Skeleton
                  type="memberName"
                  style={{ width: "80px", height: "14px" }}
                />
                <Skeleton
                  type="memberUsername"
                  style={{ width: "60px", height: "12px" }}
                />
              </div>
            </div>
            <Skeleton
              type="memberButton"
              style={{ width: "60px", height: "28px", borderRadius: "6px" }}
            />
          </div>
        ))}
        <span className={styles.showMore}>Show More</span>
      </div>

      {/* Ongoing Events Section Skeleton */}
      <div className={styles.ongoingEvents}>
        <h3 className={styles.sidebarTitle}>Ongoing Events</h3>
        <div className={styles.eventsList}>
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className={styles.event}>
              <Skeleton
                type="eventImage"
                style={{ width: "25%", height: "32px", borderRadius: "3px" }}
              />
              <div>
                <Skeleton
                  type="eventName"
                  style={{ width: "80px", height: "14px", marginBottom: "5px" }}
                />
                <Skeleton
                  type="eventDate"
                  style={{ width: "60px", height: "10px" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Challenges Section Skeleton */}
      <div className={styles.activeChallenges}>
        <h3 className={styles.sidebarTitle}>Active Challenges</h3>
        <div className={styles.challengesList}>
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className={styles.challenge}>
              <Skeleton
                type="challengeImage"
                style={{ width: "25%", height: "32px", borderRadius: "3px" }}
              />
              <div>
                <Skeleton
                  type="challengeName"
                  style={{ width: "80px", height: "14px", marginBottom: "5px" }}
                />
                <Skeleton
                  type="challengeDate"
                  style={{ width: "60px", height: "10px" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunitySidebarSkeleton;
