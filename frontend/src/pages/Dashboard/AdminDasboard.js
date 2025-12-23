import AdminStatsCards from "./Admin/AdminStatsCards";
import AdminOrderStatusChart from "./Admin/AdminOrderStatusChart";
import TopProducts from "./SuperAdmin/TopProducts";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import MobileNavbar from "../../components/MobileNavbar";
import { useState } from "react";


const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

      <main className="p-6 mt-14 md:ml-64">
      {/* KPI CARDS */}
      <AdminStatsCards />

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* <div className="lg:col-span-2">
          <AdminOrdersChart />
        </div> */}
        <AdminOrderStatusChart />
      </div>

      {/* TOP PRODUCTS */}
      <TopProducts />
      </main>
    </div>
  );
};

export default AdminDashboard;
