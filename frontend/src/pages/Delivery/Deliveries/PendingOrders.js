import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../apiclient/apiclient";
import OrderCard from "./OrderCard";
import socket from "../../../socket/socketClient";
import { ArrowLeft } from "lucide-react";

const PendingOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const res = await apiClient.get("/all-order?status=pending");
    setOrders(res.data.data);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* 🔴 REALTIME UPDATE */
  useEffect(() => {
    const handleNewOrder = (order) => {
      setOrders((prev) => [order, ...prev]);
    };

    socket.on("order_created", handleNewOrder);

    return () => {
      socket.off("order_created", handleNewOrder);
    };
  }, []);

  return (
    <div className="p-4">
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex justify-between text-blue-800 gap-3 mb-4">
     
        <h1 className="text-2xl font-bold">Pending Orders</h1>
          <button
                 onClick={() => navigate(-1)}
               >
                 
                 <ArrowLeft size={28}/>
                 
               </button>

      </div>

      {orders.length === 0 && (
        <p className="text-gray-500">No pending orders</p>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            reload={loadOrders}
          />
        ))}
      </div>
    </div>
  );
};

export default PendingOrders;
