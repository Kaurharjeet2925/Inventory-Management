import React from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import SuperAdminQuickLinks from "./SuperAdmin/SuperAdminQuickLinks";
import StatsCards from "./SuperAdmin/StatsCards";
import TopProducts from "./SuperAdmin/TopProducts";
import SalesTrendChart from "./SuperAdmin/SalesTrendChart";
import PaymentPieChart from "./SuperAdmin/PaymentPieChart";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-6 ml-64 mt-12">
          {/* PAGE HEADER */}
          <div className="bg-white rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Inventory Management – Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Welcome back! Here's what's happening in your system today.
            </p>

            {/* QUICK LINKS */}
            <div className="mt-4">
              <SuperAdminQuickLinks />
            </div>

            {/* SALES + INVENTORY STATS */}
            <div className="mt-6">
              <StatsCards />
            </div>

            {/* CHARTS SECTION */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* SALES TREND */}
              <SalesTrendChart />

              {/* TOP PRODUCTS */}
              <TopProducts />
            </div>
            <PaymentPieChart />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
