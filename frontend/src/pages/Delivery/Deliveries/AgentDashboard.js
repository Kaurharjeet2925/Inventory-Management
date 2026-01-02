import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../apiclient/apiclient";
import socket from "../../../socket/socketClient";
import { Clock, Truck, PackageCheck, CheckCircle } from "lucide-react";

const AgentDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("agent"));

  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    shipped: 0,
    delivered: 0,
    completed: 0,
  });

  /* ------------------------------
     SAFE DELIVERY PERSON ID
  ------------------------------ */
  const getDeliveryPersonId = (order) => {
    if (!order?.deliveryPersonId) return null;

    return typeof order.deliveryPersonId === "string"
      ? order.deliveryPersonId
      : order.deliveryPersonId._id;
  };

  /* ------------------------------
     LOAD COUNTS
  ------------------------------ */
  const loadDashboardData = async () => {
    try {
      const res = await apiClient.get("/orders");
      setStatusCounts(res.data.statusCounts || {});
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  };


useEffect(() => {
  loadDashboardData();

  const handleOrderUpdate = (order) => {
    const dpId = getDeliveryPersonId(order);
    if (dpId === user?._id) {
      loadDashboardData();
    }
  };

  socket.on("order_updated", handleOrderUpdate);
  socket.on("order_deleted", loadDashboardData);

  return () => {
    socket.off("order_updated", handleOrderUpdate);
    socket.off("order_deleted", loadDashboardData);
  };
}, [user?._id]);

  /* ------------------------------
     TABS
  ------------------------------ */
  const tabs = [
    {
      key: "pending",
      label: "Pending",
      count: statusCounts.pending || 0,
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      color: "bg-orange-50 border-orange-300",
      path: "/agent/deliveries/pending",
    },
    {
      key: "shipped",
      label: "Shipped",
      count: statusCounts.shipped || 0,
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50 border-blue-300",
      path: "/agent/deliveries/shipped",
    },
    {
      key: "delivered",
      label: "Delivered",
      count: statusCounts.delivered || 0,
      icon: <PackageCheck className="w-6 h-6 text-purple-600" />,
      color: "bg-purple-50 border-purple-300",
      path: "/agent/deliveries/delivered",
    },
    {
      key: "completed",
      label: "Completed",
      count: statusCounts.completed || 0,
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      color: "bg-green-50 border-green-300",
      path: "/agent/deliveries/completed",
    },
  ];

  return (
    <div className="p-4 mt-14">
      <h1 className="text-2xl font-bold mb-4">Delivery Dashboard</h1>

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
