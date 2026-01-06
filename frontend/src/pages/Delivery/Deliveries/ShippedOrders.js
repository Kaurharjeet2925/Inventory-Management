import React, { useEffect, useState } from "react";
import { apiClient } from "../../../apiclient/apiclient";
import OrderCard from "./OrderCard";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
const ShippedOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
   const res = await apiClient.get("all-order?status=shipped");
setOrders(res.data.data);

  };

  useEffect(() => { loadOrders(); }, []);

  return (
    <div className="p-4">

       <div className="flex justify-between text-blue-800 gap-3 mb-4">
       <h1 className="text-2xl font-bold">Shipped Orders</h1>
         <button
                 onClick={() => navigate(-1)}
               >
                 
                 <ArrowLeft size={28}/>
                 
               </button>


       
      </div>

      {orders.length === 0 && <p>No shipped orders</p>}
      {orders.map(order => (
        <OrderCard key={order._id} order={order} reload={loadOrders} />
      ))}
    </div>
  );
};

export default ShippedOrders;
