import React, { useEffect, useState } from "react";
import { apiClient } from "../../../apiclient/apiclient";
import OrderCard from "./OrderCard";

const ShippedOrders = () => {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
   const res = await apiClient.get("all-order?status=shipped");
setOrders(res.data.data);

  };

  useEffect(() => { loadOrders(); }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Shipped Orders</h1>
      {orders.length === 0 && <p>No shipped orders</p>}
      {orders.map(order => (
        <OrderCard key={order._id} order={order} reload={loadOrders} />
      ))}
    </div>
  );
};

export default ShippedOrders;
