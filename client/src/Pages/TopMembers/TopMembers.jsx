import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import VERIFY from "./assets/badge2.svg";
import COMMUNITY_BADGE from "./assets/badge3.svg";
import styles from "./TopMembers.module.css";
import BackButton from "../../components/BackButton/BackButton";
import { FaArrowLeft, FaArrowRight, FaSearch, FaUser } from "react-icons/fa";
import { toast } from "sonner";
import { Input } from "antd";

const SkeletonRow = () => (
  <tr className={styles.skeletonRow}>
    <td>
      <div className={styles.skeletonCheckbox}></div>
    </td>
    <td>
      <div className="flex items-center gap-3">
        <div className={styles.skeletonProfileImage}></div>
        <div className={styles.skeletonText}></div>
      </div>
    </td>
    <td>
      <div className={styles.skeletonText}></div>
    </td>
    <td>
      <div className={styles.skeletonBadge}></div>
    </td>
    <td>
      <div className={styles.skeletonButton}></div>
    </td>
  </tr>
);

const TopMembers = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFollowers, setFilteredFollowers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [topMembers, setTopMembers] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredFollowers.length / itemsPerPage);

  const handleDotsClick = (position) => {
    if (position === "start") {
      setCurrentPage(1);
    } else if (position === "end") {
      setCurrentPage(totalPages);
    }
  };

  const getPagination = () => {
    let pages = [];

    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      pages = [1, 2, 3];
      if (totalPages > 3) {
        pages.push("end");
      }
    } else if (currentPage >= totalPages - 2) {
      pages = ["start"];
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages = ["start", currentPage - 1, currentPage, currentPage + 1, "end"];
    }

    return pages;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/community/id/${communityId}`);
        const comm = data.community;
        const followersList = comm.owner.followers || [];
        setCommunity(comm);
        setFollowers(followersList);

        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        const isOwnerOfCommunity = comm.owner?._id === loggedInUser?.id;
        setIsOwner(isOwnerOfCommunity);

        const topRes = await axios.get(`/community/${communityId}/top-members`);
        const topIds = topRes.data.topMembers.map((m) => m._id || m);
        const fullTopMembers = followersList.filter((f) =>
          topIds.includes(f._id)
        );
        setTopMembers(fullTopMembers);
      } catch (err) {
        console.error("Error loading community data:", err);
        toast.error("Failed to load community data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [communityId]);

  useEffect(() => {
    const filtered = followers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFollowers(filtered);
    setCurrentPage(1);
  }, [searchTerm, followers]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentUsers = filteredFollowers.slice(indexOfFirst, indexOfLast);

  const toggleTopMember = async (userId) => {
    setLoadingId(userId);
    try {
      const isAlreadyTop = topMembers.some((member) => member._id === userId);
      let updatedTopMembers;

      if (isAlreadyTop) {
        updatedTopMembers = topMembers.filter(
          (member) => member._id !== userId
        );
      } else {
        const userToAdd = followers.find((f) => f._id === userId);
        updatedTopMembers = [...topMembers, userToAdd];
      }

      if (updatedTopMembers.length > 5) {
        toast.info("You can only have up to 5 top members.");
        return;
      }

      const topMemberIds = updatedTopMembers.map((m) => m._id);
      const { data } = await axios.patch(
        `/community/${communityId}/top-members`,
        {
          topMembers: topMemberIds,
        }
      );

      const updatedList = followers.filter((f) => topMemberIds.includes(f._id));
      setTopMembers(updatedList);
    } catch (error) {
      console.error("Error toggling top member:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const bulkUpdate = async (makeTopMember) => {
    try {
      let newTopMembers = [...topMembers];

      if (makeTopMember) {
        const toAdd = selectedIds
          .filter((id) => !newTopMembers.some((m) => m._id === id))
          .map((id) => followers.find((f) => f._id === id));
        newTopMembers = [...newTopMembers, ...toAdd].slice(0, 5);
      } else {
        newTopMembers = newTopMembers.filter(
          (m) => !selectedIds.includes(m._id)
        );
      }

      const topMemberIds = newTopMembers.map((m) => m._id);
      const { data } = await axios.patch(
        `/community/${communityId}/top-members`,
        {
          topMembers: topMemberIds,
        }
      );

      const updatedList = followers.filter((f) => topMemberIds.includes(f._id));
      setTopMembers(updatedList);
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk update error:", error);
    }
  };

  const handleCheckboxChange = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) =>
      Math.min(prev + 1, Math.ceil(filteredFollowers.length / itemsPerPage))
    );
  };

  if (loading)
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={`${styles.skeletonTitle} ${styles.shimmer}`}></div>
            <div className={`${styles.skeletonSearch} ${styles.shimmer}`}></div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th></th>
                <th>Profile</th>
                <th>Username</th>
                <th>Badge</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
          <div className={styles.pagination}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`${styles.skeletonPagination} ${styles.shimmer}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div
          className="border rounded-lg hover:bg-accent text-sm w-fit"
          style={{ padding: "3px 10px" }}
        >
          <BackButton
            onClick={() => navigate(-1)}
            showText={true}
            smallText={true}
          />
        </div>
        <div className={styles.header}>
          <h2 className={styles.title}>Top Members</h2>
          <div className="relative w-full sm:w-auto">
            {/* <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /> */}
            <Input
              prefix={<FaSearch className="text-gray-400 mr-2" />}
              type="text"
              placeholder="Search members..."
              className={`${styles.searchInput}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isOwner && selectedIds.length > 0 && (
          <div className={styles.bulkActions}>
            <span className={styles.bulkCount}>
              {selectedIds.length} / 5 top members selected
            </span>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => bulkUpdate(true)}
                className={`${styles.button} ${styles.buttonGreen}`}
                disabled={
                  selectedIds.length === 0 ||
                  selectedIds.length + topMembers.length > 5
                }
              >
                Set All as Top Members
              </button>
              <button
                onClick={() => bulkUpdate(false)}
                className={`${styles.button} ${styles.buttonRed}`}
                disabled={selectedIds.length === 0}
              >
                Remove All Top Members
              </button>
            </div>
          </div>
        )}

        <div className="hidden sm:block">
          <table className={styles.table}>
            <thead>
              <tr>
                <th></th>
                <th>Profile</th>
                <th>Username</th>
                <th>Badge</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => {
                const isTopMember = topMembers.some((m) => m._id === user._id);
                const disableAdd = topMembers.length >= 5 && !isTopMember;

                return (
                  <tr key={user._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user._id)}
                        onChange={() => handleCheckboxChange(user._id)}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={user.picture || "/default-profile.jpg"}
                          alt="Profile"
                          className={styles.profileImage}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-profile.jpg";
                          }}
                        />
                        {user.name}
                      </div>
                    </td>
                    <td>@{user.username}</td>
                    <td>
                      {user.isCommunityAccount && user.createdCommunity ? (
                        user.createdCommunity?.accountType ===
                          "Organization" ? (
                          <span className={styles.badgePill}>
                            <img
                              src={COMMUNITY_BADGE}
                              className={styles.badge}
                              alt="Community Badge"
                            />
                            Community
                          </span>
                        ) : (
                          <span className={styles.badgePill}>
                            <img
                              src={VERIFY}
                              className={styles.badge}
                              alt="Verified Badge"
                            />
                            Verified
                          </span>
                        )
                      ) : user.verificationBadge ? (
                        <span className={styles.badgePill}>
                          <img
                            src={VERIFY}
                            className={styles.badge}
                            alt="Verified Badge"
                          />
                          Verified
                        </span>
                      ) : (
                        <span
                          className={`${styles.badgePill} ${styles.badgeGrey}`}
                        >
                          Not Verified
                        </span>
                      )}
                    </td>
                    <td>
                      {isOwner ? (
                        <button
                          onClick={() => toggleTopMember(user._id)}
                          className={`${styles.button} ${isTopMember ? styles.buttonRed : styles.buttonGreen
                            }`}
                          disabled={disableAdd || loadingId === user._id}
                          style={{
                            opacity: disableAdd ? 0.6 : 1,
                            cursor: disableAdd ? "not-allowed" : "pointer",
                          }}
                        >
                          {loadingId === user._id
                            ? "Loading..."
                            : isTopMember
                              ? "Remove"
                              : "Set as Top Member"}
                        </button>
                      ) : (
                        <span className="text-gray-400">Restricted</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="block sm:hidden">
          {currentUsers.map((user) => {
            const isTopMember = topMembers.some((m) => m._id === user._id);
            const disableAdd = topMembers.length >= 5 && !isTopMember;

            return (
              <div key={user._id} className={styles.table}>
                <div className={styles.tr}>
                  <div className="absolute top-3 right-3">
                    <input
                      type="checkbox"
                      className="h-8 w-8"
                      checked={selectedIds.includes(user._id)}
                      onChange={() => handleCheckboxChange(user._id)}
                    />
                  </div>

                  <div className={styles.mobileProfileSection}>
                    <img
                      src={user.picture || "/default-profile.jpg"}
                      alt="Profile"
                      className={styles.profileImage}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-profile.jpg";
                      }}
                    />
                    <div className={styles.mobileProfileInfo}>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-gray-500 text-sm">@{user.username}</p>
                    </div>
                  </div>

                  <div className={styles.badgeSection}>
                    {user.isCommunityAccount && user.createdCommunity ? (
                      user.createdCommunity?.accountType === "Organization" ? (
                        <span className={styles.badgePill}>
                          <img
                            src={COMMUNITY_BADGE}
                            className={styles.badge}
                            alt="Community Badge"
                          />
                          Community
                        </span>
                      ) : (
                        <span className={styles.badgePill}>
                          <img
                            src={VERIFY}
                            className={styles.badge}
                            alt="Verified Badge"
                          />
                          Verified
                        </span>
                      )
                    ) : user.verificationBadge ? (
                      <span className={styles.badgePill}>
                        <img
                          src={VERIFY}
                          className={styles.badge}
                          alt="Verified Badge"
                        />
                        Verified
                      </span>
                    ) : (
                      <span
                        className={`${styles.badgePill} ${styles.badgeGrey}`}
                      >
                        Not Verified
                      </span>
                    )}
                  </div>

                  <div className={styles.actionSection}>
                    {isOwner ? (
                      <button
                        onClick={() => toggleTopMember(user._id)}
                        className={`${styles.button} ${isTopMember ? styles.buttonRed : styles.buttonGreen
                          }`}
                        disabled={disableAdd || loadingId === user._id}
                        style={{
                          opacity: disableAdd ? 0.6 : 1,
                          cursor: disableAdd ? "not-allowed" : "pointer",
                        }}
                      >
                        {loadingId === user._id
                          ? "Loading..."
                          : isTopMember
                            ? "Remove"
                            : "Set as Top Member"}
                      </button>
                    ) : (
                      <span className="text-gray-400">Restricted</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredFollowers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10">
            <FaUser className="text-gray-300 text-5xl mb-4" />
            <p className="text-gray-500 text-lg">No members found</p>
            {searchTerm && (
              <p className="text-gray-400 mt-2">Try a different search term</p>
            )}
          </div>
        )}

        {filteredFollowers.length > 0 && (
          <div className={styles.pagination}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1 || loading}
              aria-label="Previous page"
            >
              <FaArrowLeft /> <span className="hidden sm:inline">Prev</span>
            </button>

            {!loading &&
              getPagination().map((page, index) => {
                if (page === "start") {
                  return (
                    <button
                      key={`start-${index}`}
                      onClick={() => handleDotsClick("start")}
                      className={styles.dots}
                      aria-label="Go to first page"
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
                      aria-label="Go to last page"
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
                      aria-label={`Page ${page}`}
                      aria-current={page === currentPage ? "page" : undefined}
                    >
                      {page}
                    </button>
                  );
                }
              })}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span> <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopMembers;
