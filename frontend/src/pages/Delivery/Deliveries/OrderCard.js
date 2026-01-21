import React, { useState,useEffect } from "react";
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
 const [paymentInput, setPaymentInput] = useState({
    mode: "Cash",
    amount: ""
  });

  // ✅ LOCAL payments for instant UI update
  const [paymentsState, setPaymentsState] = useState(
    order.paymentDetails?.payments || []
  );

  // ✅ LOCAL discount
  const [discountState, setDiscountState] = useState(
    Number(order.paymentDetails?.discount || 0)
  );



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
useEffect(() => {
  setPaymentsState(order.paymentDetails?.payments || []);
  setDiscountState(Number(order.paymentDetails?.discount || 0));
}, [order._id, order.paymentDetails]);

  // ---------------------------
  // PAYMENT CALCULATION (SAFE)
  // ---------------------------
const totalAmount =
    order.paymentDetails?.totalAmount ??
    order.items.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
      0
    );

  const totalPaid = paymentsState.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const payable = Math.max(totalAmount - discountState, 0);
  const balanceAmount = Math.max(payable - totalPaid, 0);

  const paymentStatus =
    totalPaid === 0
      ? "unpaid"
      : totalPaid >= payable
      ? "paid"
      : "partial";

  /* ================= ADD PAYMENT ================= */
  const handleAddPayment = async () => {
    const amount = Number(paymentInput.amount);

    if (!amount || amount <= 0) {
      toast.error("Enter valid amount");
      return;
    }

    if (amount > balanceAmount) {
      toast.error(`Cannot collect more than ₹${balanceAmount}`);
      return;
    }

    // ✅ INSTANT UI UPDATE
    const newPayment = {
      mode: paymentInput.mode,
      amount
    };

    setPaymentsState(prev => [...prev, newPayment]);

    try {
      await apiClient.put(`/orders/${order._id}/payment`, {
        payment: newPayment,
        discount: discountState
      });

      toast.success("Payment added");
      setPaymentInput({ mode: "Cash", amount: "" });
      reload(); // backend sync

    } catch {
      toast.error("Failed to update payment");
      // rollback
      setPaymentsState(prev => prev.slice(0, -1));
    }
  };
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
const handleMarkCompleted = async () => {
  // If balance exists, ask confirmation
  if (balanceAmount > 0) {
    const confirm = window.confirm(
      `₹${balanceAmount} is still pending.\nDo you want to mark this order as completed anyway?`
    );

    if (!confirm) return; // ❌ user cancelled
  }

  // ✅ proceed to complete
  await updateStatus(order._id, "completed");
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
        <p className="font-semibold mb-2">Payments</p>

        {paymentsState.length === 0 && (
          <p className="text-gray-500 text-xs">No payments yet</p>
        )}

        {paymentsState
  .filter(p => Number(p.amount) > 0)   // 👈 hide ₹0
  .map((p, idx) => (
    <div key={idx} className="flex justify-between">
      <span>{p.mode}</span>
      <span className="font-semibold">₹{p.amount}</span>
    </div>
))}


        <hr className="my-2" />

        <div className="flex justify-between">
          <span>Total</span>
          <span className="font-semibold">₹{totalAmount}</span>
        </div>

        <div className="flex justify-between text-orange-600">
          <span>Discount</span>
          <span className="font-semibold">- ₹{discountState}</span>
        </div>

        <div className="flex justify-between">
          <span>Payable</span>
          <span className="font-semibold">₹{payable}</span>
        </div>

        <div className="flex justify-between text-green-700">
          <span>Paid</span>
          <span className="font-semibold">₹{totalPaid}</span>
        </div>

        <div className="flex justify-between text-red-600">
          <span>Balance</span>
          <span className="font-semibold">₹{balanceAmount}</span>
        </div>

        <div className="mt-1">
          <strong>Status:</strong>{" "}
          <span className={`font-semibold ${
            paymentStatus === "paid"
              ? "text-green-600"
              : paymentStatus === "partial"
              ? "text-orange-600"
              : "text-red-600"
          }`}>
            {paymentStatus}
          </span>
        </div>

       

        {/* ADD PAYMENT */}
        {order.status === "delivered" && paymentStatus !== "paid" && (
          <div className="flex gap-2 mt-3">
            <select
              value={paymentInput.mode}
              onChange={(e) =>
                setPaymentInput({ ...paymentInput, mode: e.target.value })
              }
              className="border px-2 py-1 rounded text-sm"
            >
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Bank</option>
            </select>

            <input
              type="number"
              value={paymentInput.amount}
              onChange={(e) =>
                setPaymentInput({ ...paymentInput, amount: e.target.value })
              }
              placeholder="Amount"
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
 {/* DISCOUNT INPUT */}
        {order.status === "delivered" && (
          <div className="flex flex-row gap-4 justify-center text-center">
          <label className="text-center mt-3"> Discount </label>
          <input
            type="number"
            placeholder="Discount"
            value={discountState}
            onChange={(e) => setDiscountState(Number(e.target.value || 0))}
            className="border px-2 py-1 rounded text-sm w-full mt-2"
          />
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
    onClick={handleMarkCompleted}
    className="w-full bg-green-600 text-white py-2 rounded mt-2"
  >
    Mark Completed
  </button>
)}

    </div>
  );
};

export default OrderCard;
