import React, { useContext, useState } from "react";
import { Bell, X } from "lucide-react";
import { NotificationContext } from "../context/NotificationContext";

const NotificationBell = () => {
  const { notifications, setNotifications } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleRemoveNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition"
        title="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white">
            <h3 className="text-lg font-bold">Notifications ({unreadCount})</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-red-500 hover:text-red-700 font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Notifications List */}
          {unreadCount === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell size={32} className="mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif, idx) => (
                <div
                  key={idx}
                  className="p-3 hover:bg-gray-50 flex justify-between items-start gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 break-words">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveNotification(idx)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    title="Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Close on outside click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
