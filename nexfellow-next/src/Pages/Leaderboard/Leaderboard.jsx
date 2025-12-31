"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./Leaderboard.module.css";
import SEARCH from "./assets/search.svg";
import {
  FaArrowLeft,
  FaArrowRight,
  FaFire,
  FaInfoCircle,
  FaEye,
  FaUsers,
  FaComments,
  FaThumbsUp,
  FaClipboardCheck,
  FaLink,
} from "react-icons/fa";
import countryCodeMap from "../../components/Constants/Country";
import { TopCard1, TopCard2 } from "./Topcards";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import avatarTemp from "./assets/avatar.svg";

// Skeleton Components (unchanged)
const SkeletonTableRow = () => (
  <tr className={styles.skeletonRow}>
    <td>
      <div className={styles.skeletonCell}></div>
    </td>
    <td>
      <div className={styles.skeletonCell}></div>
    </td>
    <td>
      <div className={`${styles.skeletonCell} ${styles.skeletonFlag}`}></div>
    </td>
    <td>
      <div className={styles.skeletonCell}></div>
    </td>
  </tr>
);

const SkeletonTopCard = () => (
  <div className={`${styles.skeletonTopCard} ${styles.shimmer}`}>
    <div className={styles.skeletonTopImage}></div>
    <div className={styles.skeletonTopDetails}>
      <div className={styles.skeletonTopName}></div>
      <div className={styles.skeletonTopRating}></div>
    </div>
  </div>
);

const Skeleton3Cards = () => (
  <>
    <SkeletonTopCard />
    <SkeletonTopCard />
    <SkeletonTopCard />
  </>
);

const SkeletonMobileCard = () => (
  <div className={`${styles.scoreCard} ${styles.skeletonMobileCard}`}>
    <div className={`${styles.skeletonCell} ${styles.skeletonRank}`}></div>
    <div className={styles.userDetails}>
      <div
        className={`${styles.skeletonCell} ${styles.skeletonUsername}`}
      ></div>
      <div className={styles.ratingAndTotal}>
        <div
          className={`${styles.skeletonCell} ${styles.skeletonRating}`}
        ></div>
      </div>
    </div>
    <div className={`${styles.skeletonCell} ${styles.skeletonFlag}`}></div>
  </div>
);

// Reusable row/card component for both desktop and mobile
const LeaderboardRow = ({ item, avatartemp, getShortForm, isMobile }) => {
  const username = item.owner?.username || "N/A";
  const profileLink = `/explore/${username}`;
  const flagCode = getShortForm(item.owner?.country || "unknown");
  const countryAlt = item.owner?.country || "unknown";
  const picture = item.owner?.picture || avatarTemp;

  if (isMobile) {
    return (
      <div className={styles.scoreCard}>
        <span>{item.rank || "N/A"}</span>
        <div className={styles.userDetails}>
          <Link
            href={profileLink}
            className={styles.username}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {/* <img
              src={picture}
              alt={username}
              loading="lazy"
              className={styles.userAvatar}
            /> */}
            {username}
          </Link>
          <div className={styles.ratingAndTotal}>
            <FaFire style={{ color: "#ff3030", fontSize: "18px" }} />
            <span>Reputation: {Math.round(item.reputationScore)}</span>
          </div>
        </div>
        <div>
          <img
            src={`https://flagcdn.com/80x60/${flagCode}.png`}
            srcSet={`https://flagcdn.com/160x120/${flagCode}.png 2x, https://flagcdn.com/240x180/${flagCode}.png 3x`}
            alt={countryAlt}
            width={80}
            height={60}
            loading="lazy"
            className={styles.wavyFlag}
            style={{ filter: "url(#wavy-flag)" }}
          />
        </div>
      </div >
    );
  }

  return (
    <tr>
      <td>#{item.rank || "N/A"}</td>
      <td className={styles.userCell}>
        <div className={styles.userCellBox}>
          <img
            src={picture}
            alt={username}
            loading="lazy"
            className={styles.userAvatar}
          />
          <Link
            href={profileLink}
            className={styles.username}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {username}
          </Link>
        </div>
      </td>
      <td>
        <div className={styles.countryCell}>
          <img
            src={`https://flagcdn.com/80x60/${flagCode}.png`}
            srcSet={`https://flagcdn.com/160x120/${flagCode}.png 2x, https://flagcdn.com/240x180/${flagCode}.png 3x`}
            alt={countryAlt}
            width={80}
            height={60}
            loading="lazy"
            className={styles.wavyFlag}
            style={{ filter: "url(#wavy-flag)" }}
          />
        </div>
      </td>
      <td className={styles.reputationCell}>
        <FaFire style={{ color: "#ff3030", fontSize: "18px" }} />
        <span>{Math.round(item.reputationScore)}</span>
      </td>
    </tr>
  );
};

