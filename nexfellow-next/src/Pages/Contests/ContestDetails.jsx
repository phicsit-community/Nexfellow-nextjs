"use client";

import { useState, useEffect } from "react";
import htmr from "htmr";
import { useParams, usePathname, useRouter } from "next/navigation";
import Commoncd from "../../components/Contest/Commoncd";
import { toast } from "sonner";
import api from "../../lib/axios";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import PaginationItem from "@mui/material/PaginationItem";
import { IoIosArrowDown } from "react-icons/io";
import search from "./assets/search.svg";
import UserPerformance from "../../components/Contest/UserPerformance";
import countryCodeMap from "../../components/Constants/Country";
import styles from "./ContestDetails.module.css";
import MetaTags from "../../components/MetaTags/MetaTags";
import BackButton from "../../components/BackButton/BackButton";

const CommoncdSkeleton = () => (
  <div className={`${styles.commoncdcontainer} ${styles.skeletonContainer}`}>
    <div className={styles.commoncdleft}>
      <div className={styles.headingBlock}>
        <div className={`${styles.shimmer} ${styles.responsiveTitle}`} />
        <div className={styles.iconRow}>
          <div className={`${styles.shimmer} ${styles.skeletonIcon}`} />
          <div className={`${styles.shimmer} ${styles.skeletonIcon}`} />
        </div>
      </div>

      <div className={styles.detailBlock}>
        <div className={`${styles.shimmer} ${styles.responsiveText}`} style={{ width: '60%' }} />
        <div className={`${styles.shimmer} ${styles.responsiveText}`} style={{ width: '80%' }} />
        <div className={`${styles.shimmer} ${styles.responsiveText}`} style={{ width: '70%' }} />
        <div className={`${styles.shimmer} ${styles.responsiveText}`} style={{ width: '75%' }} />
      </div>

      <div className={styles.avatarGroup}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`${styles.shimmer}`}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              marginRight: "-10px",
              zIndex: 3 - i,
              border: "2px solid white",
            }}
          />
        ))}
        <div className={`${styles.shimmer}`} style={{ width: 80, height: 16, borderRadius: 4, marginLeft: 16 }} />
      </div>

      <div className={styles.buttonBlock}>
        <div className={`${styles.shimmer} ${styles.skeletonButton}`} />
      </div>
    </div>

    <div className={styles.commoncdright}>
      <div
        className={`${styles.shimmer} ${styles.skeletonImage}`}
        style={{
          // width: 362,
          // height: 255,
          borderRadius: 12,
        }}
      />
    </div>
  </div>
);

// Skeleton Components
const ContestDetailsSkeleton = () => (
  <div
    className={`${styles.contestdetailscontent} ${styles.skeletonContainer}`}
  >
    <span className={`${styles.shimmer} ${styles["responsive-title"]}`}></span>
    <div className={styles["con-details"]}>
      <div
        className={`${styles["con-details-heading"]} ${styles.shimmer} ${styles["responsive-heading"]}`}
      ></div>
      <div className={styles["con-details-value"]}>
        <p
          className={`${styles.shimmer} ${styles["responsive-text"]}`}
          style={{ width: "100%", marginBottom: "8px" }}
        ></p>
        <p
          className={`${styles.shimmer} ${styles["responsive-text"]}`}
          style={{ width: "80%" }}
        ></p>
      </div>
    </div>
    <div className={styles["con-details"]}>
      <div
        className={`${styles["con-details-heading"]} ${styles.shimmer} ${styles["responsive-heading"]}`}
      ></div>
      <div className={styles["con-details-value"]}>
        {[1, 2, 3].map((_, index) => (
          <p
            key={index}
            className={`${styles.shimmer} ${styles["responsive-text"]}`}
            style={{ width: "90%", marginBottom: "8px" }}
          ></p>
        ))}
      </div>
    </div>
  </div>
);

