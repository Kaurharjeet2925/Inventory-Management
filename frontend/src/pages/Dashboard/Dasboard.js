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

const Dashboard = () => {
  /* --------------------------------
     🔑 SINGLE SOURCE OF TRUTH (RANGE)
  ---------------------------------- */
  const [range, setRange] = useState("7days");

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
