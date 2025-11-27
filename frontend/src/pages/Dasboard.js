import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Package,  ShoppingCart, Clock } from 'lucide-react';
function DashboardCard({ icon, title, value }) {
  return (
    <div className="bg-white shadow rounded-xl p-6 flex flex-col items-center text-center border border-gray-100">
      {icon}
      <h3 className="font-semibold text-md mt-3">{title}</h3>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

const Dashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />

        <main className="ml-64 mt-12 p-6">
          {/* Inventory Dashboard Section */}
          <div className="bg-white rounded-xl shadow p-6">
            <h1 className="text-3xl font-bold">Inventory Management – Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening in your system today.
            </p>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {/* Total Products */}
              <DashboardCard
                icon={<Package size={40} className="text-blue-500" />}
                title="Total Products"
                value="120"
              />

              {/* Low Stock */}
              <DashboardCard
                icon={<ShoppingCart size={40} className="text-yellow-500" />}
                title="Toal Orders"
                value="8"
              />

              {/* Today's Orders */}
              <DashboardCard
                icon={<Clock size={40} className="text-green-500" />}
                title="Pending Orders"
                value="15"
              />

              {/* Pending Orders */}
              <DashboardCard
                icon={<Clock size={40} className="text-red-500" />}
                title="Delieverd Orders"
                value="5"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
