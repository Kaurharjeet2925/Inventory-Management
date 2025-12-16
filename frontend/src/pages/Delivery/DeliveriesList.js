import React, { useEffect, useState } from "react";
import { apiClient } from "../../apiclient/apiclient";
import socket from "../../socket/socketClient";
//import { useNavigate } from "react-router-dom";
import OrderCard from "../Delivery/Deliveries/OrderCard";
import {Eye} from "lucide-react";
const DeliveriesList = () => {
  //const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
 const [viewModal, setViewModal] = useState(null);
  const loadOrders = async () => {
    const res = await apiClient.get("/orders?page=1&limit=100");
    setOrders(res.data.data || []);
  };

  useEffect(() => {
    loadOrders();
    socket.on("order_status_updated", loadOrders);
    return () => socket.off("order_status_updated");
  }, []);

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

      {/* TABLE WRAPPER (important for mobile) */}
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
                <tr
                  key={order._id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-3 py-2 font-semibold text-blue-600">
                    {order.orderId}
                  </td>

                  <td className="px-3 py-2">
                    {order.clientId?.name}
                  </td>

                  <td className="px-3 py-2 text-gray-600">
                 
                    {new Date(order.createdAt).toLocaleDateString()}
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
                                      onClick={() =>
                                        setViewModal({ ...order, viewOnly: true })
                                      }
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
         {viewModal && (
              <OrderCard
                order={viewModal}
                viewOnly={true}
                onClose={() => setViewModal(null)}
                onSave={() => {}}
              />
            )}
    </div>
  );
};

export default DeliveriesList;
