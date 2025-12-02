import React from "react";
import AgentNavbar from "../../components/AgentNavbar";
import AgentBottomNav from "../../components/AgentBottomNav";
import { Outlet } from "react-router-dom";

const Agent = () => {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* TOP NAVBAR */}
      <AgentNavbar />

      {/* MAIN CONTENT WRAPPER */}
      <div className="pt-20 pb-20 px-3 md:px-6">
        <Outlet />
      </div>

      {/* BOTTOM NAVBAR (MOBILE ONLY) */}
      <AgentBottomNav />
    </div>
  );
};

export default Agent;
