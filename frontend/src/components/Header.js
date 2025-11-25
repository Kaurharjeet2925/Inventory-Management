import React from "react";
import { LogOut } from "lucide-react";

const Header = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="ml-64 w-[calc(100%-16rem)] fixed top-0 right-0 bg-white shadow-md h-16 flex items-center justify-end px-6 z-40">
      
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        <LogOut size={18} />
        Logout
      </button>

    </div>
  );
};

export default Header;
