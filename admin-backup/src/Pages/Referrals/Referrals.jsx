import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";

// icons
import { IoIosSearch } from "react-icons/io";

// CSS
import styles from "./Referrals.module.css";
import Pagination from "../../Components/Pagination/Pagination";
import { useSelector } from "react-redux";
import SideBar from "../../Components/SideBar/SideBar";
import Loader from "../../Components/Loader/Loader";
const Referrals = () => {
  // search query
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const apiUrl = import.meta.env.VITE_API_URL;
  const { user } = useSelector((state) => state.user);
  const adminId = user;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${apiUrl}/admin/${adminId}/registered-users`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const result = await response.json();
        console.log("result user->", result);
        setData(result);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [apiUrl, adminId]);

  const sortedData = data.sort((a, b) => b.coins - a.coins);
  const filteredData = sortedData.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchQuery = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div>
      <Navbar />
      <SideBar />
      <div className={styles.mainContainer}>
        <div className={styles.container}>
          <div className={styles.headAndSearch}>
            <div className={styles.title}>Referral Leaderboard</div>

            <div className={styles.searchBarAndFilter}>
              {/* Search bar */}
              <div className={styles.searchContainer}>
                <IoIosSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search user"
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={handleSearchQuery}
                />
              </div>
            </div>
          </div>
        </div>

        {/* table */}
        <div>
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={`${styles.tableHeaderItem} ${styles.rank}`}>
                Rank
              </div>
              <div className={`${styles.tableHeaderItem} ${styles.name}`}>
                Username
              </div>
              <div className={`${styles.tableHeaderItem} ${styles.referrals}`}>
                Referrals
              </div>
            </div>

            {loading ? (
              <div className={styles.loader}>
                <Loader />
              </div>
            ) : (
              paginatedData.map((user, index) => (
                <div className={styles.tableRow} key={`${user._id}-${index}`}>
                  <div className={`${styles.tableRowItem} ${styles.rank}`}>
                    {/* <div>{user.rank}</div> */}
                    <div>{(currentPage - 1) * itemsPerPage + index + 1}</div>
                  </div>
                  <div className={`${styles.tableRowItem} ${styles.username}`}>
                    <div>{user.username}</div>
                  </div>
                  <div
                    className={`${styles.tableRowItem} ${styles.referrals} `}
                  >
                    {user.coins}
                  </div>
                </div>
              ))
            )}
          </div>
          <div>
            <Pagination
              totalPages={Math.ceil(filteredData.length / itemsPerPage)}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
