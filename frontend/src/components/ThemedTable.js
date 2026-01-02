import React from "react";

const ThemedTable = ({ className = "", children, ...props }) => {
  // base classes ensure consistent sizing and typography
  const base = "w-full text-xs sm:text-sm";

  return (
    <table className={`${base} ${className}`} {...props}>
      {children}
    </table>
  );
};

export default ThemedTable;
