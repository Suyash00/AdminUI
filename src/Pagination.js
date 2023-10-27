import React from "react";

function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={i === currentPage ? "active" : ""}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="pagination-container">
      <button onClick={() => handlePageChange(1)}>First</button>
      <button onClick={() => handlePageChange(currentPage - 1)}>
        Previous
      </button>
      {renderPageNumbers()}
      <button onClick={() => handlePageChange(currentPage + 1)}>Next</button>
      <button onClick={() => handlePageChange(totalPages)}>Last</button>
    </div>
  );
}

export default Pagination;
