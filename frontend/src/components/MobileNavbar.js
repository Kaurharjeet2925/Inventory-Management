import React from "react";
import { Menu } from "lucide-react";

const MobileNavbar = ({ onMenuClick, title }) => {
  return (
    <div className="md:hidden fixed top-0 left-0 w-full h-14 bg-white border-b flex items-center px-4 z-50">
      <button onClick={onMenuClick} className="mr-3">
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      <h1 className="text-lg font-semibold text-gray-800">
        {title}
      </h1>
    </div>
  );
};

export default MobileNavbar;
