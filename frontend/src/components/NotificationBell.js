import React, { useContext, useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { NotificationContext } from "../context/NotificationContext";
import { apiClient } from "../apiclient/apiclient";

const NotificationBell = () => {
  const { notifications, setNotifications } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);

  // ✅ SINGLE SOURCE OF TRUTH
  const unreadCount = notifications.length;

  /* LOAD UNREAD NOTIFICATIONS ON LOGIN */
  useEffect(() => {
    const loadUnread = async () => {
      try {
        const res = await apiClient.get("/notifications?unread=true");
        setNotifications(res.data.notifications || []);
      } catch (e) {
        console.error("Failed to load notifications");
      }
    };
    loadUnread();
  }, [setNotifications]);

  const handleClearAll = async () => {
    await apiClient.put("/notifications/mark-all-read");
    setNotifications([]);
  };

  const handleRemove = async (index) => {
    const notif = notifications[index];
    if (notif?._id) {
      await apiClient.put(`/notifications/${notif._id}/read`);
    }
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50">
          <div className="p-3 flex justify-between border-b">
            <span className="font-bold">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleClearAll} className="text-sm text-red-500">
                Clear All
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((n, i) => (
              <div
                key={i}
                className="p-3 flex justify-between hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={() => handleRemove(i)}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
