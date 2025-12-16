import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { apiClient } from "../../apiclient/apiclient";
import { Download } from "lucide-react";

const getStatusBadge = (status) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700', // shipped
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
};

const SalesReport = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [cards, setCards] = useState({});
  const [chart, setChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [table, setTable] = useState([]);
  const [search, setSearch] = useState("");

  /* ================= FETCH REPORT ================= */
  const fetchReport = async (startDate, endDate) => {
    const res = await apiClient.get(
      `/daily-sales?start=${startDate}&end=${endDate}`
    );

    setCards(res.data.cards || {});
    setChart(res.data.chart || []);
    setTopProducts(res.data.topProducts || []);
    setTable(res.data.table || []);
  };
  const filteredTable = table.filter((row) => {
    const q = search.toLowerCase();
    return (
      row.orderId?.toLowerCase().includes(q) ||
      row.clientName?.toLowerCase().includes(q) ||
      row.status?.toLowerCase().includes(q)
    );
  });
  
  /* ================= DEFAULT = LAST 7 DAYS ================= */
  useEffect(() => {
    const today = new Date();
    const last7 = new Date();
    last7.setDate(today.getDate() - 6);

    const toDate = today.toISOString().slice(0, 10);
    const fromDate = last7.toISOString().slice(0, 10);

    setFrom(fromDate);
    setTo(toDate);
    fetchReport(fromDate, toDate);
  }, []);

  /* ================= DOWNLOAD ================= */
  const downloadExcel = async () => {
  try {
    const res = await apiClient.get(
      `/daily-sales?start=${from}&end=${to}&download=true&search=${search}`,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([res.data], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "DailySalesReport.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error(err);
    alert("You are not authorized to download this report");
  }
};

  

  return (
    <div className="ml-64 mt-12 p-6 bg-slate-50 min-h-screen">

      {/* ================= HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sales Overview</h1>
        <p className="text-gray-500 mt-1">
          Weekly trend by default • Live sales insights
        </p>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        {/* TODAY */}
        <div className="relative rounded-xl p-5 text-white overflow-hidden
                        bg-gradient-to-br from-blue-500 to-indigo-600
                        shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full -top-10 -left-10 w-40 h-40"></div>
          <p className="text-sm opacity-80 relative z-10">Today's Sales</p>
          <h2 className="text-2xl font-bold mt-2 relative z-10">
            ₹ {cards.todaySales || 0}
          </h2>
          <p className="text-sm opacity-80 mt-1 relative z-10">
            {cards.todayOrders || 0} orders
          </p>
        </div>

        {/* WEEK */}
        <div className="relative rounded-xl p-5 text-white overflow-hidden
                        bg-gradient-to-br from-emerald-500 to-green-600
                        shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full -top-10 -left-10 w-40 h-40"></div>
          <p className="text-sm opacity-80 relative z-10">Last 7 Days</p>
          <h2 className="text-2xl font-bold mt-2 relative z-10">
            ₹ {cards.weekSales || 0}
          </h2>
          <p className="text-sm opacity-80 mt-1 relative z-10">
            {cards.weekOrders || 0} orders
          </p>
        </div>

        {/* MONTH */}
        <div className="relative rounded-xl p-5 text-white overflow-hidden
                        bg-gradient-to-br from-orange-500 to-amber-600
                        shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full -top-10 -left-10 w-40 h-40"></div>
          <p className="text-sm opacity-80 relative z-10">This Month</p>
          <h2 className="text-2xl font-bold mt-2 relative z-10">
            ₹ {cards.monthSales || 0}
          </h2>
          <p className="text-sm opacity-80 mt-1 relative z-10">
            {cards.monthOrders || 0} orders
          </p>
        </div>

        {/* TOP PRODUCT */}
        <div className="relative rounded-xl p-5 text-white overflow-hidden
                        bg-gradient-to-br from-cyan-500 to-sky-600
                        shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
          <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full -top-10 -left-10 w-40 h-40"></div>
          <p className="text-sm opacity-80 relative z-10">Top Product</p>
          <h2 className="text-lg font-bold mt-2 truncate relative z-10">
            {cards.topProduct || "N/A"}
          </h2>
          <p className="text-sm opacity-80 mt-1 relative z-10">
            {cards.topProductQty || 0} units sold
          </p>
        </div>

      </div>
  
{/* ================= CHARTS SIDE BY SIDE ================= */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">


<div className="bg-white rounded-xl shadow p-6">
  <h3 className="text-lg font-semibold mb-4">
    Sales Trend (Last 7 Days)
  </h3>

  <ResponsiveContainer width="100%" height={300}>
    <LineChart
      data={chart}
      margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

      <XAxis
        dataKey="date"
        tick={{ fontSize: 12 }}
      />

      <YAxis
        tick={{ fontSize: 12 }}
        domain={[0, "dataMax + 20000"]}
        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
      />

      <Tooltip
        formatter={(v) => [`₹ ${v}`, "Sales"]}
      />

      <Line
        type="monotone"
        dataKey="amount"
        stroke="#6366f1"
        strokeWidth={3}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>

<div className="bg-white rounded-xl shadow p-6">
  <h3 className="text-lg font-semibold mb-4">
    Top Selling Products
  </h3>

  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      data={topProducts}
      margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
      barCategoryGap="30%"
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

      <XAxis
        dataKey="name"
        tick={{ fontSize: 12 }}
      />

      <YAxis
        tick={{ fontSize: 12 }}
        domain={[0, "dataMax + 20"]}
      />

      <Tooltip />

      <Bar
        dataKey="quantity"
        fill="#38bdf8"
        radius={[8, 8, 0, 0]}
        barSize={40}
      />
    </BarChart>
  </ResponsiveContainer>
</div>


</div>



      {/* ================= FILTER + ACTIONS ================= */}
      <div className="w-full flex flex-wrap items-center gap-4 mb-4 bg-white p-4 rounded-xl shadow">

{/* FROM */}
<div className="flex items-center gap-2">
  <label className="text-sm font-medium whitespace-nowrap">From</label>
  <input
    type="date"
    value={from}
    onChange={(e) => setFrom(e.target.value)}
    className="border rounded px-3 py-2 w-full sm:w-52"
  />
</div>

{/* TO */}
<div className="flex items-center gap-2">
  <label className="text-sm font-medium whitespace-nowrap">To</label>
  <input
    type="date"
    value={to}
    onChange={(e) => setTo(e.target.value)}
    className="border rounded px-3 py-2 w-full sm:w-52"
  />
</div>

{/* SEARCH */}
<div className="flex items-center gap-2 flex-1 min-w-[220px]">
  <input
    type="text"
    placeholder="Search order / customer / product..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border rounded px-4 py-2 w-full"
  />
</div>

{/* ACTIONS */}
<div className="flex gap-3 ml-auto">
  <button
    onClick={() => fetchReport(from, to)}
    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"
  >
    View
  </button>

  <button
    onClick={downloadExcel}
    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
  >
    Download
  </button>
</div>

</div>


      {/* ================= SALES TABLE ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Sales Details</h3>
 <div className="max-h-[400px] overflow-y-auto">
    <table className="w-full border border-collapse">
       <thead className="sticky top-0 bg-slate-100 z-10">
        <tr>
    <th className="border p-2">Order ID</th>
    <th className="border p-2">Date</th>
    <th className="border p-2">Client</th>
    <th className="border p-2">Products</th>
    <th className="border p-2">Total</th>
    <th className="border p-2">Paid</th>
    <th className="border p-2">Balance</th>
    <th className="border p-2">Payment Status</th>
    <th className="border p-2">Order Status</th>
  </tr>
</thead>


          <tbody>
  {table.map((row) => (
    <tr key={row.orderId}>
      <td className="border p-2 text-center">{row.orderId}</td>
      <td className="border p-2 text-center">{row.date}</td>
      <td className="border p-2 text-center">{row.clientName}</td>

      <td className="border p-2">{row.productName}</td>

      <td className="border p-2 text-center">₹ {row.totalAmount}</td>
      <td className="border p-2 text-center">₹ {row.paidAmount}</td>
      <td className="border p-2 text-center">₹ {row.balanceAmount}</td>

      {/* ✅ PAYMENT STATUS */}
      <td className="border p-2 text-center">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
            row.paymentStatus === "paid"
              ? "bg-green-100 text-green-700"
              : row.paymentStatus === "partial"
              ? "bg-orange-100 text-orange-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {row.paymentStatus}
        </span>
      </td>

      {/* ✅ ORDER STATUS */}
      <td className="border p-2 text-center">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(
            row.orderStatus
          )}`}
        >
          {row.orderStatus}
        </span>
      </td>
    </tr>
  ))}
</tbody>

        </table>
        </div>
      </div>

    </div>
  );
};

export default SalesReport;
