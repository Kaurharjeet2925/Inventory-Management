import React, { useState, useEffect } from 'react';
import { apiClient } from '../../apiclient/apiclient';
import { toast } from 'react-toastify';
import { Truck, Package, CheckCircle, Clock, X } from 'lucide-react';

const Deliveries = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, shipped, completed
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/orders');
      setOrders(res.data?.orders || []);
    } catch (err) {
      toast.error('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by delivery status
  const filteredOrders = orders.filter(order => {
    if (filter === 'pending') return order.status === 'pending';
    if (filter === 'shipped') return order.status === 'processing';
    if (filter === 'completed') return order.status === 'completed';
    return true;
  });

  const handleOpenOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await apiClient.put(`/orders/${selectedOrder._id}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      setShowModal(false);
      loadOrders();
    } catch (err) {
      toast.error('Failed to update order status');
      console.error(err);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'pending') return <Clock className="w-5 h-5 text-orange-500" />;
    if (status === 'processing') return <Truck className="w-5 h-5 text-blue-500" />;
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <Package className="w-5 h-5 text-gray-500" />;
  };

  const getStatusColor = (status) => {
    if (status === 'pending') return 'bg-orange-100 text-orange-700';
    if (status === 'processing') return 'bg-blue-100 text-blue-700';
    if (status === 'completed') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  if (loading) {
    return <div className="ml-64 mt-12 p-6 text-gray-600">Loading deliveries...</div>;
  }

  return (
    <div className="ml-64 mt-12 p-4 md:p-6 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Delivery Management</h1>

        {/* STATS CARDS - MOBILE RESPONSIVE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* Pending */}
          <div 
            onClick={() => setFilter('pending')}
            className={`p-4 rounded-lg shadow cursor-pointer transition transform hover:scale-105 ${
              filter === 'pending' 
                ? 'bg-orange-100 border-2 border-orange-500' 
                : 'bg-orange-50 border-2 border-orange-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-orange-600" />
              <div>
                <p className="text-sm text-gray-700 font-semibold">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
            </div>
          </div>

          {/* Shipped */}
          <div 
            onClick={() => setFilter('shipped')}
            className={`p-4 rounded-lg shadow cursor-pointer transition transform hover:scale-105 ${
              filter === 'shipped' 
                ? 'bg-blue-100 border-2 border-blue-500' 
                : 'bg-blue-50 border-2 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-700 font-semibold">Shipped</p>
                <p className="text-2xl font-bold text-blue-600">{stats.shipped}</p>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div 
            onClick={() => setFilter('completed')}
            className={`p-4 rounded-lg shadow cursor-pointer transition transform hover:scale-105 ${
              filter === 'completed' 
                ? 'bg-green-100 border-2 border-green-500' 
                : 'bg-green-50 border-2 border-green-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-700 font-semibold">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* DELIVERY CARDS - MOBILE FIRST */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No {filter} orders</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div 
                key={order._id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-blue-600">{order.orderId}</h3>
                    <p className="text-sm text-gray-600">{order.clientName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>

                <div className="mb-4 text-sm text-gray-700">
                  <p className="font-semibold mb-2">Items ({order.items?.length || 0}):</p>
                  <div className="space-y-1">
                    {order.items?.map((item, idx) => (
                      <p key={idx} className="text-gray-600">
                        • {item.productName} × {item.quantity} {item.unitType}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenOrder(order)}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL - ORDER DETAILS & STATUS UPDATE */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* ORDER INFO */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Order ID</p>
                  <p className="text-lg font-bold text-blue-600">{selectedOrder.orderId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Client</p>
                  <p className="text-lg font-bold text-gray-800">{selectedOrder.clientName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Status</p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Date</p>
                  <p className="text-sm text-gray-800">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* ITEMS */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Items</p>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded flex justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{item.productName}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity} {item.unitType}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STATUS UPDATE BUTTONS */}
            <div className="space-y-3">
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => handleUpdateStatus('processing')}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center justify-center gap-2"
                >
                  <Truck className="w-5 h-5" />
                  Mark as Shipped
                </button>
              )}

              {selectedOrder.status === 'processing' && (
                <button
                  onClick={() => handleUpdateStatus('completed')}
                  className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-semibold flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Delivered
                </button>
              )}

              {selectedOrder.status === 'completed' && (
                <div className="w-full bg-green-100 text-green-700 py-3 rounded-lg font-semibold text-center flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Delivery Complete
                </div>
              )}
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;
