import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../apiclient/apiclient";
import socket from "../../../socket/socketClient";
import { Clock, Truck, PackageCheck, CheckCircle } from "lucide-react";

/* ---------------- GREETING ---------------- */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const AgentDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const userName = (user?.name || "Agent").toUpperCase();

  const [greeting, setGreeting] = useState("");
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    shipped: 0,
    delivered: 0,
    completed: 0,
  });

  /* ---------------- LOAD DASHBOARD SUMMARY ---------------- */
  const loadDashboardData = async () => {
    try {
      const res = await apiClient.get(
        "/agent-dashboard-summary"
      );
      setStatusCounts(res.data.statusCounts);
    } catch (err) {
      console.error("Failed to load agent summary", err);
    }
  };

  /* ---------------- GREETING LOGIC ---------------- */
  useEffect(() => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem("agentDashboardLastVisit");

    if (lastVisit !== today) {
      setGreeting(getGreeting());
      localStorage.setItem("agentDashboardLastVisit", today);
    } else {
      setGreeting("Welcome back");
    }
  }, []);

  /* ---------------- REALTIME SOCKET UPDATES ---------------- */
  useEffect(() => {
    loadDashboardData();

    const refresh = () => loadDashboardData();

    const events = [
      "order_created",
      "order_updated",
      "order_status_updated",
      "order_deleted",
      "order_collected",
    ];

    events.forEach((ev) => socket.on(ev, refresh));
    socket.on("connect", refresh);

    return () => {
      events.forEach((ev) => socket.off(ev, refresh));
      socket.off("connect", refresh);
    };
  }, []);

  /* ---------------- TABS ---------------- */
  const tabs = [
    {
      key: "pending",
      label: "Pending",
      count: statusCounts.pending,
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      color: "bg-orange-50 border-orange-300",
      path: "/agent/deliveries/pending",
    },
    {
      key: "shipped",
      label: "Shipped",
      count: statusCounts.shipped,
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50 border-blue-300",
      path: "/agent/deliveries/shipped",
    },
    {
      key: "delivered",
      label: "Delivered",
      count: statusCounts.delivered,
      icon: <PackageCheck className="w-6 h-6 text-purple-600" />,
      color: "bg-purple-50 border-purple-300",
      path: "/agent/deliveries/delivered",
    },
    {
      key: "completed",
      label: "Completed",
      count: statusCounts.completed,
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      color: "bg-green-50 border-green-300",
      path: "/agent/deliveries/completed",
    },
  ];

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          {greeting}, {userName}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here’s your delivery overview for today.
        </p>
      </div>

      <h2 className="text-xl font-bold mb-4">Delivery Dashboard</h2>

      {/* CARDS */}
      <div className="grid grid-cols-1 gap-4">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            onClick={() => navigate(tab.path)}
            className={`p-4 rounded-xl shadow-sm cursor-pointer border transition hover:shadow-md ${tab.color}`}
          >
            <div className="flex items-center gap-4">
              {tab.icon}
              <div>
                <p className="font-semibold text-gray-800">{tab.label}</p>
                <p className="text-lg font-bold text-gray-700">
                  {tab.count} Orders
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentDashboard;