const LeaderboardSkeleton = () => (
  <div className={styles.leaderboardWrapper}>
    <div className={styles.tableContainer}>
      <table className={styles.leaderboardTable}>
        <thead>
          <tr>
            <th
              className={`${styles.shimmer} ${styles["responsive-cell"]}`}
              style={{ width: "60px" }}
            ></th>
            <th
              className={`${styles.shimmer} ${styles["responsive-cell"]}`}
              style={{ width: "120px" }}
            ></th>
            <th
              className={`${styles.shimmer} ${styles["responsive-cell"]}`}
              style={{ width: "90px" }}
            ></th>
            <th
              className={`${styles.shimmer} ${styles["responsive-cell"]}`}
              style={{ width: "100px" }}
            ></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(10)].map((_, index) => (
            <tr key={index}>
              <td>
                <div
                  className={`${styles.shimmer} ${styles["responsive-cell"]}`}
                  style={{ width: "30px" }}
                ></div>
              </td>
              <td>
                <div
                  className={`${styles.shimmer} ${styles["responsive-cell"]}`}
                  style={{ width: "100px" }}
                ></div>
              </td>
              <td style={{ display: "flex", justifyContent: "center" }}>
                <div className={`${styles.shimmer} ${styles.flag}`}></div>
              </td>
              <td>
                <div
                  className={`${styles.shimmer} ${styles["responsive-cell"]}`}
                  style={{ width: "50px" }}
                ></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RewardsSkeleton = () => (
  <div className={styles.rewards}>
    {[1, 2, 3].map((_, index) => (
      <div
        key={index}
        className={`${styles["reward-container"]} ${styles["flex-column"]}`}
      >
        <div className={`${styles.rewardPhoto} ${styles.shimmer}`}></div>
        <p
          className={`${styles["reward-text"]} ${styles.shimmer}`}
          style={{ width: "80px", height: "20px", marginTop: "10px" }}
        ></p>
      </div>
    ))}
  </div>
);

const ContestDetails = () => {
  const [activeSection, setActiveSection] = useState("details");
  const [contestGiven, setContestGiven] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [quizData, setQuizData] = useState({});
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = params?.id;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const registeredQuizzes =
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user"))?.registeredQuizzes || [] : [];
  const isRegistered = registeredQuizzes.includes(id);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [performanceData, setPerformanceData] = useState(null);
  const [contestMessage, setContestMessage] = useState("");
  const [fields, setField] = useState([{ title: "", images: [] }]);
  const [rewardIds, setRewardsIds] = useState([]);
  const [reward1, setReward1] = useState("");
  const [reward2, setReward2] = useState("");
  const [reward3, setReward3] = useState("");
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const location = useLocation();
  const communityId = location.state?.communityId;
  console.log("Community ID:", communityId);
  console.log("location state:", location.state);
  const isCommunityQuiz = pathname?.startsWith("/community/contests/");

  const handleNavClick = (section) => {
    setActiveSection(section);

    // Set loading state when switching to a section
    if (section === "leaderboard" && loadingLeaderboard) {
      fetchLeaderboardData();
    } else if (section === "rewards") {
      setLoadingRewards(true);
      getRewardDetails();
    }
  };

  useEffect(() => {
    const fetchQuizData = async () => {
      setLoading(true);
      console.log(
        "Fetching quiz data for ID:",
        id,
        "isCommunityQuiz:",
        isCommunityQuiz
      );
      try {
        // Use the correct endpoint based on route
        const endpoint = isCommunityQuiz
          ? `/community/quizzes/${id}`
          : `/quiz/getQuiz/${id}`;
        console.log("Fetching from endpoint:", endpoint);
        const response = await api.get(endpoint);
        console.log("Quiz response:", response);

        if (response.status === 200 && response.data.quiz) {
          setQuizData(response.data.quiz);
          console.log("Quiz Data in details:", response.data.quiz);
          setRewardsIds(response.data.quiz.rewards || []);
          if (response.data.response) {
            setContestGiven(true);
            setPerformanceData(response.data.response);
            setContestMessage(response.data.message);
          }
        } else {
          toast.error("Quiz data not found");
        }
      } catch (error) {
        toast.error("Failed to fetch quiz data");
      } finally {
        // Optional: delay for skeleton effect
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchQuizData();
  }, [id, isCommunityQuiz]);

  const getRewardDetails = async () => {
    setLoadingRewards(true);
    try {
      if (rewardIds.length > 0) {
        // Use correct endpoint based on contest type
        const endpoint = isCommunityQuiz
          ? `/community/quizzes/${id}/rewards`
          : `reward/get-reward-details`;

        const response = await api.get(endpoint);

        if (response.status === 200) {
          const rewards = response.data.rewards; // Updated response structure
          setReward1(rewards?.[0]?.rewardImage || "");
          setReward2(rewards?.[1]?.rewardImage || "");
          setReward3(rewards?.[2]?.rewardImage || "");
        }
      }
    } catch (error) {
      toast.error("Failed to fetch reward data");
    } finally {
      setTimeout(() => setLoadingRewards(false), 700);
    }
  };

  const fetchLeaderboardData = async () => {
    setLoadingLeaderboard(true);
    try {
      // Use correct endpoint based on contest type
      const endpoint = isCommunityQuiz
        ? `/community/quizzes/${id}/leaderboard`
        : `/quiz/getLeaderboard/${id}`;

      const response = await api.get(endpoint);
      console.log("Leaderboard response:", response);

      if (response.status === 200) {
        // Sort and set leaderboard data
        const sortedData = [...response.data.ranks].sort(
          (a, b) => b.score - a.score
        );
        setLeaderboardData(sortedData || []);
      }
    } catch (error) {
      // toast.error("Failed to fetch leaderboard data");
      console.error("Leaderboard error:", error);
    } finally {
      setTimeout(() => setLoadingLeaderboard(false), 900);
    }
  };

  useEffect(() => {
    if (activeSection === "leaderboard") {
      fetchLeaderboardData();
    }
  }, [id, activeSection]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
    setCurrentPage(1); // Reset to the first page when filter changes
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page when filter changes
  };

  const getFilteredData = () => {
    let filteredData = leaderboardData;
    if (selectedCountry) {
      filteredData = filteredData.filter(
        (rank) => rank.country.toLowerCase() === selectedCountry.toLowerCase()
      );
    }
    if (searchTerm) {
      filteredData = filteredData.filter((rank) =>
        rank.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filteredData;
  };

  const getPageData = () => {
    const filteredData = getFilteredData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const totalPage = Math.ceil(getFilteredData().length / itemsPerPage);
  const hasMiscData = quizData.misc && quizData.misc.length > 0;

  console.log("Quiz Data:", quizData);

  return (
    <div className={styles.contestdetailspage}>
      {quizData && quizData._id && (
        <MetaTags
          title={`${quizData.title || "Contest"} | NexFellow`}
          description={
            quizData.description || "Join this exciting contest on NexFellow!"
          }
          contentId={quizData._id}
          contentType="quiz"
          image={"./assets/Online_Contest_svg_banner_dark.png"}
          type="article"
        />
      )}
      <div className={styles["contestdetails-header"]}>
        <div className={styles.backButtonContainer}>
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
        </div>
      </div>
      <div className={styles["contestdetailspart-1"]}>
        <div className={styles.ContestDetailsContainer}>
          {loading ? (
            <CommoncdSkeleton />
          ) : (
            <Commoncd
              data={quizData}
              isRegistered={isRegistered}
              given={contestGiven}
              loading={loading}
              isCommunityQuiz={isCommunityQuiz}
            />
          )}
        </div>
      </div>
      <div className={styles["mini-nav"]}>
        <div className={styles["mini-nav-items"]}>
          <div
            className={`${styles["mini-nav-item"]} ${activeSection === "details" ? styles["active"] : ""
              }`}
            onClick={() => handleNavClick("details")}
          >
            Contest Details
          </div>
          <div
            className={`${styles["mini-nav-item"]} ${activeSection === "leaderboard" ? styles["active"] : ""
              }`}
            onClick={() => handleNavClick("leaderboard")}
          >
            Results
          </div>
          <div
            className={`${styles["mini-nav-item"]} ${activeSection === "rewards" ? styles["active"] : ""
              }`}
            onClick={() => handleNavClick("rewards")}
          >
            Rewards
          </div>
        </div>
      </div>
      <div>
        {activeSection === "details" &&
          (loading ? (
            <ContestDetailsSkeleton />
          ) : (
            <div className={styles.contestdetailscontent}>
              <span>Contest Details:</span>
              <div className={styles["con-details"]}>
                <div className={styles["con-details-heading"]}>
                  Description:
                </div>
                <div
                  className={` whitespace-pre-wrap ${styles["con-details-value"]}`}
                >
                  {quizData.description && <p>{quizData.description}</p>}
                </div>
              </div>
              <div className={styles["con-details"]}>
                <div className={styles["con-details-heading"]}>
                  Rules & Regulations:
                </div>
                <div className={styles["con-details-value"]}>
                  {quizData.rules?.map((rule, index) => (
                    <p key={index}>
                      {index + 1}. {rule}
                    </p>
                  ))}
                </div>
              </div>
              {hasMiscData &&
                quizData.misc.map((item, index) => (
                  <div key={index} className={styles["con-details"]}>
                    <div className={styles["con-details-heading"]}>
                      {item.fieldName}
                    </div>
                    <div className={styles.imageContainer}>
                      {item.fieldValue.map((imageUrl, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={imageUrl}
                          alt={`${item.fieldName} - image ${imgIndex + 1}`}
                          className={styles["misc-image"]}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ))}

        {activeSection === "leaderboard" && (
          <div className={styles.leaderboard}>
            <div className={styles.containerLeaderboard}>
              <div className={styles["container-wrap"]}>
                {/*  */}
                <section id="leaderboard">
                  <nav className={styles["ladder-nav"]}>
                    <div className={styles["contest-filters"]}>
                      <img src={search?.src || search} alt="Search" />
                      <input
                        type="text"
                        id="search-name"
                        className={styles["live-search-box"]}
                        placeholder="Enter your name to search"
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                      />
                    </div>
                    <div className={styles["custom-select"]}>
                      <select
                        className={styles["filter-country"]}
                        onChange={handleCountryChange}
                        value={selectedCountry}
                      >
                        <option value="">All Countries</option>
                        {Object.entries(countryCodeMap).map(
                          ([countryName, code]) => (
                            <option
                              key={code}
                              value={countryName.toLowerCase()}
                            >
                              {countryName}
                            </option>
                          )
                        )}
                      </select>
                      <IoIosArrowDown className={styles["dropdown-icon"]} />
                    </div>
                  </nav>
                  {performanceData && (
                    <div className={styles.userPerformance}>
                      <UserPerformance
                        contestMessage={contestMessage}
                        performanceData={performanceData}
                        contestGiven={contestGiven}
                      />
                    </div>
                  )}
                  {loadingLeaderboard ? (
                    <LeaderboardSkeleton />
                  ) : (
                    <div className={styles.leaderboardWrapper}>
                      <div className={styles.tableContainer}>
                        <table className={styles.leaderboardTable}>
                          <thead>
                            <tr>
                              <th>Rank</th>
                              <th>Username</th>
                              <th>Country</th>
                              <th>Total Marks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPageData().map((rank, idx) => (
                              <tr key={idx}>
                                <td>
                                  {(currentPage - 1) * itemsPerPage + idx + 1}
                                </td>
                                <td>{rank.username}</td>
                                <td
                                  style={{
                                    display: "flex",
                                    justifyContent: "center",
                                  }}
                                >
                                  <img
                                    src={`https://flagcdn.com/w40/${countryCodeMap[
                                      rank.country
                                    ]?.toLowerCase()}.png`}
                                    alt={rank.country}
                                    className={styles.flag}
                                    onError={(e) =>
                                      (e.currentTarget.style.display = "none")
                                    }
                                  />
                                </td>
                                <td>{rank.score}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {totalPage > 1 && !loadingLeaderboard && (
                    <Stack spacing={2} className={styles.pagination}>
                      <Pagination
                        count={totalPage}
                        page={currentPage}
                        onChange={handlePageChange}
                        renderItem={(item) => <PaginationItem {...item} />}
                      />
                    </Stack>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}

        {activeSection === "rewards" &&
          (loadingRewards ? (
            <RewardsSkeleton />
          ) : (
            <div className={styles.rewards}>
              {reward1 && (
                <div
                  className={`${styles["reward-container"]} ${styles["flex-column"]}`}
                >
                  <img
                    src={reward1}
                    alt="Reward 1"
                    className={styles.rewardPhoto}
                  />
                  <p className={styles["reward-text"]}>1st Prize</p>
                </div>
              )}

              {reward2 && (
                <div
                  className={`${styles["reward-container"]} ${styles["flex-column"]}`}
                >
                  <img
                    src={reward2}
                    alt="Reward 2"
                    className={styles.rewardPhoto}
                  />
                  <p className={styles["reward-text"]}>2nd Prize</p>
                </div>
              )}

              {reward3 && (
                <div
                  className={`${styles["reward-container"]} ${styles["flex-column"]}`}
                >
                  <img
                    src={reward3}
                    alt="Reward 3"
                    className={styles.rewardPhoto}
                  />
                  <p className={styles["reward-text"]}>3rd Prize</p>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ContestDetails;
