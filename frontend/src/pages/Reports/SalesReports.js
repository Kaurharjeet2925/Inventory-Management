import React, { useEffect, useState } from "react";
import ThemedTable from "../../components/ThemedTable";
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
import Pagination from "../../components/Pagination";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";
import { formatAnyDateToDDMMYYYY, parseDDMMYYYY as utilParseDDMMYYYY, formatDDMMYYYY as utilFormatDDMMYYYY, formatDDMMYYYYtoISO as utilFormatDDMMYYYYtoISO } from "../../utils/dateFormatter";
import PageContainer from "../../components/PageContainer";

// dd-MM-yyyy -> Date (local version used for DatePicker)
const parseDDMMYYYY = (value) => {
  if (!value) return null;
  return parse(value, "dd-MM-yyyy", new Date());
};

// Date -> dd-MM-yyyy (local version)
const formatDDMMYYYY = (date) => {
  if (!date) return "";
  return format(date, "dd-MM-yyyy");
};

// dd-MM-yyyy -> yyyy-mm-dd (for API)
const formatDDMMYYYYtoISO = (ddmmyy) => {
  if (!ddmmyy) return "";
  const date = parseDDMMYYYY(ddmmyy);
  if (!date) return ddmmyy;
  return format(date, "yyyy-MM-dd");
};
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

  // note: 'from' and 'to' are stored as dd-MM-yyyy display format

  const [cards, setCards] = useState({});
  const [chart, setChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [table, setTable] = useState([]);
  const [search, setSearch] = useState("");
const [pageSize, setPageSize] = useState(10);
const [currentPage, setCurrentPage] = useState(1);
  /* ================= FETCH REPORT ================= */
  const fetchReport = async (startDateDisplay, endDateDisplay) => {
    // convert display dd-mm-yyyy to ISO yyyy-mm-dd for API
    const startDate = startDateDisplay ? formatDDMMYYYYtoISO(startDateDisplay) : "";
    const endDate = endDateDisplay ? formatDDMMYYYYtoISO(endDateDisplay) : "";

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
    row.productName?.toLowerCase().includes(q) ||
    row.orderStatus?.toLowerCase().includes(q) ||
    row.paymentStatus?.toLowerCase().includes(q)
  );
});
const totalPages = Math.ceil(filteredTable.length / pageSize);

const paginatedTable = filteredTable.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);

  /* ================= DEFAULT = LAST 7 DAYS ================= */
  useEffect(() => {
    const today = new Date();
    const last7 = new Date();
    last7.setDate(today.getDate() - 6);

    const toDisplay = formatDDMMYYYY(today);
    const fromDisplay = formatDDMMYYYY(last7);

    setFrom(fromDisplay);
    setTo(toDisplay);
    fetchReport(fromDisplay, toDisplay);
  }, []);

  /* ================= DOWNLOAD ================= */
  const downloadExcel = async () => {
  try {
    const res = await apiClient.get(
      `/daily-sales?start=${formatDDMMYYYYtoISO(from)}&end=${formatDDMMYYYYtoISO(to)}&download=true&search=${search}`,
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
    <div>

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
  <DatePicker
    selected={parseDDMMYYYY(from)}
    onChange={(date) => setFrom(formatDDMMYYYY(date))}
    dateFormat="dd-MM-yyyy"
    placeholderText="DD-MM-YYYY"
    showMonthDropdown
    showYearDropdown
    dropdownMode="select"
    maxDate={new Date()}
    className="border rounded px-3 py-2 w-full sm:w-52"
  />
</div>

{/* TO */}
<div className="flex items-center gap-2">
  <label className="text-sm font-medium whitespace-nowrap">To</label>
  <DatePicker
    selected={parseDDMMYYYY(to)}
    onChange={(date) => setTo(formatDDMMYYYY(date))}
    dateFormat="dd-MM-yyyy"
    placeholderText="DD-MM-YYYY"
    showMonthDropdown
    showYearDropdown
    dropdownMode="select"
    maxDate={new Date()}
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
     <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
  <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
    <h3 className="text-lg font-semibold text-slate-800">
      Sales Details
    </h3>
   <div className="flex items-center gap-3">
  <span className="text-sm text-slate-500">
    {filteredTable.length} records
  </span>

  <div className="flex items-center gap-2">
    <span className="text-sm text-slate-500">Rows:</span>
    <select
      value={pageSize}
      onChange={(e) => setPageSize(Number(e.target.value))}
      className="border border-slate-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
    >
      <option value={10}>10</option>
      <option value={20}>20</option>
      <option value={50}>50</option>
    </select>
  </div>
</div>

    
  </div>

  <div className="overflow-x-auto max-h-[420px]">
    <ThemedTable className="min-w-full text-sm">
      <thead className="sticky top-0 bg-slate-50 z-10">
        <tr className="text-slate-600 text-xs uppercase tracking-wide">
          <th className="px-4 py-3 text-left">Order ID</th>
          <th className="px-4 py-3 text-center">Date</th>
          <th className="px-4 py-3 text-left">Client</th>
          <th className="px-4 py-3 text-left">Products</th>
          <th className="px-4 py-3 text-right">Total</th>
          <th className="px-4 py-3 text-right">Paid</th>
          <th className="px-4 py-3 text-right">Balance</th>
          <th className="px-4 py-3 text-center">Payment</th>
          <th className="px-4 py-3 text-center">Status</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
 {paginatedTable.map((row, index) => (  
          <tr
            key={row.orderId}
            className={`hover:bg-indigo-50 transition ${
              index % 2 === 0 ? "bg-white" : "bg-slate-50"
            }`}
          >
            <td className="px-4 py-3 font-medium text-slate-700">
              {row.orderId}
            </td>

            <td className="px-4 py-3 text-center text-slate-600">
              {formatAnyDateToDDMMYYYY(row.date)}
            </td>

            <td className="px-4 py-3 text-slate-700">
              {row.clientName}
            </td>

            <td className="px-4 py-3 text-slate-600">
  <div className="flex flex-col gap-1">
    {Array.isArray(row.productName) ? (
      row.productName.map((p, i) => (
        <span key={i}>{p}</span>
      ))
    ) : (
      <span>{row.productName}</span>
    )}
  </div>
</td>


            <td className="px-4 py-3 text-right font-semibold text-slate-800">
              ₹ {row.totalAmount}
            </td>

            <td className="px-4 py-3 text-right text-green-700">
              ₹ {row.paidAmount}
            </td>

            <td className="px-4 py-3 text-right text-red-600">
              ₹ {row.balanceAmount}
            </td>

            {/* PAYMENT STATUS */}
            <td className="px-4 py-3 text-center">
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

            {/* ORDER STATUS */}
            <td className="px-4 py-3 text-center">
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

        {filteredTable.length === 0 && (
          <tr>
            <td
              colSpan={9}
              className="px-4 py-6 text-center text-slate-500"
            >
              No sales found
            </td>
          </tr>
        )}
      </tbody>
    </ThemedTable>
    <div className="flex justify-center items-center py-5 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
  />
</div>

  </div>
</div>


    </div>
  );
};

export default SalesReport;
