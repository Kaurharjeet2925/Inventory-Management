import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center mt-4">
      <div className="flex items-center gap-2  px-4 py-2 rounded-lg shadow-md">

        {/* Previous Button */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded border 
            ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-200"}`}
        >
          &lt;
        </button>

        {/* Page Numbers */}
        {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`px-3 py-1 rounded font-semibold ${
              currentPage === page
                ? "bg-blue-900 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-3 py-1 rounded border 
            ${currentPage === totalPages || totalPages === 0
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-gray-200"}`}
        >
          &gt;
        </button>

      </div>
    </div>
  );
};

export default Pagination;
