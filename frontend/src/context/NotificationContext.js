import { createContext, useState, useEffect } from "react";
import socket from "../socket/socketClient";
import { apiClient } from "../apiclient/apiclient";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  async function loadUnread() {
    try {
      const res = await apiClient.get('/notifications?unread=true&limit=20');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to load unread notifications', err);
    }
  }

  useEffect(() => {
    socket.on("notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    // load on mount
    loadUnread();

    // reload on reconnect
    socket.on('connect', loadUnread);

    return () => {
      socket.off("notification");
      socket.off('connect', loadUnread);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, loadUnread }}>
      {children}
    </NotificationContext.Provider>
  );
};
