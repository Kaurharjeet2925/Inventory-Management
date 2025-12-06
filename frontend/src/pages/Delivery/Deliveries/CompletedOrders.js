import React, { useEffect, useState } from "react";
import { apiClient } from "../../../apiclient/apiclient";
import OrderCard from "./OrderCard"

const CompletedOrders = () => {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    const res = await apiClient.get("/orders");
    setOrders(res.data.data.filter(o => o.status === "completed"));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Completed Orders</h1>
      {orders.map(o => <OrderCard order={o} reload={load} />)}
    </div>
  );
};

export default CompletedOrders;
