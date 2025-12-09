import React, { useContext } from "react";
import { Bell, LogOut } from "lucide-react";
import { NotificationContext } from "../context/NotificationContext";
import NotificationBell from "./NotificationBell";

const AgentNavbar = () => {
  const { notifications = [] } = useContext(NotificationContext) || {};
  const unreadCount = notifications.length || 0;

  return (
    <div className="fixed top-0 left-0 w-full bg-white shadow-md p-4 z-50 flex justify-between items-center">

      
      <h2 className="text-xl font-bold text-blue-600">
        Agent Panel
      </h2>

      
      <div className="flex items-center gap-5">

      
        <NotificationBell />

        
        <button className="text-red-600 hover:text-red-800">
          <LogOut className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
};

export default AgentNavbar;
