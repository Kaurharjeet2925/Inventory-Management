  import React, { useEffect, useState } from "react";
  import { apiClient } from "../../../apiclient/apiclient";
  import OrderCard from "./OrderCard";
  import socket from "../../../socket/socketClient";
  const PendingOrders = () => {
    const [orders, setOrders] = useState([]);

    const loadOrders = async () => {
      const res = await apiClient.get("/orders");
      setOrders(res.data.data.filter(o => o.status === "pending"));
    };

    useEffect(() => { loadOrders(); }, []);
    useEffect(() => {
      socket.on("order_created", (order) => {
        setOrders(prev => [order, ...prev]);   // auto-update UI
      });
    
      return () => socket.off("order_created");
    }, []);
    
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Pending Orders</h1>
        {orders.length === 0 && <p>No pending orders</p>}
        {orders.map(order => (
          <OrderCard key={order._id} order={order} reload={loadOrders} />

        ))}
      </div>
    );
  };

  export default PendingOrders;
