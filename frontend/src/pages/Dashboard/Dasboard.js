import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import SuperAdminQuickLinks from "./SuperAdmin/SuperAdminQuickLinks";
import StatsCards from "./SuperAdmin/StatsCards";
import TopProducts from "./SuperAdmin/TopProducts";
import SalesTrendChart from "./SuperAdmin/SalesTrendChart";
import PaymentPieChart from "./SuperAdmin/PaymentPieChart";
import SalesSummary from "./SuperAdmin/SalesSummary";

import MobileNavbar from "../../components/MobileNavbar";
import UserStatsRows from "./SuperAdmin/StackedCountCard";
const Dashboard = () => {
  const [range, setRange] = useState("7days");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* MOBILE NAVBAR */}
      <MobileNavbar
        title="Dashboard"
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* DESKTOP HEADER */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* MAIN CONTENT */}
      <main className="pt-16 md:pt-20 md:ml-64 px-4 md:px-6 pb-6">

        {/* PAGE HEADER */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Inventory Management – Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Welcome back! Here's what's happening today.
          </p>

          {/* QUICK LINKS */}
          <div className="mt-6">
            <SuperAdminQuickLinks />
          </div>

          {/* STATS */}
          <div className="mt-6">
            <StatsCards />
          </div>

          {/* SALES SECTION */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SalesTrendChart range={range} setRange={setRange} />
            </div>
            <div>
              <SalesSummary range={range} />
            </div>
          </div>

          {/* LOWER SECTION */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <TopProducts />
            </div>
            <div className="lg:col-span-1 ">
              <PaymentPieChart /></div>
            <UserStatsRows />
          </div>
        </div>
      </main>
    </div>
  );
};


export default Dashboard;
