import React, { useContext } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../context/NotificationContext";
import NotificationBell from "./NotificationBell";
import socket from "../socket/socketClient";

const AgentNavbar = () => {
  const navigate = useNavigate();
  const { notifications = [] } = useContext(NotificationContext) || {};

  const handleLogout = () => {
    // 1️⃣ Clear stored auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 2️⃣ Disconnect socket (important for agent)
    if (socket?.connected) {
      socket.disconnect();
    }

    // 3️⃣ Redirect to login
    navigate("/");
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-white shadow-md p-4 z-50 flex justify-between items-center">

      <h2 className="text-xl font-bold text-blue-600">
        Agent Panel
      </h2>

      <div className="flex items-center gap-5">
        <NotificationBell />

        {/* 🔴 LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="text-red-600 hover:text-red-800"
          title="Logout"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default AgentNavbar;
