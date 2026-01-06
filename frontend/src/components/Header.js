import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Menu } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { apiClient } from "../apiclient/apiclient";

const Header = ({ onMenuClick }) => {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState(null);
  const ref = useRef(null);

  /* ================= LOAD COMPANY ================= */
  useEffect(() => {
    const loadCompany = async () => {
      try {
        const res = await apiClient.get("/settings/company");
        setCompany(res.data);
      } catch (err) {
        console.error("Failed to load company");
      }
    };
    loadCompany();
  }, []);

  /* ================= CLOSE DROPDOWN ================= */
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
    localStorage.clear();
    window.location.href = "/";
  };

  const stored = JSON.parse(
    localStorage.getItem("agent") ||
      localStorage.getItem("user") ||
      localStorage.getItem("auth") ||
      "{}"
  );

  const displayName =
    stored?.name || stored?.firstName || stored?.email || "Admin";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-blue-950 border-b border-blue-900 z-50">
      <div className="h-full flex items-center justify-between px-6">

        {/* LEFT: BRAND (ALIGNED WITH SIDEBAR) */}
        <div className="flex items-center gap-4 ">
          {/* Mobile Menu */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-md text-slate-200 hover:bg-amber-500/10"
          >
            <Menu size={22} />
          </button>

          {/* LOGO */}
           <img
            src={
              company?.logo
                ? `${process.env.REACT_APP_IMAGE_URL}/${company.logo}`
                : `${process.env.PUBLIC_URL}/logo192.png`
            }
            alt="Company Logo"
            className="h-10 w-10 object-contain rounded-md bg-white p-1 shadow-sm"
          />

          <span className="sm:text-lg text-base font-semibold text-white">
            {company?.companyName || "Inventory Control System"}
          </span>
        </div>

        {/* RIGHT: USER */}
        <div className="flex items-center gap-3" ref={ref}>
          <NotificationBell />

          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-amber-500/10"
          >
            <div className="w-9 h-9 rounded-full bg-blue-900/50 text-blue-200 flex items-center justify-center font-semibold">
              {initials}
            </div>

            <span className="hidden md:inline text-sm text-slate-200">
              {displayName}
            </span>

            <ChevronDown size={16} className="text-slate-400" />
          </button>

          {open && (
            <div className="absolute right-6 top-14 w-40 bg-blue-950 border border-blue-900 rounded-md shadow-lg">
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left text-red-400 hover:bg-amber-500/10"
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
