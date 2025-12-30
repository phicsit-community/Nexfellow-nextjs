// import React from "react";

// const Pagination = ({ totalPages, currentPage, onPageChange }) => {
//   const handlePageChange = (page) => {
//     if (page > 0 && page <= totalPages) {
//       onPageChange(page);
//     }
//   };

//   const getVisiblePages = () => {
//     const pages = [];
//     const startPage = Math.max(1, currentPage - 1);
//     const endPage = Math.min(totalPages, startPage + 2);

//     for (let i = startPage; i <= endPage; i++) {
//       pages.push(i);
//     }

//     return pages;
//   };

//   const visiblePages = getVisiblePages();

//   return (
//     <div style={styles.paginationContainer}>
//       <button
//         onClick={() => handlePageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//         style={styles.arrowButton}
//       >
//         &#10094;
//       </button>

//       {visiblePages.map((page) => (
//         <button
//           key={page}
//           onClick={() => handlePageChange(page)}
//           style={{
//             ...styles.pageButton,
//             ...(currentPage === page ? styles.activePageButton : {}),
//           }}
//         >
//           {String(page).padStart(2, "0")}
//         </button>
//       ))}

//       <button
//         onClick={() => handlePageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//         style={styles.arrowButton}
//       >
//         &#10095;
//       </button>
//     </div>
//   );
// };

// const styles = {
//   paginationContainer: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: "10px",
//     margin: "40px 0",
//   },
//   arrowButton: {
//     border: "none",
//     backgroundColor: "transparent",
//     cursor: "pointer",
//     fontSize: "18px",
//     color: "#009688",
//     padding: "10px 20px",
//   },
//   pageButton: {
//     width: "30px",
//     height: "30px",
//     border: "1px solid #009688",
//     borderRadius: "5px",
//     backgroundColor: "#fff",
//     color: "#333",
//     fontSize: "16px",
//     cursor: "pointer",
//   },
//   activePageButton: {
//     backgroundColor: "#f5f5f5",
//   },
// };

// export default Pagination;

// import React from "react";

// const Pagination = ({ totalPages, currentPage, onPageChange }) => {
//   const handlePageChange = (page) => {
//     if (page > 0 && page <= totalPages) {
//       onPageChange(page);
//     }
//   };

//   const getVisiblePages = () => {
//     const pages = [];
//     let startPage = Math.max(1, currentPage - 1);
//     let endPage = Math.min(totalPages, currentPage + 1);

//     // Adjust the visible pages to ensure we always show 3 buttons
//     if (totalPages <= 3) {
//       // Show all pages if total pages are less than or equal to 3
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       // Ensure 3 buttons are displayed, including disabled buttons as needed
//       if (currentPage === 1) {
//         pages.push(1, 2, totalPages); // Always show the last page as a fallback
//       } else if (currentPage === totalPages) {
//         pages.push(1, totalPages - 1, totalPages); // Always show the first page as a fallback
//       } else {
//         pages.push(startPage, currentPage, endPage);
//       }
//     }

//     return pages;
//   };

//   const visiblePages = getVisiblePages();

//   return (
//     <div style={styles.paginationContainer}>
//       <button
//         onClick={() => handlePageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//         style={styles.arrowButton}
//       >
//         &#10094;
//       </button>

//       {visiblePages.map((page) => (
//         <button
//           key={page}
//           onClick={() => handlePageChange(page)}
//           style={{
//             ...styles.pageButton,
//             ...(page === currentPage ? styles.activePageButton : {}),
//             ...(page === totalPages && currentPage !== totalPages ? styles.disabledPageButton : {}),
//           }}
//           disabled={page === totalPages && currentPage !== totalPages}
//         >
//           {page}
//         </button>
//       ))}

//       <button
//         onClick={() => handlePageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//         style={styles.arrowButton}
//       >
//         &#10095;
//       </button>
//     </div>
//   );
// };

// const styles = {
//   paginationContainer: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     margin: "20px 0",
//   },
//   arrowButton: {
//     background: "transparent",
//     border: "none",
//     fontSize: "24px",
//     cursor: "pointer",
//     opacity: 0.7,
//   },
//   pageButton: {
//     margin: "0 5px",
//     padding: "8px 16px",
//     border: "1px solid #A7D7D5",
//     borderRadius: "4px",
//     cursor: "pointer",
//     background: "#f0f0f0",
//     transition: "background-color 0.3s",
//   },
//   activePageButton: {
//     background: "#A7D7D5",
//     color: "#fff",
//     border: "none",
//   },
//   disabledPageButton: {
//     opacity: 0.5,
//     cursor: "not-allowed",
//   },
// };

// export default Pagination;

import React, { useState, useEffect } from "react";

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  const [activePage, setActivePage] = useState(currentPage);

  useEffect(() => {
    setActivePage(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setActivePage(page); // Set the active button's background color
      onPageChange(page);
    }
  };

  const getVisiblePages = () => {
    const pages = [];


    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (activePage === 1) {
        pages.push(1, 2, 3);
      } else if (activePage === totalPages) {
        pages.push(totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(activePage - 1, activePage, activePage + 1);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div style={styles.paginationContainer}>
      <button
        onClick={() => handlePageChange(activePage - 1)}
        disabled={activePage === 1}
        style={styles.arrowButton}
      >
        &#10094;
      </button>

      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          style={{
            ...styles.pageButton,
            ...(page === activePage ? styles.activePageButton : {}),
          }}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => handlePageChange(activePage + 1)}
        disabled={activePage === totalPages}
        style={styles.arrowButton}
      >
        &#10095;
      </button>
    </div>
  );
};

const styles = {
  paginationContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "20px 0",
  },
  arrowButton: {
    background: "transparent",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    opacity: 0.7,
    margin : '0px 10px'
  },
  pageButton: {
    margin: "0 5px",
    padding: "8px 16px",
    border: "1px solid #A7D7D5",
    borderRadius: "4px",
    cursor: "pointer",
    background: "#f0f0f0",
    transition: "background-color 0.3s",
  },
  activePageButton: {
    background: "#A7D7D5", // Highlighted background color for the active button
    color: "#fff",
    border: "none",
  },
};

export default Pagination;
