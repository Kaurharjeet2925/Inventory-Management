import { createContext, useState, useEffect, useRef } from "react";
import socket from "../socket/socketClient";
import { apiClient } from "../apiclient/apiclient";
import { toast } from "react-toastify";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const isInitialLoadRef = useRef(true);
  const audioRef = useRef(null);
  const audioUnlockedRef = useRef(false);

  /* 🔊 INIT AUDIO + UNLOCK ON USER CLICK */
  useEffect(() => {
    audioRef.current = new Audio("/notification_sound.mp3");

    const unlockAudio = () => {
      if (!audioUnlockedRef.current && audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioUnlockedRef.current = true;
          })
          .catch(() => {});
      }
      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
    return () => window.removeEventListener("click", unlockAudio);
  }, []);

  /* 📥 LOAD UNREAD (NO TOAST) */
  async function loadUnread() {
    try {
      const res = await apiClient.get("/notifications?unread=true&limit=20");
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Failed to load unread notifications", err);
    }
  }

  /* 🔔 SOCKET LISTENER */
  useEffect(() => {
    const handler = (data) => {
      console.log("🔔 Notification received:", data._id);

      setNotifications((prev) => [data, ...prev]);

      // ❌ no toast/sound on initial load
      if (isInitialLoadRef.current) return;

      // 🔊 sound
      if (audioUnlockedRef.current && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      // 📢 toast
      toast.info(data.message, {
        position: "top-right",
        autoClose: 4000,
        pauseOnHover: true,
      });
    };

    // ✅ prevent duplicate listeners
    socket.off("notification", handler);
    socket.on("notification", handler);

    loadUnread();
    socket.on("connect", loadUnread);

    isInitialLoadRef.current = false;

    return () => {
      socket.off("notification", handler);
      socket.off("connect", loadUnread);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        loadUnread,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
