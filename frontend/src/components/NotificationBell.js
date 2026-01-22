import React, { useContext, useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../context/NotificationContext";
import { apiClient } from "../apiclient/apiclient";

const NotificationBell = () => {
  const { notifications, setNotifications } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ unread count (CORRECT)
  const unreadCount = notifications.filter((n) => !n.read).length;

  /* LOAD UNREAD NOTIFICATIONS ON LOGIN */
  useEffect(() => {
    const loadUnread = async () => {
      try {
        const res = await apiClient.get("/notifications?unread=true&limit=8");
        setNotifications(res.data.data || []);
      } catch (e) {
        console.error("Failed to load notifications", e);
      }
    };

    loadUnread();
  }, [setNotifications]);

  /* MARK ALL AS READ (DO NOT DELETE) */
  const handleClearAll = async () => {
    await apiClient.put("/notifications/mark-all-read");
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  /* MARK SINGLE AS READ */
  const handleMarkRead = async (id) => {
    await apiClient.put(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="relative">
      {/* 🔔 BELL */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell size={22} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 📋 DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50">
          {/* HEADER */}
          <div className="p-3 flex justify-between items-center border-b">
            <span className="font-semibold">Notifications</span>

            {unreadCount > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-red-500 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {/* LIST */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications
              </div>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <div
                  key={n._id}
                  className={`p-3 flex justify-between border-b hover:bg-gray-50 ${
                    !n.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm">{n.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {!n.read && (
                    <X
                      size={14}
                      className="cursor-pointer text-gray-500 hover:text-black"
                      onClick={() => handleMarkRead(n._id)}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* VIEW ALL */}
          <div className="border-t p-2 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/activity");
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
