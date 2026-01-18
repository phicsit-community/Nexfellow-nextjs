'use client';

import React, { useState, useEffect, CSSProperties } from "react";

interface PaginationProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, onPageChange }) => {
    const [activePage, setActivePage] = useState(currentPage);

    useEffect(() => {
        setActivePage(currentPage);
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setActivePage(page);
            onPageChange(page);
        }
    };

    const getVisiblePages = () => {
        const pages: number[] = [];

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

const styles: { [key: string]: CSSProperties } = {
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
        margin: '0px 10px'
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
        background: "#A7D7D5",
        color: "#fff",
        border: "none",
    },
};

export default Pagination;
