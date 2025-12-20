import { useState, useEffect } from "react";
import {
  ComposedChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { apiClient } from "../../../apiclient/apiclient";

const SalesTrendChart = ({ range, setRange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const chartColor = "#2563eb";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(
          `/sales-trend?range=${range}&metric=sales`
        );
        setData(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range]);

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Sales Trend</h4>

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

       <div className="h-56">
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
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis
                tickFormatter={(v) => `₹${v}`}
                domain={[0, "dataMax + 100"]}
              />
              <Tooltip
  content={({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    // take first value only
    const value = payload[0].value;

    return (
      <div className="bg-white border rounded-md px-3 py-2 text-sm shadow">
        <p className="font-medium">{label}</p>
        <p className="text-blue-600">Sales: ₹{value}</p>
      </div>
    );
  }}
/>

              <Area
                type="monotone"
                dataKey={'sales'}
                fill={chartColor}
                stroke={chartColor}
                fillOpacity={0.12}
                strokeWidth={0}
              />
              <Line
                type="monotone"
                dataKey={'sales'}
                stroke={chartColor}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};


export default SalesTrendChart;
