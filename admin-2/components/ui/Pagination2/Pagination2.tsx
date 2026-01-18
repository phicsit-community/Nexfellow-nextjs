'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination2: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPageNumbers = () => {
    const maxButtons = 3;
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
      style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
    >
      <button onClick={handlePrevious} disabled={currentPage === 1}>
        Previous
      </button>
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            margin: '0 5px',
            padding: '5px 10px',
            backgroundColor: currentPage === page ? '#007bff' : '#f0f0f0',
            color: currentPage === page ? '#fff' : '#000',
            border: '1px solid #ddd',
            borderRadius: '5px',
            cursor: 'pointer',
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

export default Pagination2;
