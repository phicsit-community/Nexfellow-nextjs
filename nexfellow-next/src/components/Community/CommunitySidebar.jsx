"use client";

import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { useRouter } from "next/navigation";
import styles from "./Community.module.css";
import Event from "../../components/Contest/assets/image.png";
import DefaultImage from "../../Pages/Event/assets/default-event-image.png";
import SuggestionCard from "../Suggestions/SuggestionCard";
import Link from "next/link";
import { Button } from "../ui/button";
import EmptyStateBox from "../EmptyStateBox/EmptyStateBox";
import { BsStopwatch } from "react-icons/bs";
import { Timer, Users2 } from "lucide-react";

const UserCommunitySidebar = ({ communityId }) => {
  const router = useRouter();
  const [isShowMore, setIsShowMore] = useState(false);

  // const [topMembers, setTopMembers] = useState([]);
  const [events, setEvents] = useState([]);
  // const [activeChallenges, setActiveChallenges] = useState([]);
  const [contests, setContests] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get(`/event/community/${communityId}`);
        const now = new Date();

        const eventsData = (res.data || [])
          .filter((val) => new Date(val.startDate) >= now)
          .map((val) => {
            const date = new Date(val.startDate);
            const formattedDate = date.toLocaleString("en-US", {
              dateStyle: "long",
              timeStyle: "short",
            });

            return {
              name: val.title || "Untitled Event",
              date: formattedDate,
              image: val.imageUrl || Event?.src || Event,
              id: val._id || val.id,
              slug: val.slug || val.id,
            };
          });

        setEvents(eventsData);
      } catch (error) {
        // Handle 404 (no events) gracefully - just set empty array
        if (error.response?.status === 404) {
          setEvents([]);
        } else {
          console.error("Error fetching events:", error);
        }
      }
    };

    if (communityId) {
      fetchEvents();
    }
  }, [communityId]);

  function formatContestDuration(contest) {
    if (!contest) return "N/A";

    // If contest follows the "rapid" timer mode with questions array
    if (
      contest.timerMode === "rapid" &&
      Array.isArray(contest.questions) &&
      contest.questions.length > 0
    ) {
      const totalSeconds = contest.questions.reduce(
        (sum, q) => sum + (q.timeLimit || q.duration || 0),
        0
      );
      if (totalSeconds >= 60) {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return secs === 0 ? `${mins} min` : `${mins} min ${secs} sec`;
      } else {
        return `${totalSeconds} sec`;
      }
    }

    // If contest uses "full" timerMode and has a duration in minutes
    if (contest.timerMode === "full" && typeof contest.duration === "number") {
      if (contest.duration >= 60) {
        const hours = Math.floor(contest.duration / 60);
        const mins = contest.duration % 60;
        return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`;
      }
      return `${contest.duration} min`;
    }

    // Otherwise fallback to similar logic you have
    if (contest.duration) {
      const minutes = contest.duration;
      if (minutes >= 60) {
        const hours = Math.round((minutes / 60) * 10) / 10; // Round to 1 decimal place
        return hours % 1 === 0 ? `${hours} hour` : `${hours} hours`;
      } else {
        return `${minutes} minutes`;
      }
    }

    return "N/A";
  }

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await api.get(`/community/${communityId}/quizzes`);
        console.log(res.data);
        const contestsData = res.data.quizzes.map((val) => {
          return {
            name: val.title || "Untitled Contest",
            date: new Date(val.startTime).toLocaleString("en-US", {
              dateStyle: "long",
              timeStyle: "short",
            }),
            image: val.imageUrl || Event?.src || Event,
            id: val._id || val.id,
            slug: val.slug || val.id,
            duration: formatContestDuration(val),
            totalRegistered: val.totalRegistered || 0,
            timerMode: val.timerMode,
            questions: val.questions,
          };
        });
        setContests(contestsData);
      } catch (error) {
        console.error("Error fetching contests:", error);
      }
    };

    if (communityId) {
      fetchContests();
    }
  }, [communityId]);

  const [topMembers, setTopMembers] = useState([]);
  const [followStatusMap, setFollowStatusMap] = useState({});
  const [buttonLoadingMap, setButtonLoadingMap] = useState({});
  const [error, setError] = useState(null);

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;

  const [activeChallenges, setActiveChallenges] = useState([]);

  useEffect(() => {
    const fetchActiveChallenges = async () => {
      try {
        const res = await api.get(
          `/challenge/${communityId}/active-challenges`
        );
        const challenges = res.data.challenges || [];
        setActiveChallenges(challenges);
      } catch (error) {
        console.error("Error fetching active challenges:", error);
      }
    };

    if (communityId) {
      fetchActiveChallenges();
    }
  }, [communityId]);

  useEffect(() => {
    const fetchTopMembers = async () => {
      try {
        const res = await api.get(`/community/${communityId}/top-members`);
        const members = res.data.topMembers || [];
        setTopMembers(members);

        // Initialize follow status map for each member
        const followStatusMap = {};
        members.forEach((member) => {
          followStatusMap[member._id] = false; // Set all as unfollowed initially
        });
        setFollowStatusMap(followStatusMap);
      } catch (err) {
        console.error("Error fetching top members:", err);
      }
    };

    if (communityId) {
      fetchTopMembers();
    }
  }, [communityId]);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!user || !user.id) {
        setError("User ID missing");
        return;
      }

      try {
        const responses = await Promise.all(
          topMembers.map((member) =>
            api.get(`/user/followStatus/${member._id}`)
          )
        );

        const updatedFollowStatusMap = {};
        responses.forEach((response, index) => {
          const member = topMembers[index];
          updatedFollowStatusMap[member._id] = response.data.isFollowing;
        });

        setFollowStatusMap(updatedFollowStatusMap);
      } catch (err) {
        setError("Failed to fetch follow status.");
        console.error(err);
      }
    };

    if (topMembers.length > 0 && Object.keys(followStatusMap).length === 0) {
      fetchFollowStatus();
    }
  }, [topMembers, user]);

  // const toggleFollow = async (memberId) => {
  //   setButtonLoadingMap((prevState) => ({
  //     ...prevState,
  //     [memberId]: true, // Set loading state for this button
  //   }));

  //   try {
  //     const action = followStatusMap[memberId] ? "unfollow" : "follow";

  //     await api.post(`/user/toggleFollow/${memberId}`, { action });

  //     // Fetch updated follow status for this member
  //     const response = await api.get(`/user/followStatus/${memberId}`);
  //     setFollowStatusMap((prevStatusMap) => ({
  //       ...prevStatusMap,
  //       [memberId]: response.data.isFollowing,
  //     }));
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Error toggling follow status.");
  //     console.error(err);
  //   } finally {
  //     setButtonLoadingMap((prevState) => ({
  //       ...prevState,
  //       [memberId]: false, // Reset the button loading state after the action is complete
  //     }));
  //   }
  // };

  // const handleProfileRedirect = (memberUsername) => {
  //   if (user.isCommunityAccount && user.createdCommunity) {
  //     navigate(`/explore/${memberUsername}`);
  //   } else {
  //     navigate(`/user/${memberUsername}`);
  //   }
  // };

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

          {topMembers
            .slice(0, isShowMore ? topMembers.length : 3)
            .map((member) => (
              <SuggestionCard key={member._id} user={member} />
            ))}

          {topMembers.length > 3 && (
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
              <Link
                key={index}
                className={styles.event}
                href={`/community/events/${event.slug || event.id}`}
              >
                <img
                  src={event.image}
                  alt={event.name}
                  className={styles.eventImage}
                />
                <div>
                  <p className={styles.eventName}>{event.name}</p>
                  <p className={styles.eventDate}>{event.date}</p>
                </div>
              </Link>
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
              <Link
                key={index}
                className={styles.challenge}
                href={`/challenge/${challenge.slug || challenge._id}`}
              >
                <img
                  src={challenge.coverImage || challenge.image || (DefaultImage?.src || DefaultImage)}
                  alt={challenge.title || challenge.name}
                  className={styles.challengeImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DefaultImage?.src || DefaultImage;
                  }}
                />
                <div>
                  <p className={styles.challengeName}>{challenge.title || challenge.name}</p>
                  <p className={styles.challengeDate}>
                    {challenge.duration} day challenge
                  </p>
                  <p className={styles.challengeParticipants}>
                    <Users2 size={13} /> {challenge.participants?.length || 0}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {contests.length === 0 ? (
        <EmptyStateBox
          type="contests"
          title="Contests"
          description="No contests at the moment. Check back soon for new opportunities!"
        />
      ) : (
        <div className={styles.contests}>
          <h3 className={styles.sidebarTitle}>Contests</h3>
          <div className={styles.contestsList}>
            {contests.map((contest, index) => {
              console.log(contest);
              return (
                <Link
                  key={index}
                  className={styles.contest}
                  href={`/community/contests/${contest.slug || contest.id}`}
                >
                  <img
                    src={contest.image || (DefaultImage?.src || DefaultImage)}
                    alt={contest.name}
                    className={styles.contestImage}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DefaultImage?.src || DefaultImage;
                    }}
                  />
                  <div>
                    <p className={styles.contestName}>{contest.name}</p>
                    <p className={styles.contestDate}>{contest.date}</p>
                    <div className="flex gap-2">
                      <p className={styles.contestDuration}>
                        <Timer size={13} /> {contest.duration}
                      </p>
                      <p className={styles.contestParticipants}>
                        <Users2 size={13} /> {contest.totalRegistered}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default UserCommunitySidebar;
