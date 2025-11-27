import React, { useState } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';

const ViewOrders = () => {
  const [orders] = useState([
    {
      id: 'ORD001',
      clientName: 'Rajesh Kumar',
      ProductName: 'Tablet',
      UnitName: 'Piece',
      Quantity: 3,
      status: 'Pending',
      createdAt: '2025-11-26',
    },
    {
      id: 'ORD002',
      clientName: 'Priya Singh',
      ProductName: 'Smartphone',
      UnitName: 'Piece',
      Quantity: 2,
      status: 'Delievered',
      createdAt: '2025-11-25',
    },
    {
      id: 'ORD003',
      clientName: 'Amit Patel',
      ProductName: 'Laptop',
      UnitName: 'Piece',
      Quantity: 1,
      status: 'Shipped',
      createdAt: '2025-11-24',
    },
  ]);

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-700',
      Delievered: 'bg-green-100 text-green-700',
      Cancelled: 'bg-red-100 text-red-700',
      Shipped : 'bg-blue-100 text-blue-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="ml-64 mt-12 p-6">
      <h1 className="text-3xl font-bold mb-2">View Orders</h1>
      <p className="text-gray-600 mb-6">All orders and their statuses</p>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">Client Name</th>
              <th className="p-3 text-center">Product Name</th>
              <th className="p-3 text-center">Unit</th>
              <th className="p-3 text-center">Quantity</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold text-blue-600">{order.id}</td>
                <td className="p-3">{order.clientName}</td>
                <td className="p-3 text-center">{order.ProductName}</td>
                <td className="p-3 text-center ">{order.UnitName}</td>
                <td className="p-3 text-center">{order.Quantity}</td>
                <td className="p-3">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3">{order.createdAt}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewOrders;
