import { useEffect, useState } from "react";
import { apiClient } from "../../../apiclient/apiclient";

const UserStatsRows = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clients: 0,
    admins: 0,
    delivery: 0,
  });

  /* ----------------------------
     LOAD USER STATS
  ----------------------------- */
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await apiClient.get("/user-stats");

        setStats({
          clients: res.data.clients || 0,
          admins: res.data.admins || 0,
          delivery: res.data.delivery || 0,
        });
      } catch (err) {
        console.error("Failed to load user stats", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  /* ===============================
     🔹 STAT ROW
  ================================ */
  const StatRow = ({ label, value, dot }) => (
    <div className="flex items-center justify-between bg-white rounded-md px-3 py-2 border border-gray-200 h-10 gap-2">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-semibold">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );

  /* ----------------------------
     LOADING
  ----------------------------- */
  if (loading) {
    return (
      <div className="h-40 w-full rounded-xl bg-gray-100 animate-pulse" />
    );
  }

  /* ----------------------------
     UI
  ----------------------------- */
  return (
    <div className="bg-indigo-50/40 rounded-xl p-4 border border-indigo-100 h-64">
      <h4 className="text-sm font-semibold text-indigo-700 mb-5">
        User Summary
      </h4>

      <div className="space-y-4">
        <StatRow
          label="Clients"
          value={stats.clients}
          dot="bg-purple-500"
        />
        <StatRow
          label="Admins"
          value={stats.admins}
          dot="bg-orange-500"
        />
        <StatRow
          label="Delivery Partners"
          value={stats.delivery}
          dot="bg-emerald-500"
        />
      </div>
    </div>
  );
};
  
export default UserStatsRows;
