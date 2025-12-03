import React, { useState, useEffect } from 'react';
import { apiClient } from '../../apiclient/apiclient';
import { toast } from 'react-toastify';
import { Truck, Package, PackageCheck, CheckCircle, Clock, X } from 'lucide-react';

const AgentDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/orders');
      setOrders(res.data?.orders || []);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === "pending") return <Clock className="w-5 h-5 text-orange-500" />;
    if (status === "processing") return <Truck className="w-5 h-5 text-blue-500" />;
    if (status === "delivered") return <PackageCheck className="w-5 h-5 text-purple-500" />;
    if (status === "completed") return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <Package className="w-5 h-5 text-gray-500" />;
  };

  const getStatusColor = (status) => {
    if (status === "pending") return "bg-orange-100 text-orange-700";
    if (status === "processing") return "bg-blue-100 text-blue-700";
    if (status === "delivered") return "bg-purple-100 text-purple-700";
    if (status === "completed") return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-700";
  };

  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    shipped: orders.filter((o) => o.status === "processing").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  const filteredOrders = (status) =>
    orders.filter((o) => {
      if (status === "pending") return o.status === "pending";
      if (status === "shipped") return o.status === "processing";
      if (status === "delivered") return o.status === "delivered";
      if (status === "completed") return o.status === "completed";
      return false;
    });

  const handleOpenOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await apiClient.put(`/orders/${selectedOrder._id}/status`, { status: newStatus });
      toast.success(`Order updated`);
      setShowModal(false);
      loadOrders();
    } catch (err) {
      toast.error("Failed update");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  // ⭐ FIXED STATIC COLOR MAP
  const cardColors = {
    pending: {
      active: "bg-orange-100 border-2 border-orange-500",
      inactive: "bg-orange-50 border-2 border-orange-200",
    },
    shipped: {
      active: "bg-blue-100 border-2 border-blue-500",
      inactive: "bg-blue-50 border-2 border-blue-200",
    },
    delivered: {
      active: "bg-purple-100 border-2 border-purple-500",
      inactive: "bg-purple-50 border-2 border-purple-200",
    },
    completed: {
      active: "bg-green-100 border-2 border-green-500",
      inactive: "bg-green-50 border-2 border-green-200",
    },
  };

  // COMPONENT FOR ORDER CARD
  const OrderCard = ({ order }) => (
    <div
      className="bg-white rounded-lg shadow p-4 cursor-pointer"
      onClick={() =>
        setExpandedOrder(expandedOrder === order._id ? null : order._id)
      }
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-blue-600">{order.orderId}</h3>
          <p className="text-sm text-gray-600">{order.clientName}</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}
        >
          {getStatusIcon(order.status)}
          {order.status}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleOpenOrder(order);
        }}
        className="w-full bg-blue-500 text-white py-2 rounded-md mt-2 hover:bg-blue-600"
      >
        View Details
      </button>

      {expandedOrder === order._id && (
        <div className="bg-gray-50 p-3 rounded mt-3">
          <p className="font-semibold mb-2">Items:</p>
          {order.items?.map((item, idx) => (
            <p key={idx} className="text-sm text-gray-700">
              • {item.productName} × {item.quantity} {item.unitType}
            </p>
          ))}

          <p className="text-sm mt-3 font-semibold">Order Date:</p>
          <p className="text-xs text-gray-600">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-12 p-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Delivery Management
        </h1>

        {/* ---------------------- MOBILE VIEW ---------------------- */}
        <div className="md:hidden space-y-6">

          {[
            { key: "pending", label: "Pending", icon: <Clock className="w-6 h-6 text-orange-600" />, count: stats.pending },
            { key: "shipped", label: "Shipped", icon: <Truck className="w-6 h-6 text-blue-600" />, count: stats.shipped },
            { key: "delivered", label: "Delivered", icon: <PackageCheck className="w-6 h-6 text-purple-600" />, count: stats.delivered },
            { key: "completed", label: "Completed", icon: <CheckCircle className="w-6 h-6 text-green-600" />, count: stats.completed },
          ].map((section) => (
            <div key={section.key}>
              {/* MOBILE CARD */}
              <div
                onClick={() => setFilter(filter === section.key ? null : section.key)}
                className={`p-4 rounded-lg shadow cursor-pointer transition ${
                  filter === section.key
                    ? cardColors[section.key].active
                    : cardColors[section.key].inactive
                }`}
              >
                <div className="flex items-center gap-3">
                  {section.icon}
                  <div>
                    <p className="text-sm font-semibold">{section.label}</p>
                    <p className="text-2xl font-bold">{section.count}</p>
                  </div>
                </div>
              </div>

              {/* MOBILE ORDERS BELOW CARD */}
              {filter === section.key && (
                <div className="mt-3 space-y-4">
                  {filteredOrders(section.key).length === 0 ? (
                    <div className="p-4 bg-white rounded shadow text-center text-gray-500">
                      No {section.label} orders
                    </div>
                  ) : (
                    filteredOrders(section.key).map((order) => (
                      <OrderCard key={order._id} order={order} />
                    ))
                  )}
                </div>
              )}
            </div>
          ))}

        </div>

        {/* ---------------------- DESKTOP VIEW ---------------------- */}
        <div className="hidden md:block">

          {/* 4 GRID CARDS */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { key: "pending", label: "Pending", icon: <Clock className="w-6 h-6 text-orange-600" />, count: stats.pending },
              { key: "shipped", label: "Shipped", icon: <Truck className="w-6 h-6 text-blue-600" />, count: stats.shipped },
              { key: "delivered", label: "Delivered", icon: <PackageCheck className="w-6 h-6 text-purple-600" />, count: stats.delivered },
              { key: "completed", label: "Completed", icon: <CheckCircle className="w-6 h-6 text-green-600" />, count: stats.completed },
            ].map((section) => (
              <div
                key={section.key}
                onClick={() => setFilter(filter === section.key ? null : section.key)}
                className={`p-4 rounded-lg shadow cursor-pointer transition ${
                  filter === section.key
                    ? cardColors[section.key].active
                    : cardColors[section.key].inactive
                }`}
              >
                <div className="flex items-center gap-3">
                  {section.icon}
                  <div>
                    <p className="text-sm font-semibold">{section.label}</p>
                    <p className="text-2xl font-bold">{section.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP FULL ORDER LIST */}
          {filter && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">
                {filter.charAt(0).toUpperCase() + filter.slice(1)} Orders
              </h2>

              {filteredOrders(filter).length === 0 ? (
                <div className="p-6 bg-white rounded shadow text-center text-gray-500">
                  No {filter} orders
                </div>
              ) : (
                filteredOrders(filter).map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))
              )}
            </div>
          )}
        </div>

        {/* MODAL */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-auto">

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Order Details</h2>
                <button onClick={() => setShowModal(false)}>
                  <X />
                </button>
              </div>

              <p className="font-semibold">Order ID:</p>
              <p>{selectedOrder.orderId}</p>

              <p className="font-semibold mt-3">Client:</p>
              <p>{selectedOrder.clientName}</p>

              <p className="font-semibold mt-3">Items:</p>
              {selectedOrder.items?.map((itm, idx) => (
                <p className="text-sm" key={idx}>
                  • {itm.productName} × {itm.quantity} {itm.unitType}
                </p>
              ))}

              <div className="mt-6 space-y-3">
                {selectedOrder.status === "pending" && (
                  <button
                    onClick={() => handleUpdateStatus("processing")}
                    className="w-full bg-blue-500 text-white rounded py-2"
                  >
                    Mark Shipped
                  </button>
                )}

                {selectedOrder.status === "processing" && (
                  <button
                    onClick={() => handleUpdateStatus("delivered")}
                    className="w-full bg-purple-500 text-white rounded py-2"
                  >
                    Mark Delivered
                  </button>
                )}

                {selectedOrder.status === "delivered" && (
                  <button
                    onClick={() => handleUpdateStatus("completed")}
                    className="w-full bg-green-500 text-white rounded py-2"
                  >
                    Mark Completed
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AgentDashboard;
