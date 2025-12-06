import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../apiclient/apiclient";
import socket from "../../../socket/socketClient"; 
import { Clock, Truck, PackageCheck, CheckCircle } from "lucide-react";

const AgentDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  // 1️⃣ Load orders for this delivery boy
  const loadOrders = async () => {
    try {
      const res = await apiClient.get(`/orders?deliveryPersonId=${user._id}`);
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Failed to load orders");
    }
  };

  useEffect(() => {
    loadOrders(); // Initial load

    // 2️⃣ Real-time: When admin creates order
    socket.on("order_created", (newOrder) => {
      if (newOrder.deliveryPersonId === user._id) {
        setOrders((prev) => [newOrder, ...prev]);
      }
    });

    // 3️⃣ Real-time: When order status updates
    socket.on("order_status_updated", (updatedOrder) => {
      if (updatedOrder.deliveryPersonId !== user._id) return;

      setOrders((prev) => {
        const others = prev.filter((o) => o._id !== updatedOrder._id);
        return [updatedOrder, ...others];
      });
    });

    return () => {
      socket.off("order_created");
      socket.off("order_status_updated");
    };
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
