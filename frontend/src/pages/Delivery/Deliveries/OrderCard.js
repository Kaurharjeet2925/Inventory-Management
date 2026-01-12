import React, { useState } from "react";
import { apiClient } from "../../../apiclient/apiclient";
import {
  Clock,
  Truck,
  PackageCheck,
  CheckCircle,
  Package
} from "lucide-react";
import { toast } from "react-toastify";

  const OrderCard = ({ order, reload, viewOnly = false, onClose }) => {
  const [payAmount, setPayAmount] = useState("");


  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700";
      case "processing":
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "delivered":
        return "bg-purple-100 text-purple-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-orange-600" />;
      case "processing":
      case "shipped":
        return <Truck className="w-5 h-5 text-blue-600" />;
      case "delivered":
        return <PackageCheck className="w-5 h-5 text-purple-600" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  // ---------------------------
  // PAYMENT CALCULATION (SAFE)
  // ---------------------------
  const totalAmount =
    order.paymentDetails?.totalAmount ??
    order.items.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
      0
    );

  const paidAmount = Number(order.paymentDetails?.paidAmount || 0);
  const balanceAmount = Math.max(totalAmount - paidAmount, 0);

  const paymentStatus =
    paidAmount === 0
      ? "unpaid"
      : paidAmount >= totalAmount
      ? "paid"
      : "partial";

  // ---------------------------
  // COLLECT ITEM
  // ---------------------------
  const handleCollect = async (orderId, itemId) => {
    try {
      await apiClient.put(`/orders/${orderId}/collect-item/${itemId}`);
      toast.success("Item collected");
      reload();
    } catch {
      toast.error("Failed to collect item");
    }
  };
const handleAccept = async () => {
  try {
    await apiClient.put(`/orders/${order._id}/accept`);
    toast.success("Order accepted");
    reload();
  } catch {
    toast.error("Failed to accept order");
  }
};

  // ---------------------------
  // UPDATE STATUS
  // ---------------------------
  const updateStatus = async (orderId, newStatus) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Status updated");
      reload();
    } catch {
      toast.error("Failed to update status");
    }
  };

  // ---------------------------
  // ADD PAYMENT (DELIVERY BOY)
  // ---------------------------
  const handleAddPayment = async () => {
    const amount = Number(payAmount);
  
    if (!amount || amount <= 0) {
      toast.error("Enter valid amount");
      return;
    }
  
    try {
      const res = await apiClient.put(
        `/orders/${order._id}/payment`,
        { paidAmount: amount },
        { headers: { "Cache-Control": "no-cache" } } // 🔥 avoid 304
      );
  
      toast.success("Payment added");
      setPayAmount("");
  
      // 🔥 IMMEDIATE UI UPDATE
      reload(res.data.order);
  
    } catch {
      toast.error("Failed to update payment");
    }
  };
  

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-4">
      {viewOnly && (
  <button
    onClick={onClose}
    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
  >
    ✕
  </button>
)}

      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-blue-600">{order.orderId}</h3>
          <p className="text-sm font-semibold text-gray-700">
            {order.clientId?.name}
          </p>
          <p className="text-xs text-gray-500">{order.clientId?.phone}</p>
          <p className="text-xs text-gray-500">{order.clientId?.address}</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusIcon(order.status)}
          {order.status}
        </span>
      </div>

      {/* ITEMS */}
      <div className="bg-gray-50 p-3 rounded mb-4">
        <p className="font-semibold mb-3">Items</p>

        {order.items?.map((item, idx) => (
          <div
            key={idx}
            className="mb-3 p-3 bg-white rounded border text-sm"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {item.productName} ({item.quantityValue}
                  {item.quantityUnit})
                </p>

                {/* PRICE ROW */}
                <div className="flex justify-between text-gray-600 mt-1">
                  <span>Qty: {item.quantity}</span>
                  <span>₹{item.price} × {item.quantity}</span>
                  <span className="font-semibold text-gray-800">
                    ₹{item.price * item.quantity}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  <strong>Warehouse:</strong> {item.warehouseName || "N/A"}
                </p>
              </div>

             {order.status === "processing" && (
  <button
    disabled={item.collected}
    onClick={() => handleCollect(order._id, item._id)}
    className={`px-3 py-1 text-xs rounded text-white ${
      item.collected
        ? "bg-gray-400"
        : "bg-orange-600 hover:bg-orange-700"
    }`}
  >
    {item.collected ? "Collected" : "Collect"}
  </button>
)}

            </div>
          </div>
        ))}
      </div>

      {/* PAYMENT INFO (ALWAYS SHOW) */}
      <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
        <div className="flex justify-between">
          <span>Total</span>
          <span className="font-semibold">₹{totalAmount}</span>
        </div>

        <div className="flex justify-between">
          <span>Paid</span>
          <span className="font-semibold text-green-700">₹{paidAmount}</span>
        </div>

        <div className="flex justify-between">
          <span>Balance</span>
          <span className="font-semibold text-red-600">
            ₹{balanceAmount}
          </span>
        </div>

        <div className="mt-1">
          <strong>Status:</strong>{" "}
          <span
            className={`font-semibold ${
              paymentStatus === "paid"
                ? "text-green-600"
                : paymentStatus === "partial"
                ? "text-orange-600"
                : "text-red-600"
            }`}
          >
            {paymentStatus}
          </span>
        </div>

        {/* INPUT ONLY WHEN DELIVERED */}
        {order.status === "delivered" && paymentStatus !== "paid" && (
          
          <div className="flex gap-2 mt-3">
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="Enter amount received"
              className="border px-2 py-1 rounded text-sm flex-1"
            />
            <button
              onClick={handleAddPayment}
              className="bg-green-600 text-white px-4 rounded text-sm"
            >
              Add
            </button>
          </div>
        )}
      </div>
     {order.status === "pending" && !order.acceptedByDeliveryBoy && (
  <button
    onClick={handleAccept}
    className="w-full bg-green-600 text-white py-2 rounded mt-2"
  >
    Accept Order
  </button>
)}

      {/* STATUS ACTIONS */}
      {!viewOnly &&
 order.items?.every(i => i.collected) &&
 order.status === "processing" && (
  <button
    onClick={() => updateStatus(order._id, "shipped")}
    className="w-full bg-blue-500 text-white py-2 rounded"
  >
    Mark Shipped
  </button>
)}


      {order.status === "shipped" && (
        <button
          onClick={() => updateStatus(order._id, "delivered")}
          className="w-full bg-purple-500 text-white py-2 rounded mt-2"
        >
          Mark Delivered
        </button>
      )}

      {/* ALWAYS SHOW AFTER DELIVERED */}
      {order.status === "delivered" && (
        <button
          onClick={() => updateStatus(order._id, "completed")}
          className="w-full bg-green-600 text-white py-2 rounded mt-2"
        >
          Mark Completed
        </button>
      )}
    </div>
  );
};

export default OrderCard;
