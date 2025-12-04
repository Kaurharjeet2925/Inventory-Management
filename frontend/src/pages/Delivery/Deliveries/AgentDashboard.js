import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../apiclient/apiclient";

import { Clock, Truck, PackageCheck, CheckCircle } from "lucide-react";

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  // LOAD ORDERS
  const loadOrders = async () => {
    try {
      const res = await apiClient.get("/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Failed to load orders");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // COUNT ORDERS BY STATUS
  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  const tabs = [
    {
      key: "pending",
      label: "Pending",
      count: stats.pending,
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      color: "bg-orange-50 border-orange-300",
      path: "/agent/deliveries/pending",
    },
    {
      key: "shipped",
      label: "Shipped",
      count: stats.shipped,
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50 border-blue-300",
      path: "/agent/deliveries/shipped",
    },
    {
      key: "delivered",
      label: "Delivered",
      count: stats.delivered,
      icon: <PackageCheck className="w-6 h-6 text-purple-600" />,
      color: "bg-purple-50 border-purple-300",
      path: "/agent/deliveries/delivered",
    },
    {
      key: "completed",
      label: "Completed",
      count: stats.completed,
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      color: "bg-green-50 border-green-300",
      path: "/agent/deliveries/completed",
    },
  ];

  return (
    <div className="p-4 mt-14">
      <h1 className="text-2xl font-bold mb-4">Delivery Dashboard</h1>

      {/* ONE CARD PER ROW */}
      <div className="grid grid-cols-1 gap-4">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            onClick={() => navigate(tab.path)}
            className={`p-4 rounded-lg shadow cursor-pointer border ${tab.color}`}
          >
            <div className="flex items-center gap-3">
              {tab.icon}
              <div>
                <p className="font-semibold">{tab.label}</p>

                {/* 🔥 SHOW ORDER COUNT INSTEAD OF 'Tap to open' */}
                <p className="text-md font-bold text-gray-700">
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
