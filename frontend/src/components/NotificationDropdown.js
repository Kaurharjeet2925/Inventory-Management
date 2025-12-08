import React, { useState, useRef, useEffect } from "react";
import { CheckCircle, Info } from "lucide-react";

const NotificationDropdown = ({ notifications }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        className="relative p-2 hover:bg-gray-200 rounded-full"
        onClick={() => setOpen(!open)}
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <div
        className={`absolute right-0 mt-3 w-80 bg-white shadow-xl border rounded-xl 
          transition-all duration-200 origin-top-right
          ${open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}
      >
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Notifications</h2>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-6 text-sm">
              No new notifications
            </p>
          ) : (
            notifications.map((n, i) => (
              <div
                key={i}
                className="relative p-4 border-b bg-white hover:bg-gray-50 cursor-pointer rounded-md"
              >
                <div className="flex items-start gap-3">
                  {/* Blue Info Icon */}
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Info size={18} className="text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <CheckCircle size={16} className="text-green-600" />
                      <p className="font-medium text-sm">{n.title}</p>
                    </div>

                    <p className="text-gray-600 text-sm mt-1">
                      {n.message}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                  </div>
                </div>

                {/* Bottom Progress Line */}
                <div className="absolute left-0 bottom-0 h-1 bg-blue-400 w-full animate-[progressDrop_5s_linear]"></div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tailwind Animation */}
      {/* <style>
        {`
          @keyframes progressDrop {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style> */}
    </div>
  );
};

export default NotificationDropdown;
