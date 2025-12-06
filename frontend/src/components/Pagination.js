import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg shadow-sm">

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
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded border 
            ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-200"}`}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
