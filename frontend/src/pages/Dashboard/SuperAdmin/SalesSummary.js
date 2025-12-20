import { useEffect, useState } from "react";
import { apiClient } from "../../../apiclient/apiclient";

const SalesSummary = ({ range = "7days" }) => {
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  /* -----------------------------
     Range label mapping
  ------------------------------ */
  const RANGE_LABELS = {
    "7days": "last 7 days",
    "month": "this month",
    "year": "this year",
  };

  /* -----------------------------
     Fetch sales trend (single source)
  ------------------------------ */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(
          `/sales-trend?range=${range}&metric=sales`
        );
        setTrend(res.data || []);
      } catch (err) {
        console.error("Failed to load sales summary", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [range]);

  /* -----------------------------
     Loading state
  ------------------------------ */
  if (loading) {
    return (
      <div className="rounded-xl p-6 w-full h-full animate-pulse bg-gradient-to-r from-indigo-100 via-blue-100 to-cyan-100">
        <div className="h-20 bg-white/40 rounded-md" />
      </div>
    );
  }

  /* -----------------------------
     Total Sales (CORRECT)
  ------------------------------ */
  const totalSales = trend.reduce(
    (sum, item) => sum + (item.sales || 0),
    0
  );

  /* -----------------------------
     UI
  ------------------------------ */
  return (
    <div
      className="rounded-xl p-6 w-full h-full
      bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500
      text-white shadow-lg relative flex flex-col"
    >
      {/* Header */}
      <div className="absolute left-6 top-4 text-xs uppercase opacity-90 tracking-wider">
        Total Sales
      </div>

      {/* Centered Total */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl md:text-6xl font-extrabold leading-none">
            ₹{new Intl.NumberFormat("en-IN").format(totalSales)}
          </div>

          {/* Range text */}
          <div className="text-xs opacity-90 mt-2">
            vs {RANGE_LABELS[range]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesSummary;
