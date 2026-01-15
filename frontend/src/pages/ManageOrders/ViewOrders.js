import React, { useState, useEffect , useCallback} from "react";
import { Eye, Edit2, Trash2, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../apiclient/apiclient";
import EditOrderModal from "./EditOrderModel";
import socket from "../../socket/socketClient";
import Pagination from "../../components/Pagination";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import OrderDateFilter from "../../components/OrderDateFilter";
import { formatAnyDateToDDMMYYYY } from "../../utils/dateFormatter";
import ThemedTable from "../../components/ThemedTable";
import ConfirmDialog from "../../components/ConfirmDialog";
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
    processing: "bg-blue-100 text-orange-700",
    shipped: "bg-blue-100 text-blue-700",
    delivered: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return styles[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
};

const formatStatus = (status) => {
  if (!status) return "";

  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};


/* ================= COMPONENT ================= */

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");

  const [deleting, setDeleting] = useState(false);

  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [collectedFilter, setCollectedFilter] = useState("");
const handleDateApply = (from, to) => {
  setFromDate(from);
  setToDate(to);
  setCurrentPage(1);
};
const TAB_STYLES = {
  pending: {
    active: "bg-yellow-500 text-white",
    inactive:
      "bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200",
  },
  processing: {
    active: "bg-orange-500 text-white",
    inactive:
      "bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200",
  },
  shipped: {
    active: "bg-blue-600 text-white",
    inactive:
      "bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200",
  },
  delivered: {
    active: "bg-purple-600 text-white",
    inactive:
      "bg-purple-100 text-purple-800 border border-purple-300 hover:bg-purple-200",
  },
  completed: {
    active: "bg-green-600 text-white",
    inactive:
      "bg-green-100 text-green-800 border border-green-300 hover:bg-green-200",
  },
  cancelled: {
    active: "bg-red-600 text-white",
    inactive:
      "bg-red-100 text-red-800 border border-red-300 hover:bg-red-200",
  },
};


const handleDateClear = () => {
  setFromDate("");
  setToDate("");
  setCurrentPage(1);
  loadOrders(1, limit, activeTab);
};

  const limit = 8;

  /* ================= LOAD ORDERS ================= */

const loadOrders = useCallback(
  async (page = 1, lim = limit, status = activeTab) => {
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
  },
  [activeTab, fromDate, toDate, limit]
);


  // tab change
  useEffect(() => {
  setCurrentPage(1);
  loadOrders(1, limit, activeTab);
}, [activeTab, limit, loadOrders]);


  useEffect(() => {
  setCurrentPage(1);
  loadOrders(1, limit, activeTab);
}, [fromDate, toDate, limit, activeTab, loadOrders]);

  // page change
  useEffect(() => {
    loadOrders(currentPage, limit, activeTab);
  }, [currentPage, limit, activeTab, loadOrders]);

  useEffect(() => {
  const onRealtimeEvent = () => {
    if (document.visibilityState === "visible") {
      loadOrders(currentPage, limit, activeTab);
    } else {
      setNeedsRefresh(true);
    }
  };

  socket.on("order_created", onRealtimeEvent);
  socket.on("order_deleted", onRealtimeEvent);
  socket.on("order_updated", onRealtimeEvent);
  socket.on("order_collected", onRealtimeEvent);
  socket.on("order_status_updated", onRealtimeEvent);
  socket.on("order_processed", onRealtimeEvent);

  socket.on("connect", () => {
    loadOrders(1, limit, activeTab);
  });

  return () => {
    socket.off("order_created", onRealtimeEvent);
    socket.off("order_deleted", onRealtimeEvent);
    socket.off("order_updated", onRealtimeEvent);
    socket.off("order_collected", onRealtimeEvent);
    socket.off("order_status_updated", onRealtimeEvent);
    socket.off("order_processed", onRealtimeEvent);
    socket.off("connect");

  };
}, [currentPage, activeTab, limit, loadOrders]);

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
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible" && needsRefresh) {
      loadOrders(currentPage, limit, activeTab);
      setNeedsRefresh(false);
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [needsRefresh, currentPage, activeTab, limit, loadOrders]);

  /* ================= DELETE ================= */

 const handleConfirmDelete = async () => {
  try {
    setDeleting(true);
    await apiClient.delete(`/orders/${deleteModal._id}`);
    setDeleteModal(null);
    loadOrders(currentPage, limit, activeTab);
  } catch (err) {
    alert("Failed to delete order");
  } finally {
    setDeleting(false);
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


  // if (loading) {
  //   return (
  //     <div>
  //       <div className="text-gray-600">Loading orders...</div>
  //     </div>
  //   );
  // }

  /* ================= UI ================= */

  return (
    <div>
     {/* ================= HEADER ================= */}
<div className="bg-white mb-6">

  {/* ================= HEADER TOP ================= */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
    <div className="min-w-0">
      <h1 className="text-2xl font-semibold text-gray-900">View Orders</h1>
      <p className="text-sm text-gray-500">All orders and their statuses</p>
    </div>

    {/* CREATE ORDER BUTTON */}
    <button
      onClick={() => navigate("/orders/generate-order")} // adjust route if needed
      className="bg-blue-900 hover:bg-amber-500 text-white
                 px-4 py-4 rounded-lg flex items-center gap-2
                 text-sm font-medium whitespace-nowrap transition"
    >
      + Create Order
    </button>
  </div>


{/* ================= FILTER BAR (PRODUCT STYLE) ================= */}
<div className="bg-slate-50 border border-slate-200 p-2 sm:p-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6">

  <div className="flex flex-col lg:flex-row
                  items-start lg:items-center gap-3">

    {/* LEFT — STATUS TABS */}
    <div className="flex items-center gap-1
                overflow-x-auto whitespace-nowrap
                scrollbar-hide w-full lg:flex-1">

  {[
    ["pending", "Pending"],
    ["processing", "Processing"],
    ["shipped", "Shipped"],
    ["delivered", "Delivered"],
    ["completed", "Completed"],
    ["cancelled", "Cancelled"],
  ].map(([key, label]) => (
    <button
      key={key}
      onClick={() => setActiveTab(key)}
      className={`h-8 px-2.5 text-xs rounded-md font-medium transition
        ${
          activeTab === key
            ? TAB_STYLES[key].active
            : TAB_STYLES[key].inactive
        }`}
    >
      {label} ({statusCounts[key]})
    </button>
  ))}
</div>


    {/* RIGHT — CONTROLS */}
    <div className="flex flex-col sm:flex-row gap-2
                    w-full lg:w-auto lg:ml-auto">

      {/* SEARCH */}
      <div className="flex items-center border rounded-lg
                      bg-white px-3 py-2
                      w-full sm:w-56">
        <input
          type="text"
          placeholder="Search orders…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="outline-none w-full text-xs sm:text-sm"
        />
      </div>

      {/* DATE FILTER */}
      <OrderDateFilter
        fromDate={fromDate}
        toDate={toDate}
        onApply={handleDateApply}
        onClear={handleDateClear}
      />

      {/* COLLECTED FILTER */}
      <div className="relative w-full sm:w-36">
        <button
          onClick={() =>
            setCollectedFilter(collectedFilter === "open" ? "" : "open")
          }
          className="h-9 w-full px-3 rounded-lg
                     border border-slate-300 bg-white
                     hover:bg-slate-50 text-xs
                     flex items-center justify-center gap-2"
        >
          <Filter size={14} />
          <span className="truncate">
            {collectedFilter === "collected"
              ? "Collected"
              : collectedFilter === "notcollected"
              ? "Not Collected"
              : "All"}
          </span>
        </button>

        {collectedFilter === "open" && (
          <div className="absolute right-0 mt-1 w-full
                          bg-white border rounded-lg
                          shadow z-20">
            {[
              ["", "All"],
              ["collected", "Collected"],
              ["notcollected", "Not Collected"],
            ].map(([val, label]) => (
              <button
                key={label}
                onClick={() => setCollectedFilter(val)}
                className="block w-full px-3 py-2
                           text-xs text-left
                           hover:bg-slate-100"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  </div>
</div>


</div>




      {/* ================= TABLE ================= */}
     <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">

{/* Table Header */}
<div className="overflow-x-auto">
  <ThemedTable className="text-sm">
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
  {loading ? (
    <tr>
      <td colSpan="12" className="py-10 text-center">
        <div className="flex justify-center items-center gap-2 text-gray-500 text-sm">
          <svg
            className="animate-spin h-5 w-5 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Loading orders...
        </div>
      </td>
    </tr>
  ) : filteredOrders.length === 0 ? (

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

const paymentDetails = order.paymentDetails || {};

const totalAmount =
  typeof paymentDetails.totalAmount === "number"
    ? paymentDetails.totalAmount
    : calculatedTotal;

const discount =
  typeof paymentDetails.discount === "number"
    ? paymentDetails.discount
    : 0;

const paidAmount =
  typeof paymentDetails.paidAmount === "number"
    ? paymentDetails.paidAmount
    : 0;

// ✅ TRUST BACKEND
const balanceAmount =
  typeof paymentDetails.balanceAmount === "number"
    ? paymentDetails.balanceAmount
    : Math.max(totalAmount - discount - paidAmount, 0);

const paymentStatus =
  paymentDetails.paymentStatus || "cod";

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
                    onClick={() =>
               setEditModal(
                ["completed", "cancelled"].includes(order.status)
                 ? { ...order, viewOnly: true }
                 : order
                 )
                 }

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
  // className="text-purple-600 hover:text-purple-800"
  title="Download Invoice"
>
 <LiaFileInvoiceSolid size={18}/>
</button>

                 <button
  onClick={() => {
    if (order.status !== "completed" && order.status !== "cancelled") {
      setDeleteModal(order);
    }
  }}
  disabled={order.status === "completed" || order.status === "cancelled"}
  title={
    order.status === "completed" || order.status === "cancelled"
      ? "Completed or cancelled orders cannot be deleted"
      : "Delete order"
  }
  className={`${
    order.status === "completed" || order.status === "cancelled"
      ? "text-gray-400 cursor-not-allowed"
      : "text-red-600 hover:text-red-800"
  }`}
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
  </ThemedTable>
</div>
<div className="mt-4 border-t flex justify-center">
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={(page) => setCurrentPage(page)}
  />
</div>

 
</div>
     
    

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

     <ConfirmDialog
  open={!!deleteModal}
  title="Delete Order"
  description={`Are you sure you want to delete order ${deleteModal?.orderId}? This action cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
  loading={deleting}
  onCancel={() => setDeleteModal(null)}
  onConfirm={handleConfirmDelete}
/>

    </div>
  );
};

export default ViewOrders;
