import React, { useState, useEffect } from "react";
import { Eye, Edit2, Trash2, X, Filter } from "lucide-react";
import { apiClient } from "../../apiclient/apiclient";
import EditOrderModal from "./EditOrderModel";
import socket from "../../socket/socketClient";
import Pagination from "../../components/Pagination";
import { FaFileInvoice } from "react-icons/fa";
import OrderDateFilter from "../../components/OrderDateFilter";
import { formatAnyDateToDDMMYYYY } from "../../utils/dateFormatter";
import PageContainer from "../../components/PageContainer";
/* ================= HELPERS ================= */

const getPaymentBadge = (status) => {
  const styles = {
    paid: "bg-green-100 text-green-700",
    partial: "bg-orange-100 text-orange-700",
    cod: "bg-gray-100 text-gray-700",
    unpaid: "bg-gray-100 text-gray-700",
  };
  return styles[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
};

const formatPaymentStatus = (status) => {
  if (!status) return "COD";
  return status.toUpperCase();
};

const getStatusBadge = (status) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-blue-100 text-blue-700",
    delivered: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return styles[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
};

const formatStatus = (status) => {
  if (!status) return "";
  if (status === "processing" || status === "shipped") return "Shipped";
  return status[0].toUpperCase() + status.slice(1);
};

/* ================= COMPONENT ================= */

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    shipped: 0,
    delivered: 0,
    completed: 0,
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");

  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [month, setMonth] = useState("");
const [year, setYear] = useState("");
const [collected, setCollected] = useState("");
const [collectedFilter, setCollectedFilter] = useState("");
const handleDateApply = (from, to) => {
  setFromDate(from);
  setToDate(to);
  setCurrentPage(1);
};

const handleDateClear = () => {
  setFromDate("");
  setToDate("");
  setCurrentPage(1);
  loadOrders(1, limit, activeTab);
};

  const limit = 8;

  /* ================= LOAD ORDERS ================= */

const loadOrders = async (page = 1, lim = limit, status = activeTab) => {
  try {
    setLoading(true);

    let url = `/orders?page=${page}&limit=${lim}`;

    if (status) url += `&status=${status}`;
    if (fromDate) url += `&from=${fromDate}`;
    if (toDate) url += `&to=${toDate}`;

    const res = await apiClient.get(url);

    setOrders(res.data.data || []);
    setTotalPages(res.data.totalPages || 1);
    setCurrentPage(res.data.page || 1);

    if (res.data.statusCounts) {
      setStatusCounts(res.data.statusCounts);
    }
  } finally {
    setLoading(false);
  }
};



  /* ================= EFFECTS ================= */

  // tab change
  useEffect(() => {
    setCurrentPage(1);
    loadOrders(1, limit, activeTab);
  }, [activeTab]);

  useEffect(() => {
  setCurrentPage(1);
  loadOrders(1, limit, activeTab);
}, [fromDate, toDate]);

  // page change
  useEffect(() => {
    loadOrders(currentPage, limit, activeTab);
  }, [currentPage]);

  // socket realtime
  useEffect(() => {
    const refresh = () => loadOrders(currentPage, limit, activeTab);

    socket.on("order_created", refresh);
    socket.on("order_deleted", refresh);
    socket.on("order_updated", refresh);
    socket.on("order_status_updated", refresh);
    socket.on("connect", () => loadOrders(1, limit, activeTab));

    return () => {
      socket.off("order_created", refresh);
      socket.off("order_deleted", refresh);
      socket.off("order_updated", refresh);
      socket.off("order_status_updated", refresh);
      socket.off("connect");
    };
  }, [currentPage, activeTab]);

  // products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await apiClient.get("/products");
        setProducts(
          res.data.map((p) => ({
            _id: p._id,
            productName: `${p.name} – ${p.quantityValue}${p.quantityUnit}`,
          }))
        );
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };
    loadProducts();
  }, []);

  /* ================= DELETE ================= */

  const handleConfirmDelete = async () => {
    try {
      await apiClient.delete(`/orders/${deleteModal._id}`);
      setDeleteModal(null);
      loadOrders(currentPage, limit, activeTab);
    } catch (err) {
      alert("Failed to delete order");
    }
  };

  /* ================= SEARCH ================= */

 const filteredOrders = orders.filter((order) => {
  const q = search.trim().toLowerCase();
  
  // Search filter
  if (q) {
    // Order ID
    if (order.orderId?.toLowerCase().includes(q)) {
      // Apply collected filter if set
      if (collectedFilter === "collected") {
        return order.items?.some((item) => item.collected === true);
      } else if (collectedFilter === "notcollected") {
        return order.items?.some((item) => item.collected === false);
      }
      return true;
    }

    // Client name
    if (order.clientId?.name?.toLowerCase().includes(q)) {
      if (collectedFilter === "collected") {
        return order.items?.some((item) => item.collected === true);
      } else if (collectedFilter === "notcollected") {
        return order.items?.some((item) => item.collected === false);
      }
      return true;
    }

    // Products
    const productMatch = order.items?.some((item) =>
      item.productName?.toLowerCase().includes(q)
    );
    if (productMatch) {
      if (collectedFilter === "collected") {
        return order.items?.some((item) => item.collected === true);
      } else if (collectedFilter === "notcollected") {
        return order.items?.some((item) => item.collected === false);
      }
      return true;
    }

    // Collected / Not Collected in search
    if (q === "collected") {
      return order.items?.some((item) => item.collected === true);
    }

    if (q === "not collected" || q === "notcollected") {
      return order.items?.some((item) => item.collected === false);
    }

    return false;
  }

  // If no search, apply only the collected filter
  if (collectedFilter === "collected") {
    return order.items?.some((item) => item.collected === true);
  } else if (collectedFilter === "notcollected") {
    return order.items?.some((item) => item.collected === false);
  }

  return true;
});


  if (loading) {
    return (
      <div>
        <div className="text-gray-600">Loading orders...</div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">View Orders</h1>
      <p className="text-gray-600 mb-6">All orders and their statuses</p>

  {/* ================= TABS ================= */}

<div className="flex items-center gap-4 w-full">

  {/* LEFT: STATUS TABS */}
  <div className="flex gap-2">
    <button
      onClick={() => setActiveTab("pending")}
      className={`px-4 py-2 rounded-lg font-medium ${
        activeTab === "pending"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-yellow-50 text-yellow-700"
      }`}
    >
      Pending ({statusCounts.pending})
    </button>

    <button
      onClick={() => setActiveTab("shipped")}
      className={`px-4 py-2 rounded-lg font-medium ${
        activeTab === "shipped"
          ? "bg-blue-100 text-blue-800"
          : "bg-blue-50 text-blue-700"
      }`}
    >
      Shipped ({statusCounts.shipped})
    </button>

    <button
      onClick={() => setActiveTab("delivered")}
      className={`px-4 py-2 rounded-lg font-medium ${
        activeTab === "delivered"
          ? "bg-purple-100 text-purple-800"
          : "bg-purple-50 text-purple-700"
      }`}
    >
      Delivered ({statusCounts.delivered})
    </button>

    <button
      onClick={() => setActiveTab("completed")}
      className={`px-4 py-2 rounded-lg font-medium ${
        activeTab === "completed"
          ? "bg-green-100 text-green-800"
          : "bg-green-50 text-green-700"
      }`}
    >
      Completed ({statusCounts.completed})
    </button>
  </div>

  {/* RIGHT: SEARCH + DATE */}
  <div className="flex items-center gap-3 ml-auto">
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search orders..."
      className="h-10 w-72 px-4 rounded-full border text-sm
                 focus:ring-2 focus:ring-blue-500 outline-none"
    />

    <OrderDateFilter
      fromDate={fromDate}
      toDate={toDate}
      onApply={handleDateApply}
      onClear={handleDateClear}
    />

    {/* Collected Filter Dropdown */}
    <div className="relative">
      <button
        className="h-10 px-4 rounded-full border text-sm bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none flex items-center gap-2"
        onClick={() => setCollectedFilter(collectedFilter === "open" ? "" : "open")}
      >
        <Filter size={16} />
        {collectedFilter === "" || collectedFilter === "open" ? "All Items" : (collectedFilter === "collected" ? " Collected" : " Not Collected")}
      </button>
      {collectedFilter === "open" && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
          <button
            onClick={() => {
              setCollectedFilter("");
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
          >
            All Items
          </button>
          <button
            onClick={() => {
              setCollectedFilter("collected");
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
          >
             Collected
          </button>
          <button
            onClick={() => {
              setCollectedFilter("notcollected");
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
          >
             Not Collected
          </button>
        </div>
      )}
    </div>
  </div>
</div>
`


      {/* ================= TABLE ================= */}
     <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">

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
        <th className="px-6 text-left">Payment</th>
        <th className="px-6 text-left">Amount</th>      
        <th className="px-6 text-left">Balance</th>
        <th className="px-6 text-center">Actions</th>
      </tr>
    </thead>

    {/* Table Body */}
    <tbody className="text-gray-800 mb-4">
      {filteredOrders.length === 0 ? (
        <tr>
          <td colSpan="10" className="text-center py-6 text-gray-500">
            No orders found for selected tab
          </td>
        </tr>
      ) : (
        filteredOrders.map((order) => {
         const calculatedTotal = order.items.reduce(
  (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
  0
);

const totalAmount =
  order.paymentDetails?.totalAmount ?? calculatedTotal;

const paidAmount = order.paymentDetails?.paidAmount ?? 0;

const balanceAmount =
  order.paymentDetails?.balanceAmount ??
  Math.max(totalAmount - paidAmount, 0);

const paymentStatus =
  order.paymentDetails?.paymentStatus || "cod";

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
                {formatAnyDateToDDMMYYYY(order.createdAt)}
              </td>

              <td className="px-6 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {formatStatus(order.status)}
                </span>
              </td>
              <td className="px-6 whitespace-nowrap">
  <span
    className={`px-3 py-1 rounded text-xs font-semibold ${getPaymentBadge(
      paymentStatus
    )}`}
  >
    {formatPaymentStatus(paymentStatus)}
  </span>
</td>

              <td className="px-6 font-semibold text-green-700">
  ₹{totalAmount}
</td>

              <td className="px-6 font-semibold text-red-600 whitespace-nowrap">
  ₹{balanceAmount}
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
      {/* Pagination
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div> */}

      {/* ================= MODALS (UNCHANGED) ================= */}
      {viewModal && (
        <EditOrderModal
          order={viewModal}
          viewOnly
          onClose={() => setViewModal(null)}
        />
      )}

      {editModal && (
        <EditOrderModal
          order={editModal}
          products={products}
          onClose={() => setEditModal(null)}
          onSave={async (payload) => {
            await apiClient.put(`/orders/${payload._id}`, payload);
            setEditModal(null);
            loadOrders(currentPage, limit, activeTab);
          }}
        />
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between mb-4">
              <h2 className="text-2xl font-bold">Delete Order</h2>
              <X onClick={() => setDeleteModal(null)} />
            </div>
            <p className="mb-6">{deleteModal.orderId}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)}>Cancel</button>
              <button onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOrders;
