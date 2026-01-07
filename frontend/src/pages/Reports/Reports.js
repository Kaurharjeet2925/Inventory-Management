import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Outlet } from "react-router-dom";
import Header from '../../components/Header';
import PageContainer from '../../components/PageContainer';

const Reports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="w-full min-h-screen ">
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

export default Reports;
