import React from 'react';
import Sidebar from '../components/Sidebar';

const Dasboard = () => {
  return (
	    <div className="flex">
      <Sidebar/>

      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome to Inventory Dashboard</p>
      </div>
    </div>
  );
}

export default Dasboard;
