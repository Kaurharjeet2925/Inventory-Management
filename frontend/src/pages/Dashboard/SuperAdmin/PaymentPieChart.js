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
  Paid: "#22c55e",
  Pending: "#ef4444"
};

const PaymentPieChart = () => {
  const [paid, setPaid] = useState(0);
  const [pending, setPending] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get("/payment-summary");

        const paidItem = res.data.find(d => d.name === "Paid");
        const pendingItem = res.data.find(d => d.name === "Pending");
        const totalItem = res.data.find(d => d.name === "TotalAmount");

        setPaid(paidItem?.value || 0);
        setPending(pendingItem?.value || 0);
        setTotal(totalItem?.value || 0);
      } catch (err) {
        console.error("Failed to load payment summary", err);
      }
    };

    fetchData();
  }, []);

  // ✅ PIE DATA (ONLY PARTS)
  const chartData = [
    { name: "Paid", value: paid },
    { name: "Pending", value: pending }
  ];

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 w-full h-64 flex flex-col">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        Payment Status
      </h4>

      <div className="relative h-56">
        {total === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-20">
            No payment data
          </p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[entry.name]}
                    />
                  ))}
                </Pie>

                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>

            {/* ✅ TOTAL FROM BACKEND (CENTER ONLY) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-lg font-bold text-gray-800">
                ₹{total.toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>

      {/* BREAKDOWN */}
      {/* <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-gray-600">Paid</span>
          <span className="ml-auto font-semibold">
            ₹{paid.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-gray-600">Pending</span>
          <span className="ml-auto font-semibold">
            ₹{pending.toLocaleString()}
          </span>
        </div>
      </div> */}
    </div>
  );
};

export default PaymentPieChart;
