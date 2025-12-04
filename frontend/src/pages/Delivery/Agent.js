import React from "react";
import AgentNavbar from "../../components/AgentNavbar";
import AgentBottomNav from "../../components/AgentBottomNav";
import { Outlet } from "react-router-dom";

const Agent = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* FIXED TOP NAVBAR */}
      <AgentNavbar />

      {/* MAIN CONTENT — NOW SCROLLABLE */}
      <div className="flex-1 overflow-y-auto pt-20 pb-20 px-3 md:px-6">
        <Outlet />
      </div>

      {/* FIXED BOTTOM NAVBAR */}
      <AgentBottomNav />
    </div>
  );
};

export default Agent;
