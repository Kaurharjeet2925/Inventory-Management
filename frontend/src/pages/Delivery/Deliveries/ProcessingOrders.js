import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../apiclient/apiclient";
import OrderCard from "./OrderCard";
import socket from "../../../socket/socketClient";
import { ArrowLeft } from "lucide-react";

const ProcessingOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  /* ---------------- LOAD PROCESSING ORDERS ---------------- */
  const loadOrders = async () => {
    try {
      const res = await apiClient.get("/all-order?status=processing");
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Failed to load processing orders", err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* 🔴 REALTIME UPDATE */
  useEffect(() => {
    const refresh = () => loadOrders();

    const events = [
      "order_accepted",        // pending → processing
      "order_collected",       // item collected
      "order_status_updated",  // shipped, delivered
      "order_updated",         // generic updates
    ];

    events.forEach(ev => socket.on(ev, refresh));

    return () => {
      events.forEach(ev => socket.off(ev, refresh));
    };
  }, []);

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center text-blue-800 gap-3 mb-4">
        <h1 className="text-2xl font-bold">Processing Orders</h1>

        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={28} />
        </button>
      </div>

      {orders.length === 0 && (
        <p className="text-gray-500">No processing orders</p>
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

export default ProcessingOrders;
