import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import SuperAdminQuickLinks from "./SuperAdmin/SuperAdminQuickLinks";
import StatsCards from "./SuperAdmin/StatsCards";
import TopProducts from "./SuperAdmin/TopProducts";
import SalesTrendChart from "./SuperAdmin/SalesTrendChart";
import PaymentPieChart from "./SuperAdmin/PaymentPieChart";
import SalesSummary from "./SuperAdmin/SalesSummary";
import StackedCountCard from "./SuperAdmin/StackedCountCard";
import MobileNavbar from "../../components/MobileNavbar";
const Dashboard = () => {
  /* --------------------------------
     🔑 SINGLE SOURCE OF TRUTH (RANGE)
  ---------------------------------- */
  const [range, setRange] = useState("7days");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
    

  return (
    <div className="min-h-screen bg-gray-50">

      {/* MOBILE NAVBAR */}
    <MobileNavbar
        title="Dashboard"
        onMenuClick={() => setSidebarOpen(prev => !prev)}
      />

      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* HEADER (DESKTOP ONLY VISUALLY) */}
     <Header onMenuClick={() => setSidebarOpen(prev => !prev)} />



        <main className=" mt-14 md:ml-64">

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

            {/* =======================
                SALES SECTION
            ======================== */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">

              {/* SALES TREND (Controls Range) */}
              <div className="lg:col-span-2">
                <SalesTrendChart
                  range={range}
                  setRange={setRange}
                />
              </div>

              {/* SALES SUMMARY (React to Range) */}
              <div className="lg:col-span-1">
                <SalesSummary range={range} />
              </div>

            </div>

            {/* PAYMENT STATUS */}
             <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
               <div className="lg:col-span-2">
               <TopProducts />
               </div>
               <div className="lg:col-span-1">
              <PaymentPieChart /></div>
               <div className="lg:col-span-1">
            <StackedCountCard/>
            </div>
            </div>
           
            {/* TOP PRODUCTS */}
            <div className="mt-6">
             
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
