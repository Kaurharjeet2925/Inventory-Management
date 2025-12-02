import React from "react";
import { LogOut } from "lucide-react";

const Header = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="fixed top-0 left-0 right-0 md:left-64 md:w-[calc(100%-16rem)] bg-white shadow-md h-16 flex items-center justify-end px-4 md:px-6 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <LogOut size={18} />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
