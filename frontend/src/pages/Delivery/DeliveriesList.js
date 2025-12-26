import React, { useEffect, useState } from "react";
import { apiClient } from "../../apiclient/apiclient";
import socket from "../../socket/socketClient";
import OrderCard from "../Delivery/Deliveries/OrderCard";
import { Eye } from "lucide-react";
import { formatAnyDateToDDMMYYYY } from "../../utils/dateFormatter";

/* 🔹 SIMPLE MOBILE MODAL */
const Modal = ({ children, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div
        className="
          bg-white w-full
          h-[90vh] sm:h-auto
          sm:max-w-3xl
          rounded-t-2xl sm:rounded-xl
          shadow-lg
          overflow-y-auto
          relative
        "
      >
        {/* Drag bar (mobile) */}
        <div className="sm:hidden flex justify-center py-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 text-lg"
        >
          ✕
        </button>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const DeliveriesList = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [viewModal, setViewModal] = useState(null);

  /* ================= LOAD ORDERS ================= */
const loadOrders = async () => {
  const res = await apiClient.get("/orders?page=1&limit=100");

  // ✅ SHOW ONLY COMPLETED ORDERS
  const completedOrders = (res.data.data || []).filter(
    (o) => o.status === "completed"
  );

  setOrders(completedOrders);
};


  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadOrders();
  }, []);

  /* ================= SOCKET REALTIME ================= */
  useEffect(() => {
    const handleOrderUpdate = (updatedOrder) => {
      // update table list
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );

      // update open modal
      setViewModal((prev) =>
        prev && prev._id === updatedOrder._id ? updatedOrder : prev
      );
    };

    socket.on("order_updated", handleOrderUpdate);
    socket.on("order_status_updated", handleOrderUpdate);

    return () => {
      socket.off("order_updated", handleOrderUpdate);
      socket.off("order_status_updated", handleOrderUpdate);
    };
  }, []);

  /* ================= SEARCH ================= */
  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      !q ||
      o.orderId?.toLowerCase().includes(q) ||
      o.clientId?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold mb-3">My Deliveries</h1>

      <input
        className="border px-3 py-2 rounded text-sm mb-3 w-full"
        placeholder="Search order or client"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= TABLE ================= */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left">Order</th>
              <th className="px-3 py-2 text-left">Client</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">
                  No deliveries found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 font-semibold text-blue-600">
                    {order.orderId}
                  </td>

                  <td className="px-3 py-2">
                    {order.clientId?.name}
                  </td>

                  <td className="px-3 py-2 text-gray-600">
                    {formatAnyDateToDDMMYYYY(order.createdAt)}
                  </td>

                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "delivered"
                            ? "bg-purple-100 text-purple-700"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      `}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => setViewModal(order)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {viewModal && (
        <Modal onClose={() => setViewModal(null)}>
          <OrderCard
            order={viewModal}
            viewOnly={true}
            onClose={() => setViewModal(null)}
          />
        </Modal>
      )}
    </div>
  );
};

export default DeliveriesList;
