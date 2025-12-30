
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../../Components/Navbar/Navbar";
import ConfimationModal from "../../Components/ConfirmationModal/ConfimationModal";
import { FaPlus } from "react-icons/fa6";

// icons
import { IoIosSearch, IoIosArrowDown } from "react-icons/io";
import plus from "../../assests/Icons/Plus.png"
// CSS
import styles from "./Home.module.css";
import DropDown from "../../Components/DropDown/DropDown";
import SideBar from "../../Components/SideBar/SideBar";
import { marked } from "marked";
import Loader from "../../Components/Loader/Loader";

const Home = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(false);
  const [userQuizes, setUserQuizes] = useState([]);
  const [showConfirmation, setShowConfirmationModel] = useState(false);

  const [filteredQuizes, setFilteredQuizes] = useState([]);

  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState("All");

  const [status, setStatus] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [months, setMonth] = useState([]);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("All");

  const [years, setYear] = useState([]);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("All");

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch user quizzes
  const fetchUserQuizes = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoading(true);
    try {
      const ID = user;
      const response = await fetch(`${apiUrl}/admin/getquizzes/${ID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUserQuizes(data);
        console.log("user quizes->", data);

        // Get unique categories
        const uniqueCategories = [
          "All",
          ...new Set(data.map((quiz) => quiz.category)),
        ];
        setCategories(uniqueCategories);

        // Get unique status
        const uniqueStatus = [
          "All",
          ...new Set(
            data.map((quiz) => {
              if (
                quiz.startTime > new Date().toISOString() &&
                quiz.endTime > new Date().toISOString()
              ) {
                return "Upcoming";
              } else if (
                quiz.startTime < new Date().toISOString() &&
                quiz.endTime > new Date().toISOString()
              ) {
                return "Live";
              } else if (
                quiz.startTime < new Date().toISOString() &&
                quiz.endTime < new Date().toISOString()
              ) {
                return "Ended";
              }
            })
          ),
        ];
        setStatus(uniqueStatus);
        // console.log("uniqueStatus->", uniqueStatus);

        // Get unique months
        const uniqueMonths = [
          "All",
          ...new Set(
            data.map((quiz) =>
              new Date(quiz.startTime).toLocaleString("default", {
                month: "long",
              })
            )
          ),
        ];
        setMonth(uniqueMonths);
        // console.log("uniqueMonth->", uniqueMonths);

        // Get unique years
        const uniqueYears = [
          "All",
          ...new Set(
            data.map((quiz) => new Date(quiz.startTime).getFullYear())
          ),
        ];
        setYear(uniqueYears);
        // console.log("uniqueYear->", uniqueYears);
      } else {
        console.error("Failed to fetch user quizes. Status:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch user quizes:", error);
    } finally {
      setLoading(false); // Set loading to false after fetch completes
    }
  };

  useEffect(() => {
    fetchUserQuizes();
  }, [user, selectedCategories, selectedStatus, selectedMonth, selectedYear]);

  useEffect(() => {
    let filtered = userQuizes;

    if (selectedCategories !== "All") {
      filtered = filtered.filter(
        (quiz) => quiz.category === selectedCategories
      );
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter((quiz) => {
        if (
          selectedStatus === "Upcoming" &&
          quiz.startTime > new Date().toISOString() &&
          quiz.endTime > new Date().toISOString()
        ) {
          return true;
        } else if (
          selectedStatus === "Live" &&
          quiz.startTime < new Date().toISOString() &&
          quiz.endTime > new Date().toISOString()
        ) {
          return true;
        } else if (
          selectedStatus === "Ended" &&
          quiz.startTime < new Date().toISOString() &&
          quiz.endTime < new Date().toISOString()
        ) {
          return true;
        }
        return false;
      });
    }

    if (selectedMonth !== "All") {
      filtered = filtered.filter((quiz) => {
        return (
          new Date(quiz.startTime).toLocaleString("default", {
            month: "long",
          }) === selectedMonth
        );
      });
    }

    if (selectedYear !== "All") {
      filtered = filtered.filter((quiz) => {
        return (
          new Date(quiz.startTime).getFullYear() === parseInt(selectedYear)
        );
      });
    }

    setFilteredQuizes(filtered);
  }, [
    userQuizes,
    selectedCategories,
    selectedStatus,
    selectedMonth,
    selectedYear,
  ]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleStatusDropdown = () => setIsStatusOpen(!isStatusOpen);
  const toggleMonthDropdown = () => setIsMonthOpen(!isMonthOpen);
  const toggleYearDropdown = () => setIsYearOpen(!isYearOpen);

  const handleCategoryClick = (category) => {
    setSelectedCategories(category);
    if (category === "All") {
      setFilteredQuizes(userQuizes);
    } else {
      const filtered = userQuizes.filter((quiz) => quiz.category === category);
      setFilteredQuizes(filtered);
    }
    setIsOpen(false);
  };

  const handleStatusClick = (status) => {
    setSelectedStatus((prevStatus) => (prevStatus === status ? "All" : status));
    setIsStatusOpen(false);
  };

  const handleMonthClick = (month) => {
    setSelectedMonth((prevMonth) => (prevMonth === month ? "All" : month));
    setIsMonthOpen(false);
  };

  const handleYearClick = (year) => {
    setSelectedYear((prevYear) => (prevYear === year ? "All" : year));
    setIsYearOpen(false);
  };

  const handleSearchQuery = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const filtered = userQuizes.filter((quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredQuizes(filtered);
  }, [searchQuery]);

  // const convertToIST = (dateString) => {
  //   const date = new Date(dateString);
  //   const options = {
  //     timeZone: "Asia/Kolkata",
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //   };
  //   const formattedDate = date.toLocaleString("en-IN", options);
  //   return formattedDate.replace(/am|pm/g, (match) => match.toUpperCase());
  // };

  const convertToIST = (dateString, includeDate = true) => {
    const date = new Date(dateString);
    const options = {
      timeZone: "Asia/Kolkata",
      year: includeDate ? "numeric" : undefined,
      month: includeDate ? "long" : undefined,
      day: includeDate ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    const formattedDate = date.toLocaleString("en-IN", options);
    return formattedDate.replace(/am|pm/g, (match) => match.toUpperCase());
  };

  const TrimString = (str) => {
    if (!str) {
      return "";
    }
    const maxLength = 80;
    return str.length > maxLength ? str.substring(0, maxLength) + "...." : str;
  };
  return (
    <div>
      <Navbar />
      <div className={styles.mainSidebarIncluded}>
        <SideBar />

        <div className={styles.main}>
          {/* header */}
          <div className={styles.homeHeader}>
            <div>
              <div className={styles.title}>Contests</div>
              {/* <p>Total Contest : {filteredQuizes.length}</p> */}
            </div>
            <div>
              <button
                className={styles.contestBtn}
                onClick={() => navigate("/create-quiz")}
              >
                {" "}
                {/* <img src={plus} alt="" className={styles.plus} /> Create Contest{" "} */}
                <FaPlus /> Create Contest
              </button>
            </div>
          </div>

          {/* Search bar and filters */}
          <div className={styles.searchBarAndFilter}>
            {/* search bar */}
            <div className={styles.searchContainer}>
              <IoIosSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search Contest"
                className={styles.searchInput}
                value={searchQuery}
                onChange={handleSearchQuery}
              />
            </div>
            <div className={styles.filterContainer}>
              {/* Category Dropdown */}

              <DropDown
                dropDownType="Category"
                openClose={isOpen}
                options={categories}
                selectedOptions={selectedCategories}
                handleClick={handleCategoryClick}
                toggleDropdown={toggleDropdown}
                width="115px"
                dropdownMenuWidth="150px"
              />

              {/* Status Dropdown */}
              <DropDown
                dropDownType="Status"
                openClose={isStatusOpen}
                options={status}
                selectedOptions={selectedStatus}
                handleClick={handleStatusClick}
                toggleDropdown={toggleStatusDropdown}
                width="91px"
                dropdownMenuWidth="115px"
              />
              {/* Month dropdown */}

              <DropDown
                dropDownType="Month"
                openClose={isMonthOpen}
                options={months}
                selectedOptions={selectedMonth}
                handleClick={handleMonthClick}
                toggleDropdown={toggleMonthDropdown}
                width="91px"
                dropdownMenuWidth="115px"
              />
              {/* Year dropdown */}
              <DropDown
                dropDownType="Year"
                openClose={isYearOpen}
                options={years}
                selectedOptions={selectedYear}
                handleClick={handleYearClick}
                toggleDropdown={toggleYearDropdown}
                width="91px"
                dropdownMenuWidth="115px"
              />
            </div>
          </div>

          {/* Quizzes */}
          {loading ? (
            <div className={styles.Loader}>
              <Loader />
            </div>
          ) : (
            <div className={styles.allQuizes}>
              <div className={styles.quizes}>
                {filteredQuizes.map((quiz) => (
                  <div key={quiz._id} className={styles.quiz}>
                    <div className={styles.quizTitle}>{quiz.title}</div>
                    <div
                      className={styles.quizDescription}
                      dangerouslySetInnerHTML={{
                        __html: marked(TrimString(quiz.description)),
                      }}
                    ></div>
                    {/* <span>
                        Start Time: {convertToIST(quiz.startTime, false)}
                        </span>
                        <span>End Time: {convertToIST(quiz.endTime, false)}</span> */}
                    <div className={styles.timeAndButtons}>
                      <span className={styles.quizTiming}>
                        {console.log(quiz.startTime)}
                        Date:
                        {new Date(quiz.startTime).toLocaleDateString("en-GB")}
                      </span>
                      <div className={styles.quizActions}>
                        <button
                          onClick={() => setShowConfirmationModel(true)}
                          className={styles.deleteBtn}
                        >
                          Delete
                        </button>
                        <button
                          className={styles.viewBtn}
                          onClick={() => navigate(`/quiz/${quiz._id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                    {showConfirmation && (
                      <ConfimationModal
                        setShowConfirmationModel={setShowConfirmationModel}
                        fetchUserQuizes={fetchUserQuizes}
                        quizID={quiz._id}
                        userQuizes={userQuizes}
                      />
                    )}
                  </div>
                ))}

                {userQuizes.length === 0 && (
                  <div className={styles.noQuizes}>
                    You have not created any quizes yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
