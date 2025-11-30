import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { apiClient } from '../../apiclient/apiclient';

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    loadOrders();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
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
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">Client Name</th>
              <th className="p-3 text-left">Items</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-3 text-center text-gray-500">No orders found</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold text-blue-600">{order.orderId || 'N/A'}</td>
                  <td className="p-3">{order.clientName}</td>
                  <td className="p-3 text-sm">
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} className="text-gray-700">
                        {item.productName} - {item.quantity} {item.unitType || ''}
                      </div>
                    ))}
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusBadge(order.status)}`}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 flex justify-center gap-2">
                    <button className="text-blue-500 hover:text-blue-700" title="View Details">
                      <Eye size={18} />
                    </button>
                    <button className="text-green-500 hover:text-green-700" title="Edit Order">
                      <Edit2 size={18} />
                    </button>
                    <button className="text-red-500 hover:text-red-700" title="Delete Order">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewOrders;
