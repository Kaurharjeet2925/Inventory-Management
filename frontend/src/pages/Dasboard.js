import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Dasboard = () => {
  return (
	    <div className="flex">
      <Sidebar/>
       <Header />
       <div className="ml-64 mt-12 p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome to Inventory Dashboard</p>
      </div>
    </div>
  );
}

export default Dasboard;
