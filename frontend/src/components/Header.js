import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu } from "lucide-react";
import NotificationBell from "./NotificationBell";

const Header = ({ onMenuClick }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("agent");
    localStorage.removeItem("user");
    localStorage.removeItem("auth");
    window.location.href = "/";
  };

  // get user info
  const stored = JSON.parse(
    localStorage.getItem("agent") ||
      localStorage.getItem("user") ||
      localStorage.getItem("auth") ||
      "{}"
  );

  const displayName =
    stored?.name || stored?.firstName || stored?.email || "User";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header
      className="
        fixed top-0 left-0 md:left-64 right-0 h-16
        bg-blue-950
        border-b border-blue-900
        px-6 flex items-center justify-end
        z-40
      "
    >
      {/* Mobile Hamburger */}
      <button
        onClick={() => onMenuClick && onMenuClick()}
        aria-label="Open menu"
        className="
          absolute left-4 top-4 md:hidden
          p-2 rounded-md
          text-slate-200
          hover:bg-amber-500/10 hover:text-amber-300
          transition
        "
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationBell />

        {/* Profile Dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((s) => !s)}
            className="
              flex items-center gap-2 px-2 py-1 rounded-full
              hover:bg-amber-500/10
              transition
            "
          >
            {/* Avatar */}
            <div
              className="
                w-8 h-8 rounded-full
                bg-blue-900/40 text-blue-300
                flex items-center justify-center
                font-semibold text-sm
              "
            >
              {initials}
            </div>

            {/* Name */}
            <span className="hidden md:inline text-sm font-medium text-slate-200">
              {displayName}
            </span>

            <ChevronDown size={16} className="text-slate-400" />
          </button>

          {open && (
            <div
              className="
                absolute right-0 mt-2 w-40
                bg-blue-950
                border border-blue-900
                rounded-md shadow-lg
                z-50
              "
            >
              <button
                onClick={handleLogout}
                className="
                  w-full text-left px-3 py-2
                  text-red-400 font-medium
                  rounded-md
                  hover:bg-amber-500/10
                  transition
                "
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
