import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import MobileNavbar from "../../components/MobileNavbar";

import SuperAdminQuickLinks from "./SuperAdmin/SuperAdminQuickLinks";
import StatsCards from "./SuperAdmin/StatsCards";
import TopProducts from "./SuperAdmin/TopProducts";
import SalesTrendChart from "./SuperAdmin/SalesTrendChart";
import PaymentPieChart from "./SuperAdmin/PaymentPieChart";
import SalesSummary from "./SuperAdmin/SalesSummary";
import UserStatsRows from "./SuperAdmin/StackedCountCard";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const Dashboard = () => {
  const [range, setRange] = useState("7days");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
const user = JSON.parse(localStorage.getItem("user"));
const userName = user?.name || user?.firstName || "User";
  const isSuperAdmin = true; // later from auth

  useEffect(() => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem("dashboardLastVisit");

    if (lastVisit !== today) {
      // First login of the day
      setGreeting(getGreeting());
      localStorage.setItem("dashboardLastVisit", today);
    } else {
      setGreeting("Welcome back");
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">

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

      {/* HEADER */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* MAIN CONTENT */}
      <main className="pt-16 md:ml-64 px-4 md:px-6 pb-8">

        {/* PAGE HEADER */}
        <div className="mb-6 mt-4">
  <h1 className="text-2xl font-semibold text-slate-800">
    {greeting},<span className="text-amber-500 capitalize"> {userName}</span>
  </h1>

  <p className="text-slate-500 mt-1 text-sm">
    Let’s take a look at today’s overview.
  </p>
</div>

        {/* QUICK LINKS */}
        <div className="mb-6">
          <SuperAdminQuickLinks />
        </div>

        {/* STATS */}
        <div className="mb-6">
          <StatsCards />
        </div>

        {/* SALES SECTION */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 hover:shadow-md hover:bg-amber-500/5 transition">
            <SalesTrendChart range={range} setRange={setRange} />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md hover:bg-amber-500/5 transition">
            <SalesSummary range={range} />
          </div>
        </div>

        {/* LOWER SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 hover:shadow-md hover:bg-amber-500/5 transition">
            <TopProducts />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md hover:bg-amber-500/5 transition">
            <PaymentPieChart />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md hover:bg-amber-500/5 transition">
            <UserStatsRows />
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
