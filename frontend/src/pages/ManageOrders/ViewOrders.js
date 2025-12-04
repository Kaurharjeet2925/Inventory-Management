import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, X } from 'lucide-react';
import { apiClient } from '../../apiclient/apiclient';

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await apiClient.get('/orders');
      setOrders(res.data?.orders || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  // VIEW ORDER
  const handleViewOrder = (order) => {
    setViewModal(order);
  };

  // EDIT ORDER STATUS
  const handleEditOrder = (order) => {
    setEditModal({ ...order, newStatus: order.status });
  };

  const handleStatusChange = (newStatus) => {
    setEditModal({ ...editModal, newStatus });
  };

  const handleSaveStatus = async () => {
    try {
      await apiClient.put(`/orders/${editModal._id}/status`, { status: editModal.newStatus });
      alert('Order status updated successfully');
      setEditModal(null);
      loadOrders();
    } catch (err) {
      alert('Failed to update order status');
      console.error(err);
    }
  };

  // DELETE ORDER
  const handleDeleteOrder = (order) => {
    setDeleteModal(order);
  };

  const handleConfirmDelete = async () => {
    try {
      await apiClient.delete(`/orders/${deleteModal._id}`);
      alert('Order deleted successfully');
      setDeleteModal(null);
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

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
        <thead className="bg-gray-100 border-b text-sm font-semibold text-gray-700">
  <tr>
    <th className="p-4 text-left">Order ID</th>
    <th className="p-4 text-left">Client Name</th>
    <th className="p-4 text-left">Products</th>
    <th className="p-4 text-left">Stocks</th>
    <th className="p-4 text-left">Warehouse</th>
    <th className="p-4 text-left">Date</th>
    <th className="p-4 text-left">Status</th>
    {/* <th className="p-4 text-left">Collected</th> */}
    <th className="p-4 text-center">Actions</th>
  </tr>
</thead>

<tbody>
  {orders.length === 0 ? (
    <tr>
      <td colSpan="9" className="p-4 text-center text-gray-500">
        No orders found
      </td>
    </tr>
  ) : (
    orders.map((order) => (
      <tr key={order._id} className="border-b hover:bg-gray-50">

        {/* ORDER ID */}
        <td className="p-4 font-semibold text-blue-600 whitespace-nowrap">
          {order.orderId}
        </td>

        {/* CLIENT NAME */}
        <td className="p-4 whitespace-nowrap">
          {order.clientId?.name || "N/A"}
        </td>

        {/* PRODUCTS */}
        <td className="p-4 text-sm leading-6">
  {order.items?.map((item, idx) => (
    <div key={idx} className="mb-1 flex items-center gap-2">
      <span>{item.productName} ({item.quantityValue}{item.unitType})</span>

      {item.collected ? (
        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
          Collected
        </span>
      ) : (
        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
          Not Collected
        </span>
      )}
    </div>
  ))}
</td>


        {/* STOCKS */}
        <td className="p-4 text-sm leading-5">
          {order.items?.map((item, idx) => (
            <div key={idx} className="text-gray-800">
              {item.quantity}
            </div>
          ))}
        </td>

        {/* WAREHOUSE NAME + ADDRESS */}
        <td className="p-4 text-sm leading-5">
          {order.items?.map((item, idx) => (
            <div key={idx} className="mb-1">
              <span className="font-medium">{item.warehouseName || "N/A"}</span>
              {/* <div className="text-xs text-gray-500">
                {item.warehouseAddress || ""}
              </div> */}
            </div>
          ))}
        </td>

        {/* DATE */}
        <td className="p-4 text-sm whitespace-nowrap">
          {new Date(order.createdAt).toLocaleDateString()}
        </td>

        {/* STATUS */}
        <td className="p-4 whitespace-nowrap">
          <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusBadge(order.status)}`}>
            {order.status}
          </span>
        </td>

        {/* COLLECTED */}
        {/* <td className="p-4 whitespace-nowrap">
          {order.collected ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
              Yes
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
              No
            </span>
          )}
        </td> */}

        {/* ACTIONS */}
        <td className="p-4 whitespace-nowrap flex items-center gap-3">

          {/* View */}
          <button
            onClick={() => handleViewOrder(order)}
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye size={18} />
          </button>

          {/* Edit */}
          <button
            onClick={() => handleEditOrder(order)}
            className="text-green-600 hover:text-green-800"
          >
            <Edit2 size={18} />
          </button>

          {/* Delete */}
          <button
            onClick={() => handleDeleteOrder(order)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 size={18} />
          </button>

        </td>

      </tr>
    ))
  )}
</tbody>


        </table>
      </div>

      {/* VIEW MODAL */}
      {viewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button onClick={() => setViewModal(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Order ID</p>
                  <p className="text-lg font-semibold">{viewModal.orderId}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Client Name</p>
                  <p className="text-lg font-semibold">{viewModal.clientName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Status</p>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusBadge(viewModal.status)}`}>
                    {viewModal.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Date</p>
                  <p className="text-lg font-semibold">{new Date(viewModal.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm mb-2">Items</p>
                <div className="bg-gray-50 p-3 rounded space-y-2">
                  {viewModal.items && viewModal.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between border-b pb-2 last:border-b-0">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity} {item.unitType || ''}</p>
                        {item.quantityValue && <p className="text-sm text-gray-600">Size: {item.quantityValue}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {viewModal.notes && (
                <div>
                  <p className="text-gray-600 text-sm">Notes</p>
                  <p className="text-gray-700">{viewModal.notes}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setViewModal(null)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STATUS MODAL */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Update Order Status</h2>
              <button onClick={() => setEditModal(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 text-sm mb-2">Order ID</p>
              <p className="text-lg font-semibold">{editModal.orderId}</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Status</label>
              <select 
                value={editModal.newStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setEditModal(null)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveStatus}
                className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Delete Order</h2>
              <button onClick={() => setDeleteModal(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-2">Are you sure you want to delete this order?</p>
            <p className="text-lg font-semibold mb-6">{deleteModal.orderId}</p>
            <p className="text-sm text-red-600 mb-6">Note: Stock will be restored for all items in this order.</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal(null)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOrders;
