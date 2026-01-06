"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "../../lib/axios";
import { toast } from "sonner";

// Components
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
import DropDown from "../../components/Dropdown/DropDown";
import BackButton from "../../components/BackButton/BackButton";

// Assets
import { IoIosSearch } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import {
  Calendar,
  Clock,
  Users,
  Target,
  Trophy as TrophyIcon,
  Trash2,
  Eye,
} from "lucide-react";
import no_contests from "./assets/no_contests.png";

// CSS
import styles from "./Contests.module.css";
import { Trophy } from "lucide-react";

// Enhanced Skeleton Card component with shimmer effect
const SkeletonQuizCard = ({ count = 3 }) => {
  return (
    <>
      {Array(count)
        .fill()
        .map((_, index) => (
          <div
            className={styles.quiz}
            key={`skeleton-${index}`}
            style={{
              backgroundColor: "var(--background-card)",
              border: "1px solid var(--border-color)",
              pointerEvents: "none", // Disable all hover interactions
            }}
          >
            {/* Header skeleton */}
            <div className={styles.quizHeader}>
              <div className={styles.quizDateSection}>
                <div
                  className={`${styles.shimmer}`}
                  style={{
                    width: "80px",
                    height: "16px",
                    marginBottom: "4px",
                    borderRadius: "4px",
                  }}
                ></div>
                <div
                  className={`${styles.shimmer}`}
                  style={{
                    width: "100px",
                    height: "20px",
                    borderRadius: "4px",
                  }}
                ></div>
              </div>
              <div className={styles.quizDurationSection}>
                <div
                  className={`${styles.shimmer}`}
                  style={{
                    width: "60px",
                    height: "16px",
                    marginBottom: "4px",
                    borderRadius: "4px",
                  }}
                ></div>
                <div
                  className={`${styles.shimmer}`}
                  style={{ width: "70px", height: "20px", borderRadius: "4px" }}
                ></div>
              </div>
            </div>

            {/* Stats skeleton */}
            <div className={styles.quizStats}>
              <div className={styles.quizStatItem}>
                <div
                  className={`${styles.shimmer}`}
                  style={{
                    width: "80px",
                    height: "16px",
                    marginBottom: "4px",
                    borderRadius: "4px",
                  }}
                ></div>
                <div
                  className={`${styles.shimmer}`}
                  style={{ width: "40px", height: "20px", borderRadius: "4px" }}
                ></div>
              </div>
              <div className={styles.quizStatItem}>
                <div
                  className={`${styles.shimmer}`}
                  style={{
                    width: "70px",
                    height: "16px",
                    marginBottom: "4px",
                    borderRadius: "4px",
                  }}
                ></div>
                <div
                  className={`${styles.shimmer}`}
                  style={{ width: "30px", height: "20px", borderRadius: "4px" }}
                ></div>
              </div>
            </div>

            {/* Prize section skeleton */}
            <div className={styles.quizPrizeSection}>
              <div
                className={`${styles.shimmer}`}
                style={{ width: "120px", height: "18px", borderRadius: "4px" }}
              ></div>
              <div
                className={`${styles.shimmer}`}
                style={{ width: "60px", height: "20px", borderRadius: "12px" }}
              ></div>
            </div>

            {/* Action buttons skeleton */}
            <div className={styles.quizActions}>
              <div
                className={`${styles.deleteBtn} ${styles.shimmer}`}
                style={{ width: "100%", height: "44px", borderRadius: "8px" }}
              ></div>
              <div
                className={`${styles.viewBtn} ${styles.shimmer}`}
                style={{
                  width: "100%",
                  height: "44px",
                  borderColor: "transparent",
                  borderRadius: "8px",
                }}
              ></div>
            </div>
          </div>
        ))}
    </>
  );
};

