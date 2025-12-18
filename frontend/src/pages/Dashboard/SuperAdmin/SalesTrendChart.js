import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { apiClient } from "../../../apiclient/apiclient";

const SalesTrendChart = () => {
  const [range, setRange] = useState("7days");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/sales-trend?range=${range}`);
      setData(res.data || []);
    } catch (err) {
      console.error("Failed to load sales trend", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 w-full">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">
          Sales Trend
        </h4>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border rounded-md px-2 py-1 text-xs"
        >
          <option value="7days">Last 7 Days</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* CHART */}
      <div className="h-64">
        {loading ? (
          <p className="text-center text-gray-400 text-sm mt-20">
            Loading sales data...
          </p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-20">
            No sales data available
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="label" />
              <YAxis
                tickFormatter={(v) => `₹${v}`}
                domain={[0, "dataMax + 100"]}
              />
              <Tooltip formatter={(v) => `₹${v}`} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SalesTrendChart;
