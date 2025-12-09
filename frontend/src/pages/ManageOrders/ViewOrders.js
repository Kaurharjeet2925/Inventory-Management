import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, X } from 'lucide-react';
import { apiClient } from '../../apiclient/apiclient';
import EditOrderModal from './EditOrderModel';
import socket from "../../socket/socketClient";
import Pagination from '../../components/Pagination';
import { FaFileInvoice } from 'react-icons/fa';
const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;
  
  useEffect(() => {
    loadOrders(currentPage, limit);
  }, [currentPage]);
  

  useEffect(() => {
    // socket listeners
    socket.on("order_collected", (updatedOrder) => {
      setOrders(prev => prev.map(o => (o._id === updatedOrder._id ? updatedOrder : o)));
    });

    socket.on("order_status_updated", (updatedOrder) => {
      setOrders(prev => prev.map(o => (o._id === updatedOrder._id ? updatedOrder : o)));
    });

    socket.on("order_updated", (updatedOrder) => {
      setOrders(prev => prev.map(o => (o._id === updatedOrder._id ? updatedOrder : o)));
    });

    socket.on("order_deleted", ({ orderId }) => {
      setOrders(prev => prev.filter(o => o._id !== orderId));
    });

    socket.on("order_created", (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    });

    return () => {
      socket.off("order_collected");
      socket.off("order_status_updated");
      socket.off("order_updated");
      socket.off("order_deleted");
      socket.off("order_created");
    };
  }, []);

  const loadOrders = async (page = 1) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/orders?page=${page}&limit=${limit}`);
  
      console.log("ORDER ITEMS --->", res.data.data[0]?.items); // 🔥 ADD THIS
  
      setOrders(res.data.data || []);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.page);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };
  
  
  

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await apiClient.get("/products");
        const formatted = res.data.map((p) => ({
          _id: p._id,
          productName: `${p.name} – ${p.quantityValue}${p.quantityUnit}`,
          // unitType: p.quantityUnit,
          // quantityValue: p.quantityValue,
        }));
        setProducts(formatted);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };
    loadProducts();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      shipped: 'bg-blue-100 text-blue-700',
      delivered: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const handleConfirmDelete = async () => {
    try {
      await apiClient.delete(`/orders/${deleteModal._id}`);
      alert('Order deleted successfully');
      setDeleteModal(null);
      // server emits order_deleted — but also reload to be safe
      loadOrders();
    } catch (err) {
      alert('Failed to delete order');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="ml-64 mt-12 p-6 text-gray-600">Loading orders...</div>;
  }

  return (
    <div className="ml-64 mt-12 p-6">
      <h1 className="text-3xl font-bold mb-2">View Orders</h1>
      <p className="text-gray-600 mb-6">All orders and their statuses</p>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 mt-4">

{/* Table Header */}
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wide">
      <tr className="h-12">
        <th className="px-6 text-left">Order ID</th>
        <th className="px-6 text-left">Client</th>
        <th className="px-6 text-left">Agent</th>
        <th className="px-6 text-left w-96">Products</th>
        <th className="px-6 text-left">Qty</th>
        <th className="px-6 text-left">Warehouse</th>
        <th className="px-6 text-left">Date</th>
        <th className="px-6 text-left">Status</th>
        <th className="px-6 text-left">Amount</th>
        <th className="px-6 text-center">Actions</th>
      </tr>
    </thead>

    {/* Table Body */}
    <tbody className="text-gray-800 mb-4">
      {orders.length === 0 ? (
        <tr>
          <td colSpan="9" className="text-center py-6 text-gray-500">
            No orders found
          </td>
        </tr>
      ) : (
        orders.map((order) => {
          const calculatedTotal = order.items.reduce(
            (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
            0
          );
          const totalAmount = order.paymentDetails?.totalAmount ?? calculatedTotal;

          return (
            <tr
              key={order._id}
              className="hover:bg-gray-50 border-b border-gray-200 h-[60px]"
            >
              <td className="px-6 font-semibold text-blue-600 whitespace-nowrap">
                {order.orderId}
              </td>

              <td className="px-6 whitespace-nowrap">
                {order.clientId?.name || "N/A"}
              </td>

              <td className="px-6 whitespace-nowrap">
                {order.deliveryPersonId?.name || "N/A"}
              </td>

              <td className="px-6" style={{ minWidth: "300px" }}>
  {order.items.map((item, idx) => (
    <div
      key={idx}
      className="flex items-center justify-between w-full mb-3 mt-1 whitespace-nowrap"
      style={{ gap: "10px" }}
    >
      <span className="text-sm font-medium">
        {item.productName} ({item.quantityValue}{item.quantityUnit})
      </span>

      <span
        className={`px-2 py-0.5 text-xs rounded font-semibold whitespace-nowrap ${
          item.collected
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {item.collected ? "Collected" : "Not Collected"}
      </span>
    </div>
  ))}
</td>



<td className="px-6" style={{ minWidth: "80px" }}>
  {order.items.map((i, idx) => (
    <div key={idx} className="mb-3 whitespace-nowrap">
      {i.quantity}
    </div>
  ))}
</td>

<td className="px-6" style={{ minWidth: "160px" }}>
  {order.items.map((i, idx) => (
    <div key={idx} className="mb-3 whitespace-nowrap">
      {i.warehouseName}
    </div>
  ))}
</td>


              <td className="px-6 whitespace-nowrap">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>

              <td className="px-6 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </td>

              <td className="px-6 font-semibold text-green-700">
                ₹{totalAmount}
              </td>

              {/* Actions */}
              <td className="px-6 text-center">
                <div className="flex justify-center gap-4">
                

                  <button
                    onClick={() =>
                      setViewModal({ ...order, viewOnly: true })
                    }
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => setEditModal(order)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
  onClick={() =>
    window.open(
      `${process.env.REACT_APP_BACKEND_URL}/invoice/${order._id}`,
      "_blank"
    )
  }
  className="text-purple-600 hover:text-purple-800"
  title="Download Invoice"
>
 <FaFileInvoice/>
</button>

                  <button
                    onClick={() => setDeleteModal(order)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })
      )}
    </tbody>
  </table>
</div>
<div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div> 
</div>

      
      {viewModal && (
        <EditOrderModal
          order={viewModal}
          viewOnly={true}
          onClose={() => setViewModal(null)}
          onSave={() => {}}
        />
      )}

      {editModal && (
        <EditOrderModal
          order={editModal}
          products={products}
          onClose={() => setEditModal(null)}
          onSave={async (payload) => {
            try {
              // payload will contain only status if original order not pending,
              // or items+payment if order was pending
              await apiClient.put(`/orders/${payload._id}`, payload);
              alert("Order updated successfully");
              setEditModal(null);
              // loadOrders() not strictly required because sockets update UI — but fetch to refresh immediate state
              loadOrders();
            } catch (err) {
              console.error(err);
              alert(err?.response?.data?.message || "Failed to update order");
            }
          }}
        />
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Delete Order</h2>
              <button onClick={() => setDeleteModal(null)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>

            <p className="text-gray-600 mb-2">Are you sure you want to delete this order?</p>
            <p className="text-lg font-semibold mb-6">{deleteModal.orderId}</p>

            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={handleConfirmDelete} className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOrders;
