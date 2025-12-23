import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import AgentBottomNav from "../../components/AgentBottomNav";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAgent = user?.role === "delivery-boy";

  return (
    <div className="w-full min-h-screen bg-slate-50 overflow-x-hidden">

      {/* ===== ADMIN DESKTOP ===== */}
      {!isAgent && (
        <div className="hidden md:flex">
          <Sidebar />
          <div className="flex-1">
            <Header />
            <main className="px-4 sm:px-6 lg:px-8 py-6">
              <Outlet />
            </main>
          </div>
        </div>
      )}

      {/* ===== AGENT + MOBILE ===== */}
      {isAgent && (
        <div className="md:hidden pb-16">
          <main className="px-4 py-4">
            <Outlet />
          </main>

          {/* ✅ ALWAYS SHOW BOTTOM NAV FOR AGENT */}
          <AgentBottomNav />
        </div>
      )}
    </div>
  );
};

export default Profile;
