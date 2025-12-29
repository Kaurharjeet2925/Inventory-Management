import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { apiClient } from "../../apiclient/apiclient";
import { Download } from "lucide-react";

/* ================= STATUS BADGE ================= */
const getStockBadge = (status) => {
  const styles = {
    "In Stock": "bg-green-100 text-green-700",
    "Low Stock": "bg-yellow-100 text-yellow-700",
    "Out of Stock": "bg-red-100 text-red-700",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
};

const InventoryReports = () => {
  const [cards, setCards] = useState({});
  const [productChart, setProductChart] = useState([]);
  const [statusChart, setStatusChart] = useState({});
  const [table, setTable] = useState([]);

  const fetchReport = async () => {
    const res = await apiClient.get("/inventory-report");
    setCards(res.data.cards || {});
    setProductChart(res.data.productChart || []);
    setStatusChart(res.data.statusChart || {});
    setTable(res.data.table || []);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const downloadExcel = async () => {
    try {
      const res = await apiClient.get(
        "/inventory-report?download=true",
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
      link.download = "InventoryReport.xlsx";
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
        <h1 className="text-3xl font-bold">Inventory Overview</h1>
        <p className="text-gray-500 mt-1">
          Real-time inventory insights
        </p>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        <div className="rounded-xl p-5 text-white bg-gradient-to-br from-indigo-500 to-blue-600 shadow">
          <p className="text-sm opacity-80">Total Products</p>
          <h2 className="text-2xl font-bold mt-2">{cards.totalProducts || 0}</h2>
        </div>

        <div className="rounded-xl p-5 text-white bg-gradient-to-br from-green-500 to-emerald-600 shadow">
          <p className="text-sm opacity-80">Total Stock</p>
          <h2 className="text-2xl font-bold mt-2">{cards.totalStock || 0}</h2>
        </div>

        <div className="rounded-xl p-5 text-white bg-gradient-to-br from-yellow-400 to-orange-500 shadow">
          <p className="text-sm opacity-80">Low Stock</p>
          <h2 className="text-2xl font-bold mt-2">{cards.lowStockCount || 0}</h2>
        </div>

        <div className="rounded-xl p-5 text-white bg-gradient-to-br from-red-500 to-pink-600 shadow">
          <p className="text-sm opacity-80">Out of Stock</p>
          <h2 className="text-2xl font-bold mt-2">{cards.outOfStockCount || 0}</h2>
        </div>

      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

        {/* PRODUCT STOCK */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Top Products by Stock
          </h3>

          <ResponsiveContainer width="100%" height={320}>
  <BarChart
    data={productChart}
    margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
    barCategoryGap="40%"
  >
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

    <XAxis
      dataKey="name"
      tick={{ fontSize: 12 }}
      interval={0}
      angle={-20}
      textAnchor="end"
    />

    <YAxis tick={{ fontSize: 12 }} />

    <Tooltip
      cursor={{ fill: "rgba(99,102,241,0.1)" }}
      formatter={(v) => [`${v}`, "Stock"]}
    />

    <Bar
      dataKey="quantity"
      radius={[8, 8, 0, 0]}
      barSize={36}
      fill="#6366f1"
      label={{ position: "top", fontSize: 11 }}
    />
  </BarChart>
</ResponsiveContainer>

        </div>

        {/* STOCK STATUS */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Stock Status Distribution
          </h3>

          <ResponsiveContainer width="100%" height={320}>
  <PieChart>
    <Pie
      data={[
        { name: "In Stock", value: statusChart.inStock || 0 },
        { name: "Low Stock", value: statusChart.lowStock || 0 },
        { name: "Out of Stock", value: statusChart.outOfStock || 0 },
      ]}
      dataKey="value"
      innerRadius={70}
      outerRadius={110}
      paddingAngle={3}
    >
      <Cell fill="#22c55e" />
      <Cell fill="#facc15" />
      <Cell fill="#ef4444" />
    </Pie>

    <Tooltip />

    {/* CENTER TEXT */}
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      className="fill-gray-700 text-sm font-semibold"
    >
      Total
    </text>
    <text
      x="50%"
      y="58%"
      textAnchor="middle"
      dominantBaseline="middle"
      className="fill-gray-900 text-xl font-bold"
    >
      {cards.totalProducts || 0}
    </text>
  </PieChart>
</ResponsiveContainer>

        </div>

      </div>

      {/* ================= ACTION ================= */}
      <div className="mb-4">
        <button
          onClick={downloadExcel}
          className="bg-green-600 text-white px-5 py-2 rounded-lg"
        >
          <Download className="inline mr-2" size={18} />
          Download Report
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Inventory Details</h3>

        <table className="w-full border">
          <thead className="bg-slate-100">
            <tr>
              <th className="border p-2">Product</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Brand</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Location</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr key={i}>
                <td className="border p-2">{row.productName}</td>
                <td className="border p-2">{row.category}</td>
                <td className="border p-2">{row.brand}</td>
                <td className="border p-2">{row.quantity}</td>
                <td className="border p-2">₹ {row.price}</td>
                <td className="border p-2">
                 <div className="text-sm font-medium">{row.locationName}</div>
                <div className="text-xs text-gray-500">{row.locationAddress}</div>
               </td>

                <td className="border p-2 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStockBadge(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default InventoryReports;
