"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "../../lib/axios";

//icons
import { FaChevronRight } from "react-icons/fa";
import { FaChevronLeft } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";

//components
import ContestData from "../../components/contestdata/ContestData";
import ContestCardSkeleton from "../../components/Skeleton/ContestCardSkeleton";
import BackButton from "../../components/BackButton/BackButton";

//styles
import styles from "./AllContestList.module.css";

const Contest = () => {
  const params = useParams();
  const type = params?.type || "upcoming";

  const formatType = type.charAt(0).toUpperCase() + type.slice(1);

  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState("All");
  const [isOpen, setIsOpen] = useState(false);

  const itemsPerPage = 6;
  // Skeleton array for placeholder cards
  const skeletonArray = Array(itemsPerPage).fill(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/quiz/getAllQuizzes");
        if (response.status === 200) {
          const data = response.data;
          const updatedQuizzes = data.map((quiz) => {
            const now = Date.now();
            const startTime = new Date(quiz.startTime).getTime();
            const endTime = new Date(quiz.endTime).getTime();

            if (startTime < now && endTime > now) {
              quiz.status = "Live";
            } else if (startTime > now) {
              quiz.status = "Upcoming";
            } else if (endTime < now) {
              quiz.status = "Past";
            }

            return quiz;
          });

          let filteredQuizzes = updatedQuizzes.filter((quiz) => {
            if (formatType === "Upcoming") {
              return quiz.status === "Live" || quiz.status === "Upcoming";
            }
            return quiz.status === formatType;
          });

          // Set categories
          const categoryList = updatedQuizzes.map((quiz) => quiz.category);
          const uniqueCategories = ["All", ...new Set(categoryList)];
          setCategories(uniqueCategories);
          console.log(uniqueCategories);

          // Filter by category
          if (selectedCategories !== "All") {
            filteredQuizzes = filteredQuizzes.filter(
              (quiz) => quiz.category === selectedCategories
            );
          }

          const sortingFilterData = filteredQuizzes.sort((a, b) => {
            return new Date(b.startTime) - new Date(a.startTime);
          });

          setFilteredData(sortingFilterData);
        }
      } catch (error) {
        setError("Failed to fetch data");
      } finally {
        // Add a slight delay to show the skeleton loading effect
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
    };

    fetchData();
  }, [type, selectedCategories, formatType]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleCategoryClick = (category) => {
    setSelectedCategories(category);
    setIsOpen(false);
  };
  return (
    <div className={styles.container}>

      {/* Category Dropdown */}
      <div className={styles.dropdownContainer}>
        <BackButton />
        <button className={styles.dropdownButton} onClick={toggleDropdown}>
          Category{" "}
          <span className={styles.arrowDown}>
            <IoIosArrowDown />
          </span>
        </button>
        {isOpen && (
          <div className={styles.dropdownMenu}>
            {categories.map((option) => (
              <label className={styles.dropdownItem} key={option}>
                <input
                  type="checkbox"
                  name="category"
                  checked={selectedCategories === option}
                  onChange={() => handleCategoryClick(option)}
                />
                {option}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Contest Cards Section */}
      <div className={styles.cardsWrapper}>
        {loading ? (
          <>
            {skeletonArray.map((_, index) => (
              <div className={styles.cardContainer} key={index}>
                <ContestCardSkeleton />
              </div>
            ))}
          </>
        ) : error ? (
          <p>{error}</p>
        ) : (
          currentItems.map((quiz, index) => (
            <div className={styles.cardContainer} key={index}>
              <ContestData contest={quiz} />
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && (
        <div className={styles.pagination}>
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={styles.navButton}
          >
            <FaChevronLeft />
          </button>

          {[
            currentPage === 1 ? currentPage : currentPage - 1,
            currentPage === 1 ? currentPage + 1 : currentPage,
            currentPage === 1 ? currentPage + 2 : currentPage + 1,
            currentPage === 1 ? currentPage + 3 : currentPage + 2,
          ]
            .filter((page) => page > 0 && page <= totalPages)
            .map((page) => (
              <div
                key={page}
                className={`${styles.pageNumber} ${page === currentPage ? styles.activePage : ""
                  }`}
                onClick={() => setCurrentPage(page)}
              >
                {page < 10 ? `0${page}` : page}
              </div>
            ))}

          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className={styles.navButton}
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default Contest;
