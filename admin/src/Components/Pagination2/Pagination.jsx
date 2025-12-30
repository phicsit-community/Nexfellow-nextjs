// import React, { useState } from 'react';

// const Pagination = ({ totalPages }) => {
//   const [currentPage, setCurrentPage] = useState(1);

//   // Function to get the page numbers to display based on current page
//   const getPageNumbers = () => {
//     const maxButtons = 3; // Number of buttons to display at a time
//     let start = Math.max(1, currentPage - 1);
//     let end = Math.min(totalPages, start + maxButtons - 1);

//     if (end - start < maxButtons - 1) {
//       start = Math.max(1, end - maxButtons + 1);
//     }

//     const pageNumbers = [];
//     for (let i = start; i <= end; i++) {
//       pageNumbers.push(i);
//     }
//     return pageNumbers;
//   };

//   // Handler for setting the current page
//   const goToPage = (page) => {
//     setCurrentPage(page);
//   };

//   // Handler for going to the next page
//   const goToNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage((prevPage) => prevPage + 1);
//     }
//   };

//   // Handler for going to the previous page
//   const goToPrevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage((prevPage) => prevPage - 1);
//     }
//   };

//   return (
//     <div className="flex items-center space-x-2">
//       <button
//         onClick={goToPrevPage}
//         disabled={currentPage === 1}
//         className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
//       >
//         Prev
//       </button>

//       {getPageNumbers().map((page) => (
//         <button
//           key={page}
//           onClick={() => goToPage(page)}
//           className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
//         >
//           {page}
//         </button>
//       ))}

//       <button
//         onClick={goToNextPage}
//         disabled={currentPage === totalPages}
//         className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
//       >
//         Next
//       </button>
//     </div>
//   );
// };

// export default Pagination;

import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Determine the range of page numbers to display
  const getPageNumbers = () => {
    const maxButtons = 3; // Number of buttons to display at a time
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    const pageNumbers = [];
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
    >
      <button onClick={handlePrevious} disabled={currentPage === 1}>
        Previous
      </button>
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            margin: "0 5px",
            padding: "5px 10px",
            backgroundColor: currentPage === page ? "#007bff" : "#f0f0f0",
            color: currentPage === page ? "#fff" : "#000",
            border: "1px solid #ddd",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {page}
        </button>
      ))}
      <button onClick={handleNext} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  );
};

export default Pagination;
