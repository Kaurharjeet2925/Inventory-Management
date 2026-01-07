import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import AgentBottomNav from "../../components/AgentBottomNav";
import PageContainer from "../../components/PageContainer";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAgent = user?.role === "delivery-boy";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      {!isAgent && (
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 min-w-0">
            <Header
              onMenuClick={() => setSidebarOpen((s) => !s)}
              sidebarOpen={sidebarOpen}
            />
            <PageContainer>
              <Outlet />
            </PageContainer>
          </div>
        </div>
      )}

      {isAgent && (
        <div className="md:hidden pb-16">
          <main className="px-4 py-4">
            <Outlet />
          </main>
          <AgentBottomNav />
        </div>
      )}
    </div>
  );
};


export default Profile;
