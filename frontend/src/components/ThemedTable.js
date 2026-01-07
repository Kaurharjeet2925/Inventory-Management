import React from "react";

const ThemedTable = ({ children, className = "" }) => {
  return (
    <div className="relative w-full">
  <table className="min-w-[900px] md:min-w-full">

        {children}
      </table>
    </div>
  );
};

export default ThemedTable;
