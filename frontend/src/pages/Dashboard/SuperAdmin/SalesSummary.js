import { ArrowUp, ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "../../../apiclient/apiclient";

const SalesSummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/summary?rangeDays=7");
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard summary", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="bg-white rounded-lg px-3 py-2 border border-gray-200 text-sm text-gray-500">Loading...</div>
    );
  }

  const totalSales = data.sales?.total || 0;
  const growth = data.sales?.growth || 0;
  const isPositive = growth >= 0;

  return (
    <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 flex items-center gap-3">
      <div>
        <p className="text-xs text-gray-500">Total Sales</p>
        <p className="text-lg font-bold text-gray-900">₹{totalSales.toLocaleString()}</p>
      </div>

      <div className="flex items-center gap-1 text-sm font-semibold">
        {isPositive ? (
          <ArrowUp size={16} className="text-green-600" />
        ) : (
          <ArrowDown size={16} className="text-red-600" />
        )}
        <span className={isPositive ? "text-green-600" : "text-red-600"}>{Math.abs(growth)}%</span>
        <span className="text-gray-400 text-xs">vs last {data.sales?.periodDays} days</span>
      </div>
    </div>
  );
};

export default SalesSummary;
