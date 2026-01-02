import React from "react";

<<<<<<< Updated upstream
const ThemedTable = ({ className = "", children, ...props }) => {
  // base classes ensure consistent sizing and typography
  const base = "w-full text-xs sm:text-sm";

  return (
    <table className={`${base} ${className}`} {...props}>
      {children}
    </table>
=======
const ThemedTable = ({ children, className = "" }) => {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table
          className={`w-full text-sm text-gray-800 border-collapse ${className}`}
        >
          {children}
        </table>
      </div>
    </div>
>>>>>>> Stashed changes
  );
};

export default ThemedTable;
