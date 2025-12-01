import React from 'react';
import Sidebar from '../../components/Sidebar';
import { Outlet } from "react-router-dom";
import Header from '../../components/Header';

const DeliveryBoys = () => {
  return (
    <div className="flex w-full items-start">
      <Sidebar />
      <Header />
      <div className="flex-1 bg-gray-100 p-6 w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default DeliveryBoys;
