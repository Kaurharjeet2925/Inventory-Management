import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "../components/Sidebar";
import { useState } from "react";
import PageContainer from "./PageContainer";

const SettingsLayout = () => {
 const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1">
          <Header onMenuClick={() => setSidebarOpen((s) => !s)} />
          <div className="flex-1 w-full">
            <PageContainer>
              <Outlet />
            </PageContainer>
          </div>
        </div>
      </div>
    </div>
  );

};

export default SettingsLayout;
