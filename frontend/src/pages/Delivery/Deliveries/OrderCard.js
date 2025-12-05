import React from "react";
import { apiClient } from "../../../apiclient/apiclient";
import { Clock, Truck, PackageCheck, CheckCircle, Package } from "lucide-react";
import { toast } from "react-toastify";

const OrderCard = ({ order, reload }) => {

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-700";
      case "processing": return "bg-blue-100 text-blue-700";
      case "delivered": return "bg-purple-100 text-purple-700";
      case "completed": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="w-5 h-5 text-orange-600" />;
      case "processing": return <Truck className="w-5 h-5 text-blue-600" />;
      case "delivered": return <PackageCheck className="w-5 h-5 text-purple-600" />;
      case "completed": return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleCollect = async (orderId, itemId) => {
    try {
      await apiClient.put(`/orders/${orderId}/collect-item/${itemId}`);
      toast.success("Item collected");
      reload();
    } catch (err) {
      toast.error("Failed to collect item");
    }
  };
  
  
  const updateStatus = async (orderId, newStatus) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Status Updated");
      reload();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-4">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-3">
        
        {/* LEFT SIDE */}
        <div>
          <h3 className="text-lg font-bold text-blue-600">{order.orderId}</h3>
          <p className="text-sm font-semibold text-gray-700">{order.clientId?.name}</p>
          <p className="text-xs text-gray-500">{order.clientId?.phone}</p>
          <p className="text-xs text-gray-500">{order.clientId?.address}</p>
        </div>

        {/* STATUS BADGE */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          {order.status}
        </span>
      </div>

      

{/* ITEMS LIST */}
<div className="bg-gray-50 p-3 rounded mb-3">
<p className="font-semibold mb-2">Items:</p>

{order.items?.map((item, idx) => (
  <div key={idx} className="mb-3 p-3 bg-white rounded border">

    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-800">
          • {item.productName} ({item.quantityValue}{item.unitType}) × {item.quantity}
        </p>

        <p className="text-xs text-gray-600 mt-1">
          <strong>Warehouse:</strong> {item.warehouseName || "N/A"}
        </p>

        <p className="text-xs text-gray-600">
          <strong>Address:</strong> {item.warehouseAddress || "N/A"}
        </p>
      </div>

      {/* Collect only THIS item */}
      {order.status === "pending" && (
       <button
       disabled={item.collected}
       onClick={() => handleCollect(order._id, item._id)}
       className={`px-3 py-1 text-xs rounded text-white ${
         item.collected ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"
       }`}
     >
       {item.collected ? "Collected" : "Collect"}
     </button>
     
      )}
    </div>

  </div>
))}
</div>



      {/* CLEAR FLOAT */}
      <div className="clear-both"></div>

      {/* AFTER COLLECTION → SHOW STATUS UPDATE BUTTONS */}
   {order.items?.every(item => item.collected) && order.status === "pending" && (
  <div className="mt-3 flex gap-2">
          <button
            onClick={() => updateStatus(order._id, "shipped")}
            className="flex-1 bg-blue-500 text-white py-2 rounded"
          >
            Mark Shipped
          </button>
        </div>
      )}

      {order.status === "shipped" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => updateStatus(order._id, "delivered")}
            className="flex-1 bg-purple-500 text-white py-2 rounded"
          >
            Mark Delivered
          </button>
        </div>
      )}
      {order.status === "delivered" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => updateStatus(order._id, "completed")}
            className="flex-1 bg-purple-500 text-white py-2 rounded"
          >
            Mark Delivered
          </button>
        </div>
      )}

    </div>
  );
};

export default OrderCard;