const Leaderboard = () => {
  const [communities, setCommunities] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 100;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  const getShortForm = (country) => {
    const countryEntry = Object.entries(countryCodeMap).find(
      ([name, code]) => name === country
    );
    return countryEntry ? countryEntry[1] : "unknown";
  };

  const fetchCommunities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/community/");
      const communityDataWithReputation = await Promise.all(
        response.data.map(async (community) => {
          try {
            const repRes = await axios.get(
              `/analytics/${community._id}/reputation`
            );
            return {
              ...community,
              reputationScore: repRes.data.reputationScore || 0,
            };
          } catch (err) {
            console.error("Failed to fetch reputation for", community._id);
            return { ...community, reputationScore: 0 };
          }
        })
      );
      const sortedCommunities = [...communityDataWithReputation].sort(
        (a, b) => b.reputationScore - a.reputationScore
      );
      const withRank = sortedCommunities.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
      setCommunities(withRank);
      setFilteredData(withRank);
    } catch (err) {
      setError(err);
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  useEffect(() => {
    setCurrentPage(1);
    let results = communities;
    if (searchTerm) {
      results = results.filter(
        (item) =>
          (item.owner?.username &&
            item.owner.username
              .toLowerCase()
              .startsWith(searchTerm.toLowerCase())) ||
          (item.owner?.name &&
            item.owner.name.toLowerCase().startsWith(searchTerm.toLowerCase()))
      );
    }
    if (selectedCountry !== "all") {
      results = results.filter(
        (item) =>
          getShortForm(item.owner?.country || "unknown") === selectedCountry
      );
    }
    setFilteredData(results);
  }, [searchTerm, selectedCountry, communities]);

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleCountryChange = (value) => setSelectedCountry(value);
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleDotsClick = (position) => {
    if (position === "start") setCurrentPage(1);
    else if (position === "end") setCurrentPage(totalPages);
  };

  const getPagination = () => {
    let pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages = [1, 2, 3];
      if (totalPages > 3) pages.push("end");
    } else if (currentPage >= totalPages - 2) {
      pages = ["start"];
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages = ["start", currentPage - 1, currentPage, currentPage + 1, "end"];
    }
    return pages;
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const topThree = filteredData.length > 0 ? filteredData.slice(0, 3) : [];
  const hasEnoughData = filteredData.length >= 3;

  const countries = Object.entries(countryCodeMap).map(([name, code]) => ({
    name,
    code,
  }));

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Close on ESC key for accessibility
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.mainContainer}>
      <p className={styles.leaderboardTitle}>Leaderboard</p>
      <div className={styles.leaderboard}>
        <div className={styles.searchBar}>
          <div className={styles.search}>
            <img src={SEARCH} alt="search" />
            <input
              type="text"
              placeholder="Search owner by name..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Select
            value={selectedCountry}
            onValueChange={handleCountryChange}
            className={styles.selectButton}
          >
            <SelectTrigger className={styles.selectTrigger}>
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent className={styles.selectContent}>
              <SelectItem value="all">All</SelectItem>
              {countries.map((country, index) => (
                <SelectItem key={index} value={country.code}>
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://flagcdn.com/w80/${getShortForm(
                        country.name || "unknown"
                      )}.png`}
                      alt={country.name || "unknown"}
                      style={{ width: "36px" }}
                    />
                    <span className={styles.countryName}>{country.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={styles.reputationWrapper}>
          <button
            className={styles.infoButton}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="reputation-dialog"
            onClick={() => setOpen(!open)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(!open);
              }
            }}
            ref={buttonRef}
            type="button"
          >
            <FaFire style={{ color: "#ff3030", fontSize: "18px" }} className={styles.fireIcon} />
            <span className={styles.labelText}>Community Reputation</span>
            <FaInfoCircle className={styles.infoIcon} aria-label="More info" />
          </button>

          {open && (
            <div
              className={styles.floatingPanel}
              role="dialog"
              aria-modal="true"
              id="reputation-dialog"
              aria-labelledby="reputation-title"
              ref={panelRef}
              tabIndex={-1}
            >
              <h3 id="reputation-title" className={styles.floatingTitle}>
                How Reputation Is Calculated
              </h3>
              <ul className={styles.factorList}>
                <li>
                  <FaEye className={styles.factorIcon} />
                  <b>Views (25%)</b> - Number of times your community page is visited.
                </li>
                <li>
                  <FaUsers className={styles.factorIcon} />
                  <b>New Members (20%)</b> - Recent members who joined your community.
                </li>
                <li>
                  <FaComments className={styles.factorIcon} />
                  <b>Comments (15%)</b> - Engagement through meaningful discussions.
                </li>
                <li>
                  <FaThumbsUp className={styles.factorIcon} />
                  <b>Likes (10%)</b> - Appreciation shown by community members.
                </li>
                <li>
                  <FaClipboardCheck className={styles.factorIcon} />
                  <b>Contest Participation (15%)</b> - Involvement in contests to boost activity.
                </li>
                <li>
                  <FaLink className={styles.factorIcon} />
                  <b>Link Clicks (10%)</b> - Traffic generated from links in your posts.
                </li>
                <li>
                  <FaLink className={styles.factorIcon} style={{ opacity: 0.7 }} />
                  <b>Short URL Clicks (5%)</b> - Engagement with shortened links shared.
                </li>
              </ul>
              <p className={styles.tipText}>
                Each factor is normalized and weighted, then combined into your final community reputation score, updated weekly.
                Focus on high-weight activities for faster growth!
              </p>
            </div>
          )}
        </div>

        <div className={styles.topThree}>
          {isLoading ? (
            <Skeleton3Cards />
          ) : hasEnoughData ? (
            <>
              <TopCard2
                name={topThree[1]?.owner?.username || "N/A"}
                picture={topThree[1]?.owner?.picture || ""}
                rank={"2nd"}
                country={topThree[1]?.owner?.country || "N/A"}
                rating={Math.round(topThree[1]?.reputationScore)}
                onClick={() =>
                  router.push(`/community/${topThree[1]?.owner?.username}`)
                }
              />
              <TopCard1
                name={topThree[0]?.owner?.username || "N/A"}
                picture={topThree[0]?.owner?.picture || ""}
                rank={"1st"}
                country={topThree[0]?.owner?.country || "N/A"}
                rating={Math.round(topThree[0]?.reputationScore)}
                onClick={() =>
                  router.push(`/community/${topThree[0]?.owner?.username}`)
                }
              />
              <TopCard2
                name={topThree[2]?.owner?.username || "N/A"}
                picture={topThree[2]?.owner?.picture || ""}
                rank={"3rd"}
                country={topThree[2]?.owner?.country || "N/A"}
                rating={Math.round(topThree[2]?.reputationScore)}
                onClick={() =>
                  router.push(`/community/${topThree[2]?.owner?.username}`)
                }
              />
            </>
          ) : null}
        </div>

        {/* Desktop Table */}
        <div className={styles.scrollableTableContainer}>
          <table>
            <thead className={styles.tableHead}>
              <tr>
                <th>Rank</th>
                <th className={styles.usernameTh}>Username</th>
                <th>Country</th>
                <th>Reputation Points</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array(itemsPerPage)
                  .fill(0)
                  .map((_, index) => <SkeletonTableRow key={index} />)
                : currentData
                  .filter((item) => item && item.rank >= 4)
                  .map((item, index) => (
                    <LeaderboardRow
                      key={index}
                      item={item}
                      avatarIcon={(picture) => picture || avatarTemp}
                      getShortForm={getShortForm}
                      isMobile={false}
                    />
                  ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: Same logic, styled as cards */}
        <div className={styles.scrollableTableContainerMobile}>
          <div>
            {isLoading
              ? Array(itemsPerPage)
                .fill(0)
                .map((_, index) => <SkeletonMobileCard key={index} />)
              : currentData
                .filter((item) => item && item.rank >= 4)
                .map((item, index) => (
                  <LeaderboardRow
                    key={index}
                    item={item}
                    avatarIcon={(picture) => picture || avatarTemp}
                    getShortForm={getShortForm}
                    isMobile={true}
                  />
                ))}
          </div>
        </div>

        <div className={styles.pagination}>
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1 || isLoading}
            className={styles.navButton}
          >
            <FaArrowLeft /> Prev
          </button>
          {!isLoading &&
            getPagination().map((page, index) => {
              if (page === "start") {
                return (
                  <button
                    key={`start-${index}`}
                    onClick={() => handleDotsClick("start")}
                    className={styles.dots}
                  >
                    ...
                  </button>
                );
              } else if (page === "end") {
                return (
                  <button
                    key={`end-${index}`}
                    onClick={() => handleDotsClick("end")}
                    className={styles.dots}
                  >
                    ...
                  </button>
                );
              } else {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage ? styles.active : ""}
                  >
                    {page}
                  </button>
                );
              }
            })}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || isLoading}
            className={styles.navButton}
          >
            Next <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
