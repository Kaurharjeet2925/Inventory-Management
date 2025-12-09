import React, { useState, useRef, useEffect } from "react";
import { UserCircle, ChevronDown } from "lucide-react";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    // Clear auth + redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("agent");
    localStorage.removeItem("user");
    localStorage.removeItem("auth");
    window.location.href = "/login";
  };

  // get current user display name from localStorage
  const stored = JSON.parse(localStorage.getItem("agent") || localStorage.getItem("user") || localStorage.getItem("auth") || "{}");
  const displayName = stored?.name || stored?.firstName || stored?.email || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white shadow flex items-center justify-end px-6 z-50">

      <div className="flex items-center gap-4">
        <NotificationBell />

        {/* Profile area: avatar + name + caret */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((s) => !s)}
            className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition"
            aria-label="Profile"
          >
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-semibold">
              {initials}
            </div>
            <span className="hidden md:inline text-sm font-medium text-gray-700">{displayName}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border z-50">
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded hover:bg-red-50 text-red-600 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
