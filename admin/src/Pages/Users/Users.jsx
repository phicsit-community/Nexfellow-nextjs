import { useEffect, useState } from "react";
import { saveAs } from "file-saver";

// styles
import styles from "./Users.module.css";

// components
import Navbar from "../../Components/Navbar/Navbar";
import Table from "../../Components/Table/Table";

// icons
import { IoIosSearch } from "react-icons/io";
import DropDown from "../../Components/DropDown/DropDown";
import { useSelector } from "react-redux";
import SideBar from "../../Components/SideBar/SideBar";
import Loader from "../../Components/Loader/Loader";

const Users = () => {
  // search query
  const [searchQuery, setSearchQuery] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL;
  const { user } = useSelector((state) => state.user);
  const adminId = user;
  const [data, setData] = useState([]);

  // ratings
  const ratings = ["High to Low", "Low to High"];
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
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
        console.log("result->", result);
        const sortedUsers = result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setData(sortedUsers);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [apiUrl, adminId]);

  const handleSearchQuery = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryClick = (rating) => {
    setSelectedRating(rating);

    if (rating === "High to Low") {
      setData(data.sort((a, b) => b.rating - a.rating));
    } else if (rating === "Low to High") {
      setData(data.sort((a, b) => a.rating - b.rating));
    }
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const downloadCSV = () => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]).filter(
      (key) => key !== "__v" && key !== "_id"
    );

    const csvRows = [
      headers.join(","), // Header row
      ...data.map((user) =>
        headers.map((field) => `"${user[field] ?? ""}"`).join(",")
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `registered_users_${new Date().toISOString()}.csv`);
  };

  return (
    <div>
      <Navbar />
      <SideBar />
      <div className={styles.maincontainer}>
        <div className={styles.userHeader}>
          <div>
            <div className={styles.title}>Users</div>
            <div className={styles.totalUser}>Total User : {data.length}</div>
          </div>

          {/* Search and filter's */}

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

          <button onClick={downloadCSV} className={styles.downloadBtn}>
            Download CSV
          </button>

        </div>

        <Table
          searchQuery={searchQuery}
          data={data}
          setData={setData}
          loading={loading}
          setLoading={setLoading}
        />
      </div>
    </div>
  );
};

export default Users;
