import React, { useEffect, useState } from "react";
import { apiClient } from "../../../apiclient/apiclient";
import OrderCard from "./OrderCard"
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
const CompletedOrders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
   const res = await apiClient.get("/all-order?status=completed");
    setOrders(res.data.data);

  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between text-blue-800 gap-3 mb-4">
        <h1 className="text-2xl font-bold">Completed Orders</h1>
        <button
          onClick={() => navigate(-1)}
        >
          
          <ArrowLeft size={28}/>
          
        </button>

        
      </div>

      {orders.map(o => <OrderCard order={o} reload={load} />)}
    </div>
  );
};

export default CompletedOrders;