const CommunityContests = () => {
  const router = useRouter();
  const params = useParams();
  const communityId = params?.communityId;

  // Refs
  const dropdownContainerRef = useRef(null);

  // States
  const [loading, setLoading] = useState(false);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [showConfirmation, setShowConfirmationModel] = useState(false);

  const [filters, setFilters] = useState({
    category: "All",
    status: "All",
    month: "All",
    year: "All",
    searchQuery: "",
  });

  const [dropdowns, setDropdowns] = useState({
    categoryOpen: false,
    statusOpen: false,
    monthOpen: false,
    yearOpen: false,
  });

  // We're using userQuizzes and filteredQuizzes instead
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  // Generate dynamic month and year options
  const generateMonthOptions = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return ["All", ...months];
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Include current year and previous 2 years
    for (let i = 0; i >= -2; i--) {
      years.push((currentYear + i).toString());
    }
    return ["All", ...years];
  };

  const options = {
    status: ["All", "Upcoming", "Live", "Ended"],
    month: generateMonthOptions(),
    year: generateYearOptions(),
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/community/${communityId}/quizzes`);
      setUserQuizzes(response.data.quizzes || []);
      setFilteredQuizzes(response.data.quizzes || []);
      setTimeout(() => setLoading(false), 800); // Simulated loading delay for skeleton effect
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Failed to fetch quizzes!");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (communityId) fetchQuizzes();
  }, [communityId]);

  useEffect(() => {
    let filtered = userQuizzes;

    // Filtering logic
    if (filters.category !== "All") {
      filtered = filtered.filter((quiz) => quiz.category === filters.category);
    }

    if (filters.status !== "All") {
      filtered = filtered.filter((quiz) => {
        const now = new Date().toISOString();
        return (
          (filters.status === "Upcoming" && quiz.startTime > now) ||
          (filters.status === "Live" &&
            quiz.startTime < now &&
            quiz.endTime > now) ||
          (filters.status === "Ended" && quiz.endTime < now)
        );
      });
    }

    if (filters.month !== "All") {
      filtered = filtered.filter(
        (quiz) =>
          new Date(quiz.startTime).toLocaleString("default", {
            month: "long",
          }) === filters.month
      );
    }

    if (filters.year !== "All") {
      filtered = filtered.filter(
        (quiz) =>
          new Date(quiz.startTime).getFullYear().toString() === filters.year
      );
    }

    if (filters.searchQuery) {
      filtered = filtered.filter((quiz) =>
        quiz.title.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    setFilteredQuizzes(filtered);
  }, [userQuizzes, filters]);

  // Handlers
  const toggleDropdown = (type) => {
    setDropdowns((prev) => {
      // Close other dropdowns when opening a new one
      const updatedDropdowns = Object.keys(prev).reduce((acc, key) => {
        acc[key] = key === type ? !prev[key] : false;
        return acc;
      }, {});
      return updatedDropdowns;
    });
  };

  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));

    // Close dropdown after selecting an option
    setDropdowns((prev) => ({ ...prev, [`${type}Open`]: false }));
  };

  const handleSearchQuery = (e) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleDeleteSuccess = async () => {
    try {
      await api.delete(`/community/quizzes/${selectedQuizId}`);
      // Don't need to update quizzes state separately since we'll fetch fresh data
      setShowConfirmationModel(false);
      toast.success("Quiz deleted successfully!");
      fetchQuizzes(); // This will update both userQuizzes and filteredQuizzes
    } catch (error) {
      toast.error("Failed to delete quiz. Please try again.");
      setShowConfirmationModel(false);
    }
  };

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only handle dropdown closing and nothing else
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target)
      ) {
        // Check if any dropdown is actually open before setting state
        const anyDropdownOpen = Object.values(dropdowns).some(
          (isOpen) => isOpen
        );

        if (anyDropdownOpen) {
          setDropdowns({
            categoryOpen: false,
            statusOpen: false,
            monthOpen: false,
            yearOpen: false,
          });
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdowns]);

  function formatQuizDuration(quiz) {
    if (!quiz) return "N/A";
    // Rapid mode: sum all questions' timeLimit (or duration) in seconds
    if (
      quiz.timerMode === "rapid" &&
      Array.isArray(quiz.questions) &&
      quiz.questions.length > 0
    ) {
      const totalSeconds = quiz.questions.reduce(
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
    // Full mode: quiz.duration is in minutes
    if (quiz.timerMode === "full" && typeof quiz.duration === "number") {
      if (quiz.duration >= 60) {
        const hours = Math.floor(quiz.duration / 60);
        const mins = quiz.duration % 60;
        return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`;
      }
      return `${quiz.duration} min`;
    }
    // Fallback
    return "N/A";
  }

  return (
    <div className={styles.main}>
      <div
        className="border rounded-lg hover:bg-accent text-sm w-fit"
        style={{ padding: "3px 10px" }}
      >
        <BackButton
          onClick={() => router.back()}
          showText={true}
          smallText={true}
        />
      </div>
      {/* Header */}
      <div className={styles.homeHeader}>
        <div>
          <div className={styles.title}>
            <Trophy className="inline text-[#24b2b4]" /> Contest Management
          </div>
          <p className="text-[#64748B] text-sm" style={{ fontWeight: 400 }}>
            Create, manage, and monitor your contests
          </p>
        </div>
        <div>
          <button
            className={styles.contestBtn}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/create-contest/${communityId}`);
            }}
            style={{
              textWrap: "nowrap",
            }}
          >
            <FaPlus /> Create Contest
          </button>
        </div>
      </div>

      {/* Search bar and filters */}
      <div className={styles.searchBarAndFilter} ref={dropdownContainerRef}>
        <div className={styles.searchContainer}>
          <IoIosSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search Contest"
            className={styles.searchInput}
            value={filters.searchQuery}
            onChange={handleSearchQuery}
          />
        </div>

        <div className={styles.filterContainer}>
          {Object.keys(options).map((filterType) => (
            <DropDown
              key={filterType}
              dropDownType={
                filterType.charAt(0).toUpperCase() + filterType.slice(1)
              }
              openClose={dropdowns[`${filterType}Open`]}
              options={options[filterType]}
              selectedOptions={filters[filterType]}
              handleClick={(value) => handleFilterChange(filterType, value)}
              toggleDropdown={() => toggleDropdown(`${filterType}Open`)}
              width="100%"
              dropdownMenuWidth="115px"
            />
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.allQuizes}>
          <SkeletonQuizCard count={6} />
        </div>
      ) : filteredQuizzes.length > 0 ? (
        <div className={styles.allQuizes}>
          {filteredQuizzes.map((quiz) => {
            const startDate = new Date(quiz.startTime);
            const duration = formatQuizDuration(quiz);
            return (
              <div key={quiz._id} className={styles.quiz}>
                {/* Title and Description */}
                <div className={styles.quizContent}>
                  <div className={styles.quizTitle}>{quiz.title}</div>
                  <div className={styles.quizDescription}>
                    {quiz.description}
                  </div>
                </div>

                {/* Header with date and duration */}
                <div className={styles.quizStats}>
                  <div className={styles.quizStatItem}>
                    <div className={styles.quizDateLabel}>
                      <Calendar size={16} />
                      Start Date
                    </div>
                    <div className={styles.quizDate}>
                      {startDate.toLocaleDateString()}
                    </div>
                  </div>

                  <div className={styles.quizStatItem}>
                    <div className={`${styles.quizStatLabel}  text-yellow-500`}>
                      <Clock size={16} />
                      Duration
                    </div>
                    <div className={styles.quizDuration}>{duration}</div>
                  </div>

                  <div className={styles.quizStatItem}>
                    <div
                      className={`${styles.quizStatLabel} ${styles.participants}`}
                    >
                      <Users size={16} />
                      Participants
                    </div>
                    <div className={styles.quizStatValue}>
                      {quiz.totalRegistered || 0}
                    </div>
                  </div>
                  <div className={styles.quizStatItem}>
                    <div
                      className={`${styles.quizStatLabel} ${styles.questions}`}
                    >
                      <Target size={16} />
                      Questions
                    </div>
                    <div className={styles.quizStatValue}>
                      {quiz.questions?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Prize and difficulty section */}
                {/* <div className={styles.quizPrizeSection}>
                  <div className={styles.quizPrize}>
                    <TrophyIcon size={16} />
                    {quiz.prizePool || "$500 Prize Pool"}
                  </div>
                  <div className={styles.quizDifficulty}>
                    {quiz.difficulty || "Medium"}
                  </div>
                </div> */}

                {/* Action buttons */}
                <div className={styles.quizActions}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQuizId(quiz._id);
                      setShowConfirmationModel(true);
                    }}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                  <button
                    className={styles.viewBtn}
                    style={{
                      border: "1px solid var(--border-light)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/contest/${quiz.slug}`);
                    }}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.noQuizContainer}>
          <img
            className={styles.noQuizImage}
            src={no_contests}
            alt="No contests available"
          />
          <p className={styles.noQuizHead}>No Quizzes Available!</p>
          <p className={styles.noQuizMessage}>
            It looks like there are no quizzes right now.
          </p>
          <p className={styles.noQuizMessage}>
            Check back later for new updates!
          </p>
        </div>
      )}

      {showConfirmation && (
        <ConfirmationModal
          setShowConfirmationModel={setShowConfirmationModel}
          title="Are you sure you want to delete this contest?"
          message="This action cannot be undone."
          onConfirm={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default CommunityContests;
