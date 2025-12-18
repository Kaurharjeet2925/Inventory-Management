import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { apiClient } from "../../../apiclient/apiclient";

const COLORS = {
  Paid: "#22c55e",     // green
  Pending: "#ef4444"  // red
};

const PaymentPieChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await apiClient.get("/payment-summary");
      setData(res.data || []);
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 w-full">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        Payment Status
      </h4>

      <div className="h-64">
        {data.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-20">
            No payment data
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[entry.name]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => `₹${v.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* LEGEND */}
      <div className="flex justify-center gap-6 mt-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Paid
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Pending
        </span>
      </div>
    </div>
  );
};

export default PaymentPieChart;
