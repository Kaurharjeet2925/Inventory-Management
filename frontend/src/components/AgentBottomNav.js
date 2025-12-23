import React from "react";
import { Home, Truck, History, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const AgentBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: "Home", icon: Home, path: "/agent/agent-dashboard" },
    { name: "Deliveries", icon: Truck, path: "/agent/deliveries-history" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-lg py-2 flex justify-around z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname.startsWith(tab.path); // ✅ FIX

        return (
          <button
            key={tab.name}
            className="flex flex-col items-center"
            onClick={() => navigate(tab.path)}
          >
            <Icon
              className={`w-6 h-6 ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`}
            />
            <span
              className={`text-xs ${
                isActive ? "text-blue-600 font-semibold" : "text-gray-600"
              }`}
            >
              {tab.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default AgentBottomNav;