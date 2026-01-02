import React from "react";

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
  );
};

export default ThemedTable;
