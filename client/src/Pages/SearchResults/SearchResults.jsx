import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Post from "../../components/Post/Post";
import SuggestionCard from "../../components/Suggestions/SuggestionCard";
import { ExploreCard } from "../Explore/Explore";
import axios from "axios";
import {
  FaLink,
  FaBellSlash,
  FaEyeSlash,
  FaExclamationCircle,
  FaUserPlus,
} from "react-icons/fa";
import styles from "./SearchResults.module.css";
import Suggestions from "../../components/Suggestions/Suggestions";
import EventCard from "../Event/SearchEventCard";
import ContestData from "../../components/contestdata/ContestData";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

function SearchResults() {
  const [results, setResults] = useState({
    users: [],
    posts: [],
    comments: [],
    communities: [],
    events: [],
    challenges: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  // Update filter and query when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get("type");
    const queryParam = params.get("q");

    setFilter(typeParam || "all");
    setQuery(queryParam || "");
  }, [location.search]);

  // State to track "Show More" for each section
  const [showMoreStates, setShowMoreStates] = useState({
    users: false,
    posts: false,
    communities: false,
    events: false,
    contests: false,
    challenges: false,
  });

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `/search?q=${encodeURIComponent(query)}`
        );
        setResults(response.data);
      } catch (err) {
        setError("Failed to fetch search results: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  const feedOptions = [
    {
      label: "Copy",
      icon: <FaLink className={styles.icon} />,
      action: (post) => {
        const postUrl = `${window.location.origin}/post/${post._id}`;
        navigator.clipboard.writeText(postUrl);
        toast.success("Post link copied to clipboard!");
      },
    },
    {
      label: "Mute",
      icon: <FaBellSlash className={styles.icon} />,
      action: (post) => {
        console.log("Muted notifications for post:", post._id);
      },
    },
    {
      label: "Hide",
      icon: <FaEyeSlash className={styles.icon} />,
      action: (post) => {
        console.log("Post hidden:", post._id);
      },
    },
    {
      label: "Report",
      icon: <FaExclamationCircle className={styles.icon} />,
      action: (post) => {
        console.log("Reported post:", post._id);
      },
    },
    {
      label: "Follow",
      icon: <FaUserPlus className={styles.icon} />,
      action: (post) => {
        console.log("Followed author of post:", post._id);
      },
    },
  ];

  // Helper function to determine if a section should be rendered
  const shouldRenderSection = (sectionType) => {
    return filter === "all" || filter === sectionType;
  };

  // Helper function to limit results based on "Show More" state
  const getVisibleResults = (sectionType) => {
    const sectionResults = results[sectionType];

    // If the specific filter is active, show all results for that section
    if (filter === sectionType) {
      return sectionResults;
    }

    // Otherwise, limit results to 3 initially unless "Show More" is toggled
    return showMoreStates[sectionType]
      ? sectionResults
      : sectionResults.slice(0, 4);
  };

  // Skeleton loading component
  const SearchResultsSkeleton = () => (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.skeletonHeaderContainer}>
          <div className={`${styles.skeleton} ${styles.skeletonHeader}`}></div>
        </div>

        <div className={styles.filterButtons}>
          {[
            "All",
            "Users",
            "Posts",
            "Communities",
            "Events",
            "Contests",
            "Challenges",
          ].map((filter, index) => (
            <div
              key={index}
              className={`${styles.skeleton} ${styles.skeletonFilter}`}
            ></div>
          ))}
        </div>

        {/* Users Section Skeleton */}
        <div className={styles.skeletonSection}>
          <div
            className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}
          ></div>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className={styles.skeletonUser}>
              <div
                className={`${styles.skeleton} ${styles.skeletonAvatar}`}
              ></div>
              <div className={styles.skeletonUserDetails}>
                <div
                  className={`${styles.skeleton} ${styles.skeletonUserName}`}
                ></div>
                <div
                  className={`${styles.skeleton} ${styles.skeletonUserBio}`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Posts Section Skeleton */}
        <div className={styles.skeletonSection}>
          <div
            className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}
          ></div>
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className={`${styles.skeleton} ${styles.skeletonPost}`}
            >
              <div className={styles.skeletonPostHeader}>
                <div
                  className={`${styles.skeleton} ${styles.skeletonAvatar}`}
                ></div>
                <div className={styles.skeletonUserDetails}>
                  <div
                    className={`${styles.skeleton} ${styles.skeletonUserName}`}
                  ></div>
                  <div
                    className={`${styles.skeleton} ${styles.skeletonUserBio}`}
                    style={{ width: "80px" }}
                  ></div>
                </div>
              </div>
              <div
                className={`${styles.skeleton} ${styles.skeletonPostContent}`}
              ></div>
              <div className={styles.skeletonPostActions}>
                <div
                  className={`${styles.skeleton} ${styles.skeletonAction}`}
                ></div>
                <div
                  className={`${styles.skeleton} ${styles.skeletonAction}`}
                ></div>
                <div
                  className={`${styles.skeleton} ${styles.skeletonAction}`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Communities Section Skeleton */}
        <div className={styles.skeletonSection}>
          <div
            className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}
          ></div>
          <div className={styles.skeletonCommunityGrid}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className={`${styles.skeleton} ${styles.skeletonCommunity}`}
              ></div>
            ))}
          </div>
        </div>

        {/* Events Section Skeleton */}
        <div className={styles.skeletonSection}>
          <div
            className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}
          ></div>
          <div className={styles.eventsList}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={styles.skeletonEvent}>
                <div
                  className={`${styles.skeleton} ${styles.skeletonEventImage}`}
                ></div>
                <div className={styles.skeletonEventDetails}>
                  <div
                    className={`${styles.skeleton} ${styles.skeletonEventName}`}
                  ></div>
                  <div
                    className={`${styles.skeleton} ${styles.skeletonEventDate}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestions Skeleton */}
      <div className={styles.suggestionsContainer}>
        <div style={{ width: "90%", padding: "20px" }}>
          <div
            className={`${styles.skeleton}`}
            style={{ height: "24px", width: "60%", marginBottom: "20px" }}
          ></div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} style={{ marginBottom: "15px" }}>
              <div className={styles.skeletonUser}>
                <div
                  className={`${styles.skeleton} ${styles.skeletonAvatar}`}
                ></div>
                <div className={styles.skeletonUserDetails}>
                  <div
                    className={`${styles.skeleton} ${styles.skeletonUserName}`}
                  ></div>
                  <div
                    className={`${styles.skeleton} ${styles.skeletonUserBio}`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) return <SearchResultsSkeleton />;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.main}>
      {/* Filter Buttons */}
      <div className={styles.container}>
        <p className={styles.header}>Search Results for &quot;{query}&quot;</p>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${
              filter === "all" ? styles.active : ""
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === "users" ? styles.active : ""
            }`}
            onClick={() => setFilter("users")}
          >
            Users
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === "posts" ? styles.active : ""
            }`}
            onClick={() => setFilter("posts")}
          >
            Posts
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === "communities" ? styles.active : ""
            }`}
            onClick={() => setFilter("communities")}
          >
            Communities
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === "events" ? styles.active : ""
            }`}
            onClick={() => setFilter("events")}
          >
            Events
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === "contests" ? styles.active : ""
            }`}
            onClick={() => setFilter("contests")}
          >
            Contests
          </button>
          <button
            className={`${styles.filterButton} ${
              filter === "challenges" ? styles.active : ""
            }`}
            onClick={() => setFilter("challenges")}
          >
            Challenges
          </button>
        </div>

        <div className={styles.resultContainer}>
          {/* Users Section */}
          {shouldRenderSection("users") && (
            <div className={styles.section}>
              <h2>Users</h2>
              <div className={styles.suggestion}>
                {getVisibleResults("users").map((user) => (
                  <SuggestionCard
                    key={user._id}
                    user={user}
                    className={styles.card}
                  />
                ))}
                {results.users.length === 0 && (
                  <p className={styles.noResults}>No users found.</p>
                )}
                {filter === "all" && results.users.length > 3 && (
                  <>
                    <Button
                      className={styles.showMoreButton}
                      onClick={() =>
                        setShowMoreStates((prev) => ({
                          ...prev,
                          users: !prev.users, // Toggle "Show More" state for users
                        }))
                      }
                    >
                      {showMoreStates.users ? "Hide More" : "Show More"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
          {/* Posts Section */}
          {shouldRenderSection("posts") && (
            <div className={`${styles.section}`}>
              <h2>Posts</h2>
              <div style={{ position: "relative" }}>
                {getVisibleResults("posts").map((post) => (
                  <Post
                    key={post._id}
                    post={post}
                    options={feedOptions.map((option) => ({
                      label: option.label,
                      icon: option.icon,
                      action: () => option.action(post),
                    }))}
                  />
                ))}
                {!showMoreStates.posts &&
                  filter === "all" &&
                  results.posts.length > 3 && (
                    <div className={styles.overlayGradient} />
                  )}
              </div>
              {results.posts.length === 0 && (
                <p className={styles.noResults}>No posts found.</p>
              )}
              {filter === "all" && results.posts.length > 3 && (
                <>
                  <Button
                    className={styles.showMoreButton}
                    onClick={() =>
                      setShowMoreStates((prev) => ({
                        ...prev,
                        posts: !prev.posts, // Toggle "Show More" state for posts
                      }))
                    }
                  >
                    {showMoreStates.posts ? "Hide More" : "Show More"}
                  </Button>
                </>
              )}
            </div>
          )}
          {/* Communities Section */}
          {shouldRenderSection("communities") && (
            <div className={styles.section}>
              <h2>Communities</h2>
              <div className={styles.communityGrid}>
                {getVisibleResults("communities").map((community) => (
                  <ExploreCard
                    key={community._id?.$oid || community._id}
                    community={community}
                  />
                ))}
              </div>
              {results.communities.length === 0 && <p>No communities found.</p>}
              {filter === "all" && results.communities.length > 4 && (
                <>
                  <Button
                    className={styles.showMoreButton}
                    onClick={() =>
                      setShowMoreStates((prev) => ({
                        ...prev,
                        communities: !prev.communities, // Toggle "Show More" state for communities
                      }))
                    }
                  >
                    {showMoreStates.communities ? "Hide More" : "Show More"}
                  </Button>
                </>
              )}
            </div>
          )}
          {/* Events Section */}
          {shouldRenderSection("events") && (
            <div className={styles.section}>
              <h2>Events</h2>
              <div className={styles.eventsList}>
                {getVisibleResults("events").map((event, index) => (
                  <EventCard event={event} key={index} />
                ))}
              </div>
              {results.events.length === 0 && (
                <p className={styles.noResults}>No events found.</p>
              )}
              {filter === "all" && results.events.length > 3 && (
                <>
                  <Button
                    className={styles.showMoreButton}
                    onClick={() =>
                      setShowMoreStates((prev) => ({
                        ...prev,
                        events: !prev.events, // Toggle "Show More" state for events
                      }))
                    }
                  >
                    {showMoreStates.events ? "Hide More" : "Show More"}
                  </Button>
                </>
              )}
            </div>
          )}
          {/* Contests Section */}
          {shouldRenderSection("contests") && (
            <div className={styles.section}>
              <h2>Contests</h2>
              <div className={styles.cardContainer}>
                {getVisibleResults("contests").map((contest) => (
                  <ContestData key={contest.id} contest={contest} />
                ))}
              </div>
              {results.contests.length === 0 && (
                <p className={styles.noResults}>No contests found.</p>
              )}
              {filter === "all" && results.contests.length > 3 && (
                <>
                  <Button
                    className={styles.showMoreButton}
                    onClick={() =>
                      setShowMoreStates((prev) => ({
                        ...prev,
                        contests: !prev.contests, // Toggle "Show More" state for contests
                      }))
                    }
                  >
                    {showMoreStates.contests ? "Hide More" : "Show More"}
                  </Button>
                </>
              )}
            </div>
          )}
          {/* Challenges Section */}
          {shouldRenderSection("challenges") && (
            <div className={styles.section}>
              <h2>Challenges</h2>
              {getVisibleResults("challenges").map((challenge) => (
                <div key={challenge._id} className={styles.card}>
                  <p>Title: {challenge.title}</p>
                  <p>Description: {challenge.description}</p>
                </div>
              ))}
              {results.challenges.length === 0 && (
                <p className={styles.noResults}>No challenges found.</p>
              )}
              {filter === "all" && results.challenges.length > 3 && (
                <>
                  <Button
                    className={styles.showMoreButton}
                    onClick={() =>
                      setShowMoreStates((prev) => ({
                        ...prev,
                        challenges: !prev.challenges, // Toggle "Show More" state for challenges
                      }))
                    }
                  >
                    {showMoreStates.challenges ? "Hide More" : "Show More"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={styles.suggestionsContainer}>
        <Suggestions />
      </div>
    </div>
  );
}

export default SearchResults;
