import React from "react";
import {
  Clock,
  Truck,
  Package,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "../../../apiclient/apiclient";
import SalesSummary from "./SalesSummary";
import socket from "../../../socket/socketClient";

/* ===============================
   🔹 SALES ACTIVITY CARD
================================ */
const SalesCard = ({ value, unit, label, icon: Icon, color }) => {
  return (
    <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm hover:shadow-md transition text-center">
      
      {/* ICON */}
      <div className={`mx-auto mb-1 flex items-center justify-center 
        w-8 h-8 rounded-full ${color} bg-opacity-15`}>
        <Icon size={18} className={color} />
      </div>

      {/* VALUE */}
      <div className="text-2xl font-bold leading-tight">
        {value}
      </div>

      {/* UNIT
      <div className="text-xs text-gray-500 leading-none">
        {unit}
      </div> */}

      {/* LABEL */}
      <div className="mt-1 text-[11px] text-gray-600 font-bold uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
};

/* ===============================
   🔹 INVENTORY ROW
================================ */
const InventoryRow = ({ label, value, dot }) => {
  return (
    <div className="flex items-center justify-between bg-white rounded-md px-3 py-2 border border-gray-200">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="text-xs text-gray-600">
          {label}
        </span>
      </div>
      <span className="text-sm font-semibold">
        {value}
      </span>
    </div>
  );
};

/* ===============================
   🔹 MAIN COMPONENT
================================ */

const StatsCards = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const res = await apiClient.get("/summary?rangeDays=7");
        console.log('[Dashboard.summary] response.orders:', res.data.orders);
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to load dashboard summary", err);
      } finally {
        setLoading(false);
      }
    }

    // initial load
    loadSummary();

    // Keep cards realtime via socket events
    const events = ["order_created", "order_updated", "order_status_updated", "order_deleted", "order_collected"];
    events.forEach((ev) => socket.on(ev, loadSummary));

    return () => {
      events.forEach((ev) => socket.off(ev, loadSummary));
    };
  }, []);

  // derive values with safe fallbacks
  const pending = summary?.orders?.pending ?? 0;
  // Show shipped only (do not mix with processing)
  const shipped = summary?.orders?.shipped ?? 0;
  const delivered = summary?.orders?.delivered ?? 0;
  const completed = summary?.orders?.completed ?? 0;

  const totalQty = summary?.inventory?.totalQty ?? 0;
  const lowStock = summary?.inventory?.lowStock ?? 0;
  const outOfStock = summary?.inventory?.outOfStock ?? 0;

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">

      {/* ================= SALES ACTIVITY ================= */}
      <div className="lg:col-span-2 bg-blue-50/40 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-xs font-semibold text-blue-700">Sales Activity</h4>

          {/* Small sales summary widget on the right */}
          {/* <div className="ml-4">
            <SalesSummary />
          </div> */}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          <SalesCard
            value={loading ? "..." : (typeof pending === 'number' ? pending.toLocaleString() : pending)}
            label="To Be Packed"
            icon={Clock}
            color="text-blue-600"
          />
          <SalesCard
            value={loading ? "..." : (typeof shipped === 'number' ? shipped.toLocaleString() : shipped)}
            label="To Be Shipped"
            icon={Truck}
            color="text-red-500"
          />
          <SalesCard
            value={loading ? "..." : (typeof delivered === 'number' ? delivered.toLocaleString() : delivered)}
            label="To Be Delivered"
            icon={Package}
            color="text-green-600"
          />
          <SalesCard
            value={loading ? "..." : (typeof completed === 'number' ? completed.toLocaleString() : completed)}
            label="Completed"
            icon={CheckCircle}
            color="text-indigo-600"
          />
        </div>
      </div>

      {/* ================= INVENTORY SUMMARY ================= */}
      <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-100">
        <h4 className="text-xs font-semibold text-emerald-700 mb-3">Inventory Summary</h4>

        <div className="space-y-2">
          <InventoryRow label="Quantity in Hand" value={loading ? "..." : (typeof totalQty === 'number' ? totalQty.toLocaleString() : totalQty)} dot="bg-green-500" />
          <InventoryRow label="Low Stock Items" value={loading ? "..." : (typeof lowStock === 'number' ? lowStock.toLocaleString() : lowStock)} dot="bg-orange-500" />
          <InventoryRow label="Out of Stock Items" value={loading ? "..." : (typeof outOfStock === 'number' ? outOfStock.toLocaleString() : outOfStock)} dot="bg-red-500" />
        </div>
      </div>

    </div>
  );
};

export default StatsCards;
