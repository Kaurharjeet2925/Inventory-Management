import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { apiClient } from "../../../apiclient/apiclient";

const COLORS = {
  Paid: "#22c55e",
  Pending: "#ef4444",
};

const PaymentPieChart = () => {
  const [paid, setPaid] = useState(0);
  const [pending, setPending] = useState(0);
  const [total, setTotal] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null); // 👈 hover control

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get("/payment-summary");

        setPaid(res.data.find(d => d.name === "Paid")?.value || 0);
        setPending(res.data.find(d => d.name === "Pending")?.value || 0);
        setTotal(res.data.find(d => d.name === "TotalAmount")?.value || 0);
      } catch (err) {
        console.error("Payment summary error", err);
      }
    };

    fetchData();
  }, []);

  const chartData = [
    { name: "Paid", value: paid },
    { name: "Pending", value: pending },
  ];

  const activeSlice =
    activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 w-full h-64 mb-3 ">
      <h4 className="text-sm font-semibold text-gray-700">
        Payment Status
      </h4>

      {/* 👇 Wrapper handles hover-out */}
      <div
        className="relative h-56"
        onMouseLeave={() => setActiveIndex(null)} // reset to Total
      >
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
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[entry.name]}
                      onMouseEnter={() => setActiveIndex(index)} // Paid / Pending
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* 🔹 CENTER TEXT */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {activeSlice ? (
                <>
                  <span className="text-xs text-gray-500">
                    {activeSlice.name}
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      activeSlice.name === "Paid"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ₹{activeSlice.value.toLocaleString()}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-lg font-bold text-gray-800">
                    ₹{total.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentPieChart;
